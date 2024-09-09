import { Inject, Injectable } from '@angular/core';
import { IdentityRequestService, IResponseDataWrapper } from '../../modules/httpUserLayer';
import { Observable } from 'rxjs';
import { IDevice } from '../../modules/device-module/interfaces/device.interface';
import { map } from 'rxjs/operators';
import { IFDeviceCreateRequestModel } from './interfaces/device-create-request.model';
import { ART_BACKEND_HREF } from '../../token/backend-href.token';
import { concatUrl } from '../../utils/concat-url.util';
import { HttpParams } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class DeviceDataService{
    constructor(
        private _requestService: IdentityRequestService,
        @Inject(ART_BACKEND_HREF)
        private _baseHref: string
    ) {
    }

    /**
     * Получить все девайсы
     * @return {Observable<IDevice[]>}
     */
    public getAllDevice(guid: string): Observable<IDevice[]>{
        return this._requestService.get<IDevice[]>({
            url: concatUrl(this._baseHref, 'device', 'list'),
            options: {
                params: new HttpParams().set('orgGuid', guid)
            }
        })
            .pipe(
                map((data: IResponseDataWrapper<IDevice[]>) => data.data!)
            )
    }

    public createDevice(dto: IFDeviceCreateRequestModel): Observable<IDevice>{
        return this._requestService.post<IDevice, IFDeviceCreateRequestModel>({
            url: concatUrl(this._baseHref, 'device', 'create'),
            body: dto
        })
            .pipe(
                map((data: IResponseDataWrapper<IDevice>) => data.data!)
            )
    }
}
