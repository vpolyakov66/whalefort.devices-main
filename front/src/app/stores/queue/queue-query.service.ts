import { Injectable } from '@angular/core';
import { QueryEntityBase } from '../../utils/query-entity.base';
import { DeviceStore, IDeviceState } from '../device/device.store';
import { Observable } from 'rxjs';
import { IDevice } from '../../modules/device-module/interfaces/device.interface';
import { IQueueState, QueueStore } from './queue.store';

@Injectable({providedIn: 'root'})
export class QueueQueryService extends QueryEntityBase<IQueueState>{
    constructor(
        private _store: QueueStore
    ) {
        super(_store)
    }
}
