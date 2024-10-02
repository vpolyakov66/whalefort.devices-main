import { Inject, Injectable, Injector } from '@angular/core';
import { ProfileManagerService } from './profile/profile-manager.service';
import { OrganizationManagerService } from './organization/organization-manager.service';
import { RoleManagerService } from './role/role-manager.service';
import { QueueManagerService } from './queue/queue-manager.service';
import { DeviceManagerService } from './device/device-manager.service';
import { BehaviorSubject, forkJoin, of, skipWhile, switchMap, take, tap } from 'rxjs';
import { AuthService } from '../modules/httpUserLayer';
import { SmartShelfManagerService } from './smart-shelf/smart-shelf-manager.service';
import { ProfileQueryService } from '../stores/profile/profile-query.service';
import { IFProfile } from './profile/interfaces/profile.interface';
import { SmartShelfStore } from '../stores/smartshelf/smartshelf.store';
import { OrganizationStore } from '../stores/organization/organization.store';
import { ProfileStore } from '../stores/profile/profile.store';
import { RoleStore } from '../stores/role/role.store';
import { QueueStore } from '../stores/queue/queue.store';
import { DeviceStore } from '../stores/device/device.store';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { TuiDialogService } from '@taiga-ui/core';
import { ProfileDataModalComponent } from '../modules/organization/modal/profile-data/profile-data.modal-component';
import { USER_SYSTEM_ROLE } from '../utils/resolution-directive/token/system-role.token';
import { SystemUserRoleEnum } from '../utils/resolution-directive/enum/system-user-role.enum';
import { transaction } from '@datorama/akita';

@Injectable()
export class ProcessingUnitService{
    constructor(
        private _profileMan: ProfileManagerService,
        private _profileQ: ProfileQueryService,
        private _orgMan: OrganizationManagerService,
        private _roleMan: RoleManagerService,
        private _queueMan: QueueManagerService,
        private _deviceMan: DeviceManagerService,
        private _authService: AuthService,
        private _shelfMan: SmartShelfManagerService,
        private _shelfStore: SmartShelfStore,
        private _orgStore: OrganizationStore,
        private _profileStore: ProfileStore,
        private _devStore: DeviceStore,
        private _queueStore: QueueStore,
        private _roleStore: RoleStore,
        private _dialogService: TuiDialogService,
        private _injector: Injector,
        @Inject(USER_SYSTEM_ROLE)
        private _sysRole: BehaviorSubject<SystemUserRoleEnum>,
    ) {
        this.initializeCabinet();
    }

    @transaction()
    public resetStores(): void{
        this._queueStore.reset();
        this._roleStore.reset();
        this._devStore.reset();
        this._shelfStore.reset();
        this._orgStore.reset();
        this._profileStore.reset();
    }

    public initializeCabinet(): void{
        this._authService.isSuccessAuth
            .pipe(
                skipWhile((state: boolean) => !state),
                switchMap(() => {
                    return this._profileMan.identifySelf$()
                        .pipe(
                            switchMap(() => {
                                return this._profileQ.getMyself$()
                            }),
                            switchMap((profile: IFProfile) => {
                                if(!profile.isActive){
                                    console.log('Profile Data NEEDED!')
                                    return this._dialogService.open(new PolymorpheusComponent(ProfileDataModalComponent, this._injector), {
                                        closeable: false
                                    }).pipe()
                                }

                                return of(void 0);
                            }),
                            switchMap(() => {
                                return this._orgMan.getSystemRole()
                                    .pipe(
                                        tap((role) => {
                                            console.log(role);
                                            this._sysRole.next(role)
                                        })
                                    )
                            })
                        )
                }),
                switchMap(() => this._orgMan.updateAvailableOrganizationList()),
                switchMap(() => this._shelfMan.getAll()),
                switchMap(() => this._queueMan.myQueue()),
                switchMap(() => {
                    return forkJoin([this._deviceMan.upsertDeviceList(), this._roleMan.updateRole(), this._profileMan.updateEmployee$()]);
                }),
            )
            .subscribe()

    }
}
