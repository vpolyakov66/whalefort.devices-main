import {ChangeDetectionStrategy, Component, Injector, Input} from '@angular/core';
import {IDevice} from '../../interfaces/device.interface';
import {DeviceStoreService} from '../../../../stores/device/device-store.service';
import {TuiDialogService} from '@taiga-ui/core';
import {PolymorpheusComponent} from '@tinkoff/ng-polymorpheus';
import {DeviceDescriptionModalComponent} from '../../modals/device-description.modal-component';
import {finalize, take} from 'rxjs';
import {ProfileManagerService} from "../../../../services/profile/profile-manager.service";
import {ProfileQueryService} from "../../../../stores/profile/profile-query.service";

@Component({
    selector: 'art-device-plate',
    templateUrl: './device-plate.component.html',
    styleUrls: ['./styles/plate.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevicePlateComponent {

    open = false;

    constructor(
        private _deviceStore: DeviceStoreService,
        private _dialogService: TuiDialogService,
        private _injector: Injector,
        private _profileManager: ProfileManagerService,
        private _profileQuery: ProfileQueryService
    ) {
    }

    @Input()
    public device!: IDevice

    onClick(): void {
        this.open = false;
    }

    public openDescription(): void {
        this._deviceStore.setActive(this.device.guid);
        this._dialogService.open(new PolymorpheusComponent(DeviceDescriptionModalComponent, this._injector))
            .pipe(
                finalize(() => {
                    this._deviceStore.resetActive();
                })
            ).subscribe();
    }

    public addFavoriteDevice(): void{
        this._profileManager.addFavorite(this.device.guid).pipe(
            take(1)
        )
            .subscribe()
    }

    public isDislike(): boolean {
        return this._profileQuery.getMyself().favouriteDevices?.indexOf(this.device.guid)! > -1;
    }

    public deleteFavoriteDevice(): void {
        this._profileManager.deleteFavorite(this.device.guid)
            .pipe(
                take(1)
            )
            .subscribe()
    }
}
