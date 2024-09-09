import { SmartShelfDataService } from './smart-shelf-data.service';
import { SmartShelfQueryService } from '../../stores/smartshelf/smart-shelf-query.service';
import { SmartShelfStoreService } from '../../stores/smartshelf/smart-shelf-store.service';
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { OrganizationQueryService } from '../../stores/organization/organization-query.service';
import { IFSmartShelf } from '../../modules/smartshelf/interfaces/smart-shelf.interface';
import { ShelfStateEnum } from '../../modules/smartshelf/enum/shelf-state.enum';
import { DeviceQueryService } from '../../stores/device/device-query.service';
import { ServerEventService } from '../sse/server-event.service';
import { ServerEventName } from '../sse/enum/sse-event.enum';
import { catchError } from 'rxjs/operators';
import { IDevice } from '../../modules/device-module/interfaces/device.interface';

@Injectable({providedIn: 'root'})
export class SmartShelfManagerService{

    constructor(
        private _smartShelfData: SmartShelfDataService,
        private _smartShelfQ: SmartShelfQueryService,
        private _smartShelfStore: SmartShelfStoreService,
        private _devQ: DeviceQueryService,
        private _orgQ: OrganizationQueryService,
        private _sse: ServerEventService,
    ) {
        this._sse.listenEvent([ServerEventName.shelfStateChange])
            .pipe(
                switchMap(() => {
                    return this.getAll()
                        .pipe(
                            catchError(() => of(void 0))
                        )
                })
            )
            .subscribe()
        this._devQ.selectActive()
            .pipe(
                switchMap((dev: IDevice | undefined) => {
                    if(!dev){
                        this._smartShelfStore.resetActive()

                        return of(void 0)
                    }

                    return this._smartShelfQ.selectAll({
                        filterBy: (s) => s.unverifiedDeviceList.includes(dev.guid) || s.deviceList.includes(dev.guid)
                    })
                        .pipe(
                            tap((shelf: IFSmartShelf[]) => {
                                if(shelf.length){
                                    this._smartShelfStore.setActive(shelf[0].guid)
                                }
                            })
                        )
                }),
            )
            .subscribe()
    }

    public getAll(): Observable<void>{
        return this._smartShelfData.getAll(this._orgQ.getActive()?.guid!)
            .pipe(
                tap((data: IFSmartShelf[]) => {
                    data.forEach((sh) => this._smartShelfStore.upsertShelf(sh))
                }),
                map(() => void 0)
            )
    }

    public openForAdding(): Observable<void>{
        return this._smartShelfData.openEnclave({
            reason: ShelfStateEnum.openForAdding,
            orgGuid: this._orgQ.getActive()?.guid!,
            deviceGuid: this._devQ.getActive()?.guid!
        })
    }

    public openForPick(): Observable<void>{
        return this._smartShelfData.openEnclave({
            reason: ShelfStateEnum.openForPickUp,
            orgGuid: this._orgQ.getActive()?.guid!,
            deviceGuid: this._devQ.getActive()?.guid!
        })
    }

    public openForVerify(): Observable<void>{
        return this._smartShelfData.openEnclave({
            reason: ShelfStateEnum.openForVerify,
            orgGuid: this._orgQ.getActive()?.guid!,
            deviceGuid: this._devQ.getActive()?.guid!
        })
    }

    public beginRegistration(): Observable<void>{
        return this._smartShelfData.registerDeviceEnclave({
            orgGuid: this._orgQ.getActive()?.guid!,
            deviceGuid: this._devQ.getActive()?.guid!
        })
    }

    public cancelRegistration(): Observable<void>{
        return this._smartShelfData.cancelRegistrationEnclave({
            orgGuid: this._orgQ.getActive()?.guid!,
            deviceGuid: this._devQ.getActive()?.guid!
        })
    }

}
