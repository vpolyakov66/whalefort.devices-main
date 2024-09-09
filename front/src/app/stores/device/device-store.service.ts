import { Injectable } from '@angular/core';
import { DeviceStore } from './device.store';
import { IDevice } from '../../modules/device-module/interfaces/device.interface';

@Injectable({providedIn: 'root'})
export class DeviceStoreService {

    constructor(
        private _deviceStore: DeviceStore,
    ) {
    }

    public setActive(guid: string): void{
        this._deviceStore.setActive(guid);
    }

    public resetActive(): void{
        this._deviceStore.resetActive();
    }

    public upsertDevice(device: IDevice): void{
        this._deviceStore.upsert(device.guid, device)
    }

}
