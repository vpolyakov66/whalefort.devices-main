import { singleton } from 'tsyringe';
import { finalize, from, interval, map, Observable, of, Subscription, switchMap, take, tap, timer } from 'rxjs';
import { QueueDBM } from '../../model/queue/mongo-model/queue.contract';
import { QueueInterface } from '../../model/queue/interfaces/queue.interface';
import dayjs, { Dayjs } from 'dayjs';
import { SseService } from '../sse/sse.service';
import { DeviceDBM } from '../../model/device/mongo-model/device.contract';
import { ProfileDBM } from '../../model/profile/mongo-model/profile.contract';
import { IProfile } from '../../model/profile/interfaces/profile.interface';
import { SSEEventName } from '../sse/enum/event-name.enum';
import { HistoryEventType } from '../../model/event/enum/history-event.type';
import { HistoryMoonService } from '../history-moon/history-moon.service';

@singleton()
export class QueueDaemonService{

    private _timerMap: Map<string, Subscription> = new Map<string, Subscription>()

    constructor(
        private _sse: SseService,
        private _historyMoon: HistoryMoonService,
    ) {
        this.restoreTimers();
    }

    public beginModeration(deviceGuid: string): void{
        if(this._timerMap.has(deviceGuid) && !this._timerMap.get(deviceGuid)?.closed){
            return;
        }

        const executableThread: Observable<void> = interval(5000)
            .pipe(
                finalize(() => {
                    this._timerMap.delete(deviceGuid)
                }),
                switchMap(() => this.watchByGuid(deviceGuid))
            )

        const sub = executableThread.subscribe();

        this._timerMap.set(deviceGuid, sub);
    }

    private watchByGuid(guid: string): Observable<void>{
        return from(QueueDBM.findOne({ guid: guid }))
            .pipe(
                map((q) => {
                    const queueList: string[] = q?.userInQueueList ?? [];

                    const currentUser: string | null = q?.inHandUserId ?? null;

                    const lastChange: Dayjs | null = q?.lastChangeUtc ? dayjs(q.lastChangeUtc) : null;

                    if (queueList.length === 0 && !currentUser){
                        this._timerMap.get(guid)?.unsubscribe();
                    }

                    return [queueList, currentUser, lastChange] as [string[], string | null, Dayjs | null];
                }),
                map(([list, user, lastChange] : [string[], string | null, Dayjs | null]) => {
                    const actionRequired: Array<'skipUser' | 'remindNext'> = [];

                    if(list[0] && !user){
                        if(lastChange && Math.abs(lastChange.diff(dayjs(), 'minutes')) >= 10){
                            actionRequired.push('skipUser', 'remindNext')
                        }
                    }

                    return [actionRequired, list] as [string[], string[]]
                }),
                tap(([act, list]: [string[], string[]]) => {
                    act.forEach((act: string) => {
                        switch (act) {
                            case 'skipUser':
                                this.removeUser(list[0], guid);
                                break;

                            case 'remindNext':
                                if(list[1])
                                    this.sendRemind(list[1]);
                                break;

                            default:
                                break;
                        }
                    })
                }),
                map(() => void 0)
            )
    }

    /**
     * Отправить сообщение о том, что нужно взять устройство
     * @param {string} userGuid
     */
    public sendRemind(userGuid: string){

    }

    /**
     * Удалить пользователя из очереди
     * @param {string} userGuid
     * @param deviceGuid
     */
    public removeUser(userGuid: string, deviceGuid: string){
        console.log(`Begin to remove ${userGuid}`);

        from(QueueDBM.findOne({guid: deviceGuid}))
            .pipe(
                switchMap((data) => {
                    if(!data){
                        return of(void 0)
                    }
                    data!.userInQueueList.splice(0, 1);
                    data!.lastChangeUtc = dayjs().toDate();

                    return data.save();
                }),
                tap(() => {
                    this._historyMoon.sentEvent(HistoryEventType.deviceQueueCancelForce, userGuid, deviceGuid)
                    from(DeviceDBM.findOne({ guid: deviceGuid }))
                        .pipe(
                            switchMap((dev) => from(ProfileDBM.find({symlinkedWith: dev!.symlinkedWith}))),
                            tap((profileList) => {
                                this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.queueUpdate)
                            }),
                            take(1)
                        )
                        .subscribe();
                }),
                take(1)
            ).subscribe()
    }

    private restoreTimers(): void{
        from(QueueDBM.find({ userInQueueList: { $exists: true, $not: { $size: 0}}}))
            .pipe(
                tap((data ) => {
                    (data as any as Array<QueueInterface>)
                        .forEach((query) => this.beginModeration(query.guid))
                    console.log(Array.from(this._timerMap.keys()));
                }),
                take(1)
            ).subscribe()
    }
}
