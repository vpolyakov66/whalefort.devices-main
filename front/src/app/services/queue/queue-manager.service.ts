import { Inject, Injectable } from '@angular/core';
import { QueueDataService } from './queue-data.service';
import { DeviceQueryService } from '../../stores/device/device-query.service';
import { Observable, of, queue, switchMap, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LEGACY_UPDATE } from '../../token/legacy-update.token';
import { QueueStoreService } from '../../stores/queue/queue-store.service';
import { IDevice } from '../../modules/device-module/interfaces/device.interface';
import { ServerEventService } from '../sse/server-event.service';
import { ServerEventName } from '../sse/enum/sse-event.enum';

@Injectable({providedIn: 'root'})
export class QueueManagerService{

    constructor(
        private _queueData: QueueDataService,
        private _queueStore: QueueStoreService,
        private _deviceQuery: DeviceQueryService,
        @Inject(LEGACY_UPDATE)
        private _isLegacyUpdate: boolean,
        private _sse: ServerEventService,
    ) {
        this._deviceQuery.selectActive()
            .pipe(
                tap((device: IDevice | undefined) => {
                    if(!device){
                        this._queueStore.resetActive();
                        return;
                    }
                    this._queueStore.setActive(device.guid)
                })
            )
            .subscribe()

        this._sse.listenEvent(ServerEventName.queueUpdate)
            .pipe(
                switchMap(() => {
                    if(this._deviceQuery.getActiveId()){
                        return this.getQueue()
                            .pipe(
                                catchError(() => of(void 0))
                            )
                    }
                    return this.myQueue()
                        .pipe(
                            catchError(() => of(void 0))
                        )
                })
            )
            .subscribe()
    }

    public joinQueue(deviceGuid?: string): Observable<void>{
        return this._queueData.joinQueue(deviceGuid ?? this._deviceQuery.getActive()?.guid!)
            .pipe(
                tap((data) => {
                    if(this._isLegacyUpdate){
                        this._queueStore.upsertQueue(data)
                    }
                }),
                map(() => void 0)
            )
    }

    public takeQueue(deviceGuid?: string): Observable<void>{
        return this._queueData.takeInQueue(deviceGuid ?? this._deviceQuery.getActive()?.guid!)
            .pipe(
                tap((data) => {
                    if(this._isLegacyUpdate){
                        this._queueStore.upsertQueue(data)
                    }
                }),
                map(() => void 0)
            )
    }

    public takeoffQueue(deviceGuid?: string): Observable<void>{
        return this._queueData.takeoffQueue(deviceGuid ?? this._deviceQuery.getActive()?.guid!)
            .pipe(
                tap((data) => {
                    if(this._isLegacyUpdate){
                        this._queueStore.upsertQueue(data)
                    }
                }),
                map(() => void 0)
            )
    }

    public cancelQueue(deviceGuid?: string): Observable<void>{
        return this._queueData.cancelQueue(deviceGuid ?? this._deviceQuery.getActive()?.guid!)
            .pipe(
                tap((data) => {
                    if(this._isLegacyUpdate){
                        this._queueStore.upsertQueue(data)
                    }
                }),
                map(() => void 0)
            )
    }

    public dropQueue(deviceGuid?: string): Observable<void>{
        return this._queueData.dropQueue(deviceGuid ?? this._deviceQuery.getActive()?.guid!)
            .pipe(
                tap((data) => {
                    if(this._isLegacyUpdate){
                        this._queueStore.upsertQueue(data)
                    }
                }),
                map(() => void 0)
            )
    }

    public getQueue(deviceGuid?: string): Observable<void>{
        return this._queueData.getInfo(deviceGuid ?? this._deviceQuery.getActive()?.guid!)
            .pipe(
                tap((data) => {
                        this._queueStore.upsertQueue(data)
                }),
                map(() => void 0)
            )
    }

    public myQueue(): Observable<void>{
        return this._queueData.getMyQueueList()
            .pipe(
                tap((data) => {
                    // this._queueStore.reset();
                    this._queueStore.setState(data)

                    // data.forEach((queue) => {
                    //     this._queueStore.upsertQueue(queue)
                    // })
                }),
                map(() => void 0)
            )
    }

}
