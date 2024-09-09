import { Body, Controller, Delete, Get, Post, Query, Request, Route, Security, Tags } from 'tsoa';
import {
    ProfileCreateInterfaceRequestModel
} from '../../model/profile/request-model/profile-create.interface.request-model';
import { ProfileDBM } from '../../model/profile/mongo-model/profile.contract';
import { catchError, firstValueFrom, from, of, switchMap, throwError } from 'rxjs';
import { SystemErrorCode } from '../../system-types/system-error-code.enum';
import { ISystemError } from '../../system-types/system-error.interface';
import { isDefined } from '../../utils/is-defined.util';
import { IProfile } from '../../model/profile/interfaces/profile.interface';
import { UserScope } from '../../utils/type-handlers/user-scope';
import { IRole } from '../../model/role/interfaces/role.interface';

@Tags('Profile')
@Route("/api/v1/profile")
export class PersonController extends Controller{

    @Post('create')
    @Security('jwt')
    public async createProfile(@Body() dto: ProfileCreateInterfaceRequestModel){
        const executable = from(ProfileDBM.create({...dto}))
            .pipe(
                catchError((err) => {
                    return throwError(() => {
                        return {
                            error: SystemErrorCode.CREATE_FAILED,
                            description: 'Unable to create profile'
                        } as ISystemError
                    })
                })
            )

        const result = await firstValueFrom(executable);

        if ((result as any as ISystemError).error){
            this.setStatus((result as any as ISystemError).error);

            return result as IProfile;
        }

        return result as IProfile;
    }

    @Post('update')
    @Security('jwt')
    public async updateProfile(@Body() dto: Omit<ProfileCreateInterfaceRequestModel, 'guid'>, @Request() rq: UserScope){
        const executable = from(ProfileDBM.findOne({guid: rq.user.guid}))
            .pipe(
                switchMap((data) => {
                    if(!data){
                        return throwError(() => 'No profile!')
                    }

                    data!.firstName = dto.firstName;
                    data!.secondName = dto.secondName;
                    data!.link = dto.link;
                    data!.phone = dto.phone;
                    data.isActive = true;

                    return from(data!.save())
                }),
                catchError((err) => {
                    return throwError(() => {
                        return {
                            error: SystemErrorCode.CREATE_FAILED,
                            description: 'Unable to update profile'
                        } as ISystemError
                    })
                })
            )

        const result = await firstValueFrom(executable);

        if ((result as any as ISystemError).error){
            this.setStatus((result as any as ISystemError).error);

            return result as IProfile;
        }

        return result as IProfile;
    }

    @Get('identifyMyself')
    @Security('jwt')
    public async getProfileFromRequest(@Request() guid: UserScope){
        const executable = from(ProfileDBM.findOne({guid: guid.user.guid}))
            .pipe()

        const result = await firstValueFrom(executable);

        if(isDefined(result)){
            return result as IProfile;
        }

        return null;
    }

    @Get('identity')
    @Security('jwt')
    public async getProfile(@Query() guid: string){
        const executable = from(ProfileDBM.findOne({guid: guid}))
            .pipe()

        const result = await firstValueFrom(executable);

        if(isDefined(result)){
            return result as IProfile;
        }

        return null;
    }

    @Post('avatar')
    @Security('jwt')
    public async setAvatar(@Body() picData: { b64: string }, @Request() rq: UserScope){
        const executable = from(ProfileDBM.findOne({ guid: rq.user.guid }))
            .pipe(
                switchMap((user) => {
                    if (!user){
                        return throwError(() => `No user founded with guid ${rq.user.guid}`)
                    }

                    user.picture = picData.b64;

                    return from(user.save());
                })
            )

        const result = await firstValueFrom(executable)

        return (result.toObject() as IProfile);
    }

    @Post('favourite')
    @Security('jwt')
    public async addFavourite(@Body() deviceGuid: { guid: string }, @Request() rq: UserScope){
        const executable = from(ProfileDBM.findOne({guid: rq.user.guid}))
            .pipe(
                switchMap((user) => {
                    if (!user){
                        return throwError(() => `No user founded with guid ${rq.user.guid}`)
                    }
                    user.favouriteDevices?.push(deviceGuid.guid)

                    return from(user.save());
                })
            )

        const result = await firstValueFrom(executable)

        return (result.toObject() as IProfile);
    }

    @Delete('favourite')
    @Security('jwt')
    public async removeFavourite(@Body() deviceGuid: { guid: string }, @Request() rq: UserScope){
        const executable = from(ProfileDBM.findOne({guid: rq.user.guid}))
            .pipe(
                switchMap((user) => {
                    if (!user){
                        return throwError(() => `No user founded with guid ${rq.user.guid}`)
                    }
                    const index: number | undefined = user.favouriteDevices?.findIndex((a) => a === deviceGuid.guid);

                    if (!isDefined(index)){
                        return throwError(() => `Can not to allocate device with current guid`);
                    }

                    user.favouriteDevices?.splice(index, 1);

                    return from(user.save());
                })
            )

        const result = await firstValueFrom(executable)

        return (result.toObject() as IProfile);
    }

    @Get('employee')
    @Security('jwt')
    public async getAllEmployees(@Query('orgGuid') guid: string, @Request() rq: UserScope){
        const executable = from(ProfileDBM.findOne({guid: rq.user.guid}))
            .pipe(
                switchMap((user) => {
                    if(user!.symlinkedWith.includes(guid)){
                        return from(ProfileDBM.find({symlinkedWith: {$in: [guid]}, isActive: true}))
                    }

                    return throwError(() => 'accessRestricted')
                }),
                catchError((err) => {
                    if(err === 'accessRestricted'){
                        this.setStatus(SystemErrorCode.NO_ACCESS)
                    }

                    return of({
                        description: 'You have not access to this organization',
                        error: SystemErrorCode.NO_ACCESS
                    } as ISystemError)
                })
            )

        const result = await firstValueFrom(executable);

        if ((result as ISystemError).error){
            return result as ISystemError
        }

        return result as any as IRole[]
    }


}
