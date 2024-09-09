import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { DeviceQueryService } from '../../../../stores/device/device-query.service';
import { Observable, take } from 'rxjs';
import { IDevice } from '../../../../modules/device-module/interfaces/device.interface';
import { tuiPure } from '@taiga-ui/cdk';
import { DeviceManagerService } from '../../../../services/device/device-manager.service';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import {
    CreateDeviceModalComponent
} from '../../../../modules/device-module/modals/create-device/create-device.modal-component';

@Component({
    templateUrl: './available-devices.page.html',
    styleUrls: ['./styles/available-devices.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailableDevicesPage{

    @tuiPure
    public get deviceList$(): Observable<IDevice[]>{
        return this._deviceQuery.getAllDevice()
    }

    constructor(
        private _deviceQuery: DeviceQueryService,
        private _devMan: DeviceManagerService,
        private _dialog: TuiDialogService,
        private _injector: Injector,
    ) {
        this._devMan.upsertDeviceList()
            .pipe(
                take(1)
            )
            .subscribe();
    }

    public addDevice(): void{
        this._dialog.open(new PolymorpheusComponent(CreateDeviceModalComponent, this._injector)).subscribe();
    }

}
