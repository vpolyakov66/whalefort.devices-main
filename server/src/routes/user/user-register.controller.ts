import { catchError, firstValueFrom, forkJoin, from, map, of, switchMap, take, tap, throwError } from 'rxjs';
import { Body, Controller, Get, Post, Query, Request, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { Router } from 'express';
import { randomUUID } from 'crypto';
import * as jwt from "jsonwebtoken";
import { config } from 'dotenv';
import { compare } from 'bcrypt';
import { ISystemError } from '../../system-types/system-error.interface';
import { UserIdenityDBM, UserIdentityContract } from '../../model/user/mongo-model/user-identity.contract';
import { SystemRole } from '../../system-types/systemRole/system-role.enum';
import { SystemErrorCode } from '../../system-types/system-error-code.enum';
import { isDefined } from '../../utils/is-defined.util';
import { IExpressController } from '../../utils/transformer/express-controller.interface';
import { TokenPayloadInterface } from '../../model/user/interfaces/token-payload.interface';
import { UserIdentityInterface } from '../../model/user/interfaces/user-identity.interface';
import { OrganizationDBM } from '../../model/organization/mongo-model/organization.contract';
import { ProfileDBM } from '../../model/profile/mongo-model/profile.contract';


interface IJWTPayload {
    accessToken: string;
    refreshToken: string;
}

@Tags('Identity')
@Route("/api/v1/identity")
export class IdentityController extends Controller implements IExpressController{
    public path: string = '/api/v1/identity'
    public router: Router = Router();

    constructor() {
        super();
    }

    @Get('available?{username}')
    public async availableUsername(@Query() username: string){
        const execute = from(UserIdenityDBM.find({username: username}))
            .pipe(
                map((dataList) => {
                    if(Array.isArray(dataList)){
                        return !dataList.length
                    }

                    return !dataList
                }),
                catchError((err) => {
                    err.log()

                    return of(null)
                })
            )

        const result = await firstValueFrom(execute);

        if(result === null){
            this.setStatus(405)

            return 'Unknown error'
        }

        return result;
    }
    @Post("register/admin")
    @SuccessResponse("200", "Created")
    public async registerIdentity(@Body() body: Omit<UserIdentityInterface, 'guid'>) {
        const identityModel: UserIdentityInterface = {...body};

        identityModel.guid = this.generateGuid();
        identityModel.scopeList = [SystemRole.root]

        const execute = from(UserIdenityDBM.create({...identityModel}))
            .pipe(
                tap((info) => {
                    console.log(info);
                }),
                catchError((err) => {
                    console.error(err)

                   return of(null);
                }),
                take(1),
            )

        const result = await firstValueFrom(execute) as UserIdentityContract

        if (result){
            this.setStatus(200)

            const jwt = this.signJWT(identityModel, [SystemRole.admin])

            return { guid: identityModel.guid, ...jwt }
        } else {
            this.setStatus(405)

            return;
        }
    }

    @Post("register/reserve")
    @SuccessResponse("200", "Created")
    @Security('jwt', [SystemRole.root, SystemRole.admin])
    public async reserveUser(@Body() dto: {symlinkGuid: string}) {
        const identityModel: UserIdentityInterface = {} as any as UserIdentityInterface;

        identityModel.guid = this.generateGuid();
        identityModel.scopeList = [SystemRole.user]


        const execute = from(UserIdenityDBM.create({...identityModel}))
            .pipe(
                tap((info) => {
                    console.log(info);
                }),
                switchMap((data) => {
                   return from(ProfileDBM.findOne({guid: data.guid}))
                       .pipe(
                           switchMap((profile) => {
                               profile!.symlinkedWith.push(dto.symlinkGuid)

                               return from(profile!.save());
                           }),
                           map(() => data)
                       )
                }),
                catchError((err) => {
                    console.error(err)

                    return of(null);
                }),
                take(1),
            )

        const result = await firstValueFrom(execute) as UserIdentityContract

        if (result){
            this.setStatus(200)

            return { guid: identityModel.guid }
        } else {
            this.setStatus(405)

            return;
        }
    }

    @Post("register/user")
    @SuccessResponse("200", "Created")
    public async registerUserOverGuid(@Body() body: UserIdentityInterface) {
        const identityModel: UserIdentityInterface = {...body};

        identityModel.scopeList = [SystemRole.user]

        const execute = from(UserIdenityDBM.find({guid: body.guid}))
            .pipe(
                switchMap((info) => {
                    const infoArr = (info as any as Array<UserIdentityInterface>);

                    if(info && infoArr.length === 1 && !isDefined(infoArr[0].username)){
                        return from(UserIdenityDBM.create({...identityModel}))
                    }

                    return throwError(() => 'Already registred')
                }),
                catchError((err) => {
                    console.error(err)

                    return of(null);
                }),
                take(1),
            )

        const result = await firstValueFrom(execute) as UserIdentityContract

        if (result){
            this.setStatus(200)

            const jwt = this.signJWT(identityModel, [SystemRole.admin])

            return { guid: identityModel.guid, ...jwt }
        } else {
            this.setStatus(405)

            return;
        }
    }

    @Post('refresh')
    public async refreshToken(@Body() dto: { refreshToken: string, authToken: string }){
        const payload = jwt.verify(dto.refreshToken, config().parsed?.['JWT_REFRESH_SECRET']!)
        // const payload = undefined
        console.log(payload);


        if(!payload){
            this.setStatus(405);

            return;
        }

        const executable = from(UserIdenityDBM.findOne({guid: (payload as any).guid!}))

        const result = await firstValueFrom(executable) as UserIdentityContract

        if (result){
            this.setStatus(200)

            return this.signJWT(result, result.scopeList)
        } else {
            this.setStatus(405)

            return;
        }
    }

    /**
     * Авторизация пользователя
     * @param userIdentity Данные от УЗ
     */
    @Post('login')
    @Response(SystemErrorCode.NOT_FOUND, 'Пользователь не найден в БД')
    @SuccessResponse("200", "Чупапи-муняню")
    @Response(SystemErrorCode.INCORRECT_PASSWORD, 'Неправильный пароль')
    public async login(@Body() userIdentity: Omit<UserIdentityInterface, 'guid'>): Promise<IJWTPayload>{
        const executable = from(UserIdenityDBM.findOne({ username: userIdentity.username }))
            .pipe(
                switchMap((userModel) => {
                    if (!isDefined(userModel)){
                        return throwError(() => {
                            return {
                                error: SystemErrorCode.NOT_FOUND,
                                description: 'Unable to find any identity with provided username'
                            } as ISystemError
                        })
                    }

                    return forkJoin([of(userModel), compare(userIdentity.password, userModel.password)])
                }),
                map(([userModel,isCorrectSession]: [UserIdentityInterface, boolean]) => {
                    if (isCorrectSession) {
                        console.log(userModel);
                        return this.signJWT(userModel, userModel.scopeList)
                    }

                    return {
                        error: SystemErrorCode.INCORRECT_PASSWORD,
                        description: 'Incorrect password'
                    } as ISystemError
                }),
                catchError((err) => of(err))
            )

        const result = await firstValueFrom(executable);

        if (result.error){
            this.setStatus(result.error);

            return result;
        }

        return result;
    }

    @Get('secure')
    @Security('api')
    public async isAdminSecured(@Request() r: any): Promise<boolean>{
        this.setStatus(200);
        console.log(r.user);

        return true;
    }


    private generateGuid(): string{
        return randomUUID();
    }

    private signJWT(model:UserIdentityInterface, scopeList: SystemRole[] = []): IJWTPayload{
        const payload: TokenPayloadInterface = {
            scopes: scopeList,
            guid: model.guid!
        }

        console.log(scopeList);

        const accessToken: string = jwt.sign(payload, config().parsed?.['JWT_SECRET']!, {expiresIn: config().parsed?.["JWT_TOKEN_LIFETIME"]})
        const refreshToken: string = jwt.sign({guid: model.guid}, config().parsed?.['JWT_REFRESH_SECRET']!, {expiresIn: config().parsed?.["JWT_REFRESH_TOKEN_LIFETIME"]})

        return {accessToken, refreshToken}
    }
}
