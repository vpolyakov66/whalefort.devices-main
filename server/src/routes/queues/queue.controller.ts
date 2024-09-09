import { Body, Controller, Get, Post, Query, Request, Route, Security, Tags } from 'tsoa';
import { injectable } from 'tsyringe';
import { HistoryMoonService } from '../../services/history-moon/history-moon.service';
import { QueueDaemonService } from '../../services/queueDaemon/queue-daemon.service';
import { SystemRole } from '../../system-types/systemRole/system-role.enum';
import { firstValueFrom, from, map, switchMap, take, tap, throwError } from 'rxjs';
import { QueueDBM } from '../../model/queue/mongo-model/queue.contract';
import dayjs from 'dayjs';
import { UserScope } from '../../utils/type-handlers/user-scope';
import { QueueInterface } from '../../model/queue/interfaces/queue.interface';
import { ISystemError } from '../../system-types/system-error.interface';
import { SystemErrorCode } from '../../system-types/system-error-code.enum';
import { Document } from 'mongoose';
import { ProfileDBM } from '../../model/profile/mongo-model/profile.contract';
import { IProfile } from '../../model/profile/interfaces/profile.interface';
import { SSEEventName } from '../../services/sse/enum/event-name.enum';
import { SseService } from '../../services/sse/sse.service';
import { DeviceDBM } from '../../model/device/mongo-model/device.contract';
import { HistoryEventType } from '../../model/event/enum/history-event.type';

@injectable()
@Tags('Queue')
@Route('/api/v1/queue')
export class QueueController extends Controller{

    constructor(
        private _historyMoon: HistoryMoonService,
        private _queueDaemon: QueueDaemonService,
        private _sse: SseService,
    ) {
        super();
    }

    @Post('join')
    @Security('jwt')
    public async standInQueue(@Body() data: { deviceGuid: string }, @Request() payload: UserScope){
        const executable = from(QueueDBM.findOne({guid: data.deviceGuid}))
            .pipe(
                switchMap((query) => {
                    if(query!.userInQueueList.length === 0){
                        query!.lastChangeUtc = dayjs().toDate();
                    }

                    query!.userInQueueList.push(payload.user.guid)

                    this._queueDaemon.beginModeration(data.deviceGuid);

                    return from(query!.save());
                }),
                tap((query) => {
                    this._historyMoon.sentEvent(HistoryEventType.deviceQueue, payload.user.guid, data.deviceGuid)
                    from(DeviceDBM.findOne({ guid: data.deviceGuid }))
                        .pipe(
                            switchMap((dev) => from(ProfileDBM.find({symlinkedWith: dev!.symlinkedWith}))),
                            tap((profileList) => {
                                this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.queueUpdate)
                            }),
                            take(1)
                        )
                        .subscribe();
                })
            )

        const result = await firstValueFrom(executable);

        return result as any as QueueInterface;
    }

    @Post('take')
    @Security('jwt')
    public async takeDevice(@Body() data: { deviceGuid: string }, @Request() payload: UserScope){
        const executable = from(QueueDBM.findOne({guid: data.deviceGuid}))
            .pipe(
                switchMap((query) => {
                    if(query!.userInQueueList[0] === payload.user.guid){
                        query!.lastChangeUtc = dayjs().toDate();
                        query!.inHandUserId = payload.user.guid;

                        return from(query!.save())
                            .pipe(map(() => query!.toObject()));
                    }

                    return throwError(() => {
                        this.setStatus(409);

                        return ({ error: SystemErrorCode.NO_ACCESS, description: 'вы не в очереди'} as ISystemError)
                    })

                }),
                tap(() => {
                    this._historyMoon.sentEvent(HistoryEventType.deviceTake, payload.user.guid, data.deviceGuid)
                    from(DeviceDBM.findOne({ guid: data.deviceGuid }))
                        .pipe(
                            switchMap((dev) => from(ProfileDBM.find({symlinkedWith: dev!.symlinkedWith}))),
                            tap((profileList) => {
                                this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.queueUpdate)
                            }),
                            take(1)
                        )
                        .subscribe();
                })
            )

        const result = await firstValueFrom(executable);

        return result as any as QueueInterface;
    }

    @Post('takeoff')
    @Security('jwt')
    public async laydownDevice(@Body() data: { deviceGuid: string }, @Request() payload: UserScope){
        const executable = from(QueueDBM.findOne({guid: data.deviceGuid}))
            .pipe(
                switchMap((query) => {
                    if(query!.inHandUserId === payload.user.guid ){
                        query!.lastChangeUtc = dayjs().toDate();

                        query!.inHandUserId = null;
                        query!.userInQueueList.splice(0, 1);

                        return from(query!.save())
                            .pipe(map(() => query!.toObject()));
                    }



                    return throwError(() => {
                        this.setStatus(409);

                        return ({ error: SystemErrorCode.NO_ACCESS, description: 'вы не в очереди'} as ISystemError)
                    })
                }),
                tap(() => {
                    this._historyMoon.sentEvent(HistoryEventType.deviceTakeoff, payload.user.guid, data.deviceGuid)
                    from(DeviceDBM.findOne({ guid: data.deviceGuid }))
                        .pipe(
                            switchMap((dev) => from(ProfileDBM.find({symlinkedWith: dev!.symlinkedWith}))),
                            tap((profileList) => {
                                this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.queueUpdate)
                            }),
                            take(1)
                        )
                        .subscribe();
                })
            )

        const result = await firstValueFrom(executable);

        return result as any as QueueInterface;
    }

    @Post('cancel')
    @Security('jwt')
    public async cancelQueue(@Body() data: { deviceGuid: string }, @Request() payload: UserScope){
        const executable = from(QueueDBM.findOne({guid: data.deviceGuid}))
            .pipe(
                switchMap((query) => {
                    if(query!.userInQueueList.includes(payload.user.guid)){
                        query!.lastChangeUtc = dayjs().toDate();

                        const index = query!.userInQueueList.indexOf(payload.user.guid)
                        query!.userInQueueList.splice(index, 1);


                        return from(query!.save())
                            .pipe(map(() => query!.toObject()));
                    }

                    return throwError(() => {
                        this.setStatus(409);

                        return ({ error: SystemErrorCode.NO_ACCESS, description: 'вы не в очереди'} as ISystemError)
                    })

                }),
                tap(() => {
                    this._historyMoon.sentEvent(HistoryEventType.deviceQueueCancel, payload.user.guid, data.deviceGuid)
                    from(DeviceDBM.findOne({ guid: data.deviceGuid }))
                        .pipe(
                            switchMap((dev) => from(ProfileDBM.find({symlinkedWith: dev!.symlinkedWith}))),
                            tap((profileList) => {
                                this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.queueUpdate)
                            }),
                            take(1)
                        )
                        .subscribe();
                })
            )

        const result = await firstValueFrom(executable);

        return result as any as QueueInterface;
    }

    @Get('meta')
    @Security('jwt')
    public async getQueryInfo(@Query() deviceGuid: string ){
        const executable = from(QueueDBM.findOne({guid: deviceGuid}))
            .pipe(
                map((data) => data?.toObject())
            )

        const result = await firstValueFrom(executable);

        return result as any as QueueInterface;
    }

    @Get('myqueue')
    @Security('jwt')
    public async getAllUserQueue(@Request() rq: UserScope ){
        const executable = from(QueueDBM.find({userInQueueList: rq.user.guid}))
            .pipe(
                map((data) => (data as any as Array<Document>).map((q) => q.toObject()))
            )

        const result = await firstValueFrom(executable);

        return result as any as QueueInterface[];
    }

    @Post('drop')
    @Security('jwt', [SystemRole.root, SystemRole.admin])
    public async dropQuery(@Body() data: { deviceGuid: string }){

    }
}
