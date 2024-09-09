import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DeviceManagerService } from '../../../../services/device/device-manager.service';
import {Observable, switchMap, tap} from 'rxjs';
import { ServerEventService } from '../../../../services/sse/server-event.service';
import {IDevice} from "../../../../modules/device-module/interfaces/device.interface";
import {ProfileQueryService} from "../../../../stores/profile/profile-query.service";
import {DeviceQueryService} from "../../../../stores/device/device-query.service";
import {map} from "rxjs/operators";
import {tuiPure} from "@taiga-ui/cdk";
import {IFProfile} from "../../../../services/profile/interfaces/profile.interface";

@Component({
    templateUrl: './dashboard.page.html',
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPage{
    constructor(
        private _deviceMan: DeviceManagerService,
        private _sse: ServerEventService,
        private _deviceQuery: DeviceQueryService,
        private _profileQuery: ProfileQueryService
    ) {
        this._sse.sseBus$
            .pipe(
                tap(() => {
                })
            )
            .subscribe()
    }

    @tuiPure
    public get getFavoriteDeviceList(): Observable<IDevice[]> {
        const currentProfile: Observable<string[]> = this._profileQuery.getMyself$().pipe(
            map((profile: IFProfile) => {
                return profile.favouriteDevices ?? []
            })
        )
        return this._deviceQuery.getAllDevice()
            .pipe(
                switchMap((deviceList: IDevice[]) => {
                    return currentProfile
                        .pipe(
                            map((guidList: string[]) => {
                                return deviceList.filter((device: IDevice) => {
                                    return guidList.includes(device.guid)
                                })
                            })
                        )
                })
            )
    }
}
