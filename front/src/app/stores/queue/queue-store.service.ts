// import { InjectableClassRegistry } from '@angular/compiler-cli/src/ngtsc/metadata';
import { Injectable } from '@angular/core';
import { DeviceStore } from '../device/device.store';
import { QueueStore } from './queue.store';
import { IDevice } from '../../modules/device-module/interfaces/device.interface';
import { QueueInterface } from '../../modules/queue/interfaces/queue.interface';

@Injectable({providedIn: 'root'})
export class QueueStoreService{
    constructor(
        private _queueStore: QueueStore,
    ) {
    }

    public setActive(guid: string): void{
        this._queueStore.setActive(guid);
    }

    public resetActive(): void{
        this._queueStore.resetActive();
    }

    public setState(queueList: QueueInterface[]): void{
        this._queueStore.setState(queueList);
    }

    public reset(): void{
        this._queueStore.reset();
    }

    public upsertQueue(queue: QueueInterface): void{
        this._queueStore.upsert(queue.guid, queue)
    }
}
