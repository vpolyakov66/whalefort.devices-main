import { IDevice } from '../../modules/device-module/interfaces/device.interface';
import { Injectable } from '@angular/core';
import { ActiveState, EntityState, EntityStore, StoreConfig } from '@datorama/akita';

export interface IDeviceState extends EntityState<IDevice, string>, ActiveState{

}

@Injectable({
    providedIn: 'root'
})
@StoreConfig({name: 'device', idKey: 'guid', resettable: true})
export class DeviceStore extends EntityStore<IDeviceState>{
    constructor() {
        super()
    }

    public resetActive(): void{
        this.setActive(null);
    }
}

