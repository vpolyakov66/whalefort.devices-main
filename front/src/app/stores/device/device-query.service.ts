import { Injectable } from '@angular/core';
import { DeviceStore, IDeviceState } from './device.store';
import { Observable, withLatestFrom } from 'rxjs';
import { IDevice } from '../../modules/device-module/interfaces/device.interface';
import { QueryEntityBase } from '../../utils/query-entity.base';




@Injectable({
    providedIn: 'root'
})
export class DeviceQueryService extends QueryEntityBase<IDeviceState>{

    constructor(
        private _store: DeviceStore
    ) {
        super(_store)
    }

    public getAllDevice(): Observable<IDevice[]>{
        return this.selectAll()
    }
}
