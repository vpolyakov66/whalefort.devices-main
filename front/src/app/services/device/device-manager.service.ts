import { Inject, Injectable } from '@angular/core';
import { DeviceDataService } from './device-data.service';
import { DeviceStoreService } from '../../stores/device/device-store.service';
import { Observable, switchMap, tap } from 'rxjs';
import { IDevice } from '../../modules/device-module/interfaces/device.interface';
import { map } from 'rxjs/operators';
import { IFDeviceCreateRequestModel } from './interfaces/device-create-request.model';
import { DeviceQueryService } from '../../stores/device/device-query.service';
import { OrganizationQueryService } from '../../stores/organization/organization-query.service';

@Injectable({providedIn: 'root'})
export class DeviceManagerService{
    constructor(
        private _deviceDataService: DeviceDataService,
        private _deviceStoreService: DeviceStoreService,
        private _orgQ: OrganizationQueryService,
        private _deviceQ: DeviceQueryService
    ) {
    }

    public upsertDeviceList(): Observable<void>{
        return this._deviceDataService.getAllDevice(this._orgQ.getActive()?.guid!)
            .pipe(
                tap((data: IDevice[]) => {
                    data.forEach((device: IDevice) => {
                        this._deviceStoreService.upsertDevice(device)
                    })
                }),
                map(() => void 0)
            )
    }

    /**
     *  Создает новое устройство
     * @param {IFDeviceCreateRequestModel} dto
     * @return {Observable<void>}
     */
    public createDevice(dto: Omit<IFDeviceCreateRequestModel, 'symlinkedWith'>): Observable<void>{
        return this._deviceDataService.createDevice({...dto, symlinkedWith: this._orgQ.getActive()?.guid!})
            .pipe(
                tap((device: IDevice) => {
                    this._deviceStoreService.upsertDevice(device)
                }),
                map(() => void 0)
            )
    }

    //todo: not implemented
    public editDevice(dto: IDevice): Observable<void>{
        throw new Error('not imlemented');
    }
}
