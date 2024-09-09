import { Body, Controller, Get, Post, Query, Request, Route, Security, Tags } from 'tsoa';
import { DeviceInterface } from '../../model/device/interfaces/device.interface';
import { firstValueFrom, from, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { DeviceDBM } from '../../model/device/mongo-model/device.contract';
import { randomUUID } from 'crypto';
import { QueueDBM } from '../../model/queue/mongo-model/queue.contract';
import dayjs from 'dayjs';
import { UserScope } from '../../utils/type-handlers/user-scope';
import { RoleDBM } from '../../model/role/mongo-model/role.contract';
import { SystemRole } from '../../system-types/systemRole/system-role.enum';
import { IRole } from '../../model/role/interfaces/role.interface';
import { injectable } from 'tsyringe';
import { SseService } from '../../services/sse/sse.service';
import { SSEEventName } from '../../services/sse/enum/event-name.enum';
import { Document } from 'mongoose';
import { ProfileDBM } from '../../model/profile/mongo-model/profile.contract';
import { IProfile } from '../../model/profile/interfaces/profile.interface';

@Tags('Device')
@Route("/api/v1/device")
@injectable()
export class DeviceController extends Controller{

    constructor(
        private _sse: SseService
    ) {
        super();
    }

    @Post('create')
    @Security('jwt')
    public async createDevice(@Body() data: Omit<DeviceInterface, 'guid'>, @Request() rq: UserScope){
        const device: DeviceInterface = {...data, guid: randomUUID()}

        const executable = from(DeviceDBM.create(device))
            .pipe(
                switchMap((data) => {
                    return from(QueueDBM.create({
                        guid: data.guid,
                        userInQueueList: [],
                        lastChangeUtc: dayjs().toDate(),
                        inHandUserId: null,
                    })).pipe(
                        map(() => data)
                    )
                }),
                tap((device) => {
                    from(ProfileDBM.find({symlinkedWith: data.symlinkedWith}))
                        .pipe(
                            tap((profileList) => {
                                this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.deviceUpdate)
                            }),
                            take(1)
                        )
                        .subscribe();
                })
            )

        const result = await firstValueFrom(executable)

        return result.toObject() as DeviceInterface;
    }

    @Get('list')
    @Security('jwt')
    public async getAllDevice(@Request() rq: UserScope, @Query('orgGuid') guid: string ){
        let executable: Observable<any>;
        // this._sse.sendEvent([rq.user.guid!], 'Getted', 'EventOrg', 'sad')

        // console.log(rq.user);

        if(rq.user.scopes.includes(SystemRole.root)){
            executable = from(DeviceDBM.find({symlinkedWith: guid}))
        }
        if(!rq.user.scopes.includes(SystemRole.root)) {
            executable = from(RoleDBM.find({
                $and:
                    [
                        {
                            $or: [
                                {userList: rq.user.guid},
                                {ownerList: rq.user.guid},
                                {adminList: rq.user.guid}
                            ]
                        },
                        {
                            organizationGuid: guid
                        }
                    ]

            }))
                .pipe(
                    switchMap((data) => {
                        console.log(data);
                        const dataList: IRole[] = data as any as IRole[];

                        const targetList: string[] = [ ...new Set(dataList.map((role: IRole) => role.deviceList).reduce((acc, devList) => [ ...acc, ...devList ], [])) ]

                        return from(DeviceDBM.find({guid: {$in: targetList}}))
                    }),
                    map((data) => (data as any as Array<Document>).map((q: Document) => q.toObject()))
                )
        }

        const result = await firstValueFrom(executable! ?? of([]))

        this.setStatus(200);

        return result as any as DeviceInterface[];
    }
}
