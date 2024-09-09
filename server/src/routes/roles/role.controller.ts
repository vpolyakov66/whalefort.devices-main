import { Body, Controller, Get, Patch, Post, Query, Request, Route, Security, Tags } from 'tsoa';
import { firstValueFrom, from, map, of, switchMap, take, tap } from 'rxjs';
import { RoleDBM } from '../../model/role/mongo-model/role.contract';
import { randomUUID } from 'crypto';
import { UserScope } from '../../utils/type-handlers/user-scope';
import { IRole } from '../../model/role/interfaces/role.interface';
import { injectable } from 'tsyringe';
import { RoleAuthorizerService } from '../../services/role-authorizer/role-authorizer.service';
import { AccessType } from '../../model/role/enums/access-type.enum';
import { SystemErrorCode } from '../../system-types/system-error-code.enum';
import { ISystemError } from '../../system-types/system-error.interface';
import { fileSync } from 'find';
import { Document } from 'mongoose';
import { SseService } from '../../services/sse/sse.service';
import { SSEEventName } from '../../services/sse/enum/event-name.enum';
import { IProfile } from '../../model/profile/interfaces/profile.interface';
import { ProfileDBM } from '../../model/profile/mongo-model/profile.contract';

@injectable()
@Tags('Role')
@Route("/api/v1/role")
export class RoleController extends Controller{

    constructor(
        private _authorizer: RoleAuthorizerService,
        private _sse: SseService,
    ) {
        super();
    }

    @Post('create')
    @Security('jwt')
    public async createRole(@Body() roleDto: Omit<IRole, 'guid'>, @Request() rq: UserScope){
        const executable = from(RoleDBM.create({
            guid: randomUUID(),
            ownerList: roleDto.ownerList,
            alias: roleDto.alias,
            adminList: roleDto.adminList,
            deviceList: [],
            userList: roleDto.userList,
            organizationGuid: roleDto.organizationGuid
        }))
            .pipe(
                tap(() => {
                    from(ProfileDBM.find({symlinkedWith: roleDto.organizationGuid}))
                        .pipe(
                            tap((profileList) => {
                                this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.roleUpdated)
                            }),
                            take(1)
                        )
                        .subscribe();
                })
            )

        const result = await firstValueFrom(executable);

        return result.toObject() as any as IRole;
    }

    @Patch('edit')
    @Security('jwt')
    public async editRole(@Body() roleDto: IRole, @Request() rq: UserScope){
        console.log(roleDto.alias)
        const executable = this._authorizer.resolveManagment(rq.user.guid, roleDto.guid)
            .pipe(
                switchMap((access: AccessType) => {
                    if(access === 1){
                        return from(RoleDBM.findOneAndUpdate({guid: roleDto.guid}, roleDto))
                            .pipe(
                                switchMap(() => {
                                    return from(RoleDBM.findOne({guid: roleDto.guid}))
                                })
                            );
                    }

                    return of(null)
                }),
                tap(() => {
                    from(ProfileDBM.find({symlinkedWith: roleDto.organizationGuid}))
                        .pipe(
                            tap((profileList) => {
                                this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.roleUpdated)
                            }),
                            take(1)
                        )
                        .subscribe();
                })
            )

        const result = await firstValueFrom(executable);

        console.log(result?.alias);

        if (result === null){
            this.setStatus(SystemErrorCode.NO_ACCESS)

            return result as null;
        }

        return result.toObject() as any as IRole
    }

    @Get('all')
    @Security('jwt')
    public async getAllRoles(@Query('orgGuid') guid: string){
        if(!guid){
            this.setStatus(405);

            return {description: 'No provided orgGuid', error: SystemErrorCode.NOT_FOUND } as ISystemError
        }

        const executable = from(RoleDBM.find({organizationGuid: guid}))
            .pipe(
                map((data) => (data as any as Array<Document>).map((q) => q.toObject()))
            )

        return await firstValueFrom(executable) as IRole[];
    }

    @Get('info')
    @Security('jwt')
    public async getRole(@Request() rq: UserScope){
        const executable = from(RoleDBM.find({ $or: [
                {userList: rq.user.guid},
                {ownerList: rq.user.guid},
                {adminList: rq.user.guid}
            ]}))
            .pipe(
                map((data) => (data as any as Array<Document>).map((q) => q.toObject()))
            )

        const result = await firstValueFrom(executable);

        return result as any as IRole[];
    }
}
