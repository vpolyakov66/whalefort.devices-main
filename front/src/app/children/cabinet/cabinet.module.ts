import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CabinetLayoutPage } from './layout/cabinet-layout.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import {
    TuiButtonModule,
    TuiDataListModule,
    TuiErrorModule,
    TuiGroupModule,
    TuiLabelModule,
    TuiScrollbarModule,
    TuiSvgModule,
    TuiTextfieldControllerModule
} from '@taiga-ui/core';
import {
    TuiBadgeModule,
    TuiDataListDropdownManagerModule,
    TuiDataListWrapperModule,
    TuiFieldErrorPipeModule,
    TuiInputDateRangeModule,
    TuiInputModule,
    TuiIslandModule,
    TuiMultiSelectModule,
    TuiRadioBlockModule,
    TuiStepperModule,
    TuiTreeModule
} from '@taiga-ui/kit';
import { AsideMember } from './aside/aside.member';
import { DeviceCommonModule } from '../../modules/device-module/device-common.module';
import { AvailableDevicesPage } from './pages/available-devices/available-devices.page';
import { OrganizationPage } from './pages/organization/organization.page';
import { RolePage } from './pages/roles/role.page';
import { QueuePage } from './pages/queue/queue.page';
import { CreateNodeModalComponent } from '../../modules/organization/modal/create-node/create-node.modal-component';
import { ReactiveFormsModule } from '@angular/forms';
import { ReserveUserModalComponent } from '../../modules/organization/modal/reserve-user/reserve-user.modal-component';
import { TuiTableModule, TuiTablePaginationModule } from '@taiga-ui/addon-table';
import { ProcessingUnitService } from '../../services/processing-unit.service';
import { CreateRoleModalComponent } from '../../modules/role/modals/create-role/create-role.modal-component';
import { TuiActiveZoneModule, TuiLetModule } from '@taiga-ui/cdk';
import {
    DeviceRegisterModalComponent
} from '../../modules/organization/modal/device-register/device-register.modal-component';
import { UserAvatarComponent } from './components/user-avatar/user-avatar.component';
import { DeviceQueueComponent } from './components/device-queue/device-queue.component';
import { HistoryPage } from './pages/history/history.page';
import { AbIntersectionModule } from '../../modules/intersection';
import { RemoveNodeModalComponent } from '../../modules/organization/modal/remove-node/remove-node.modal-component';
import { ProfileDataModalComponent } from '../../modules/organization/modal/profile-data/profile-data.modal-component';
import {
    CreateDeviceModalComponent
} from '../../modules/device-module/modals/create-device/create-device.modal-component';
import { USER_SYSTEM_ROLE } from '../../utils/resolution-directive/token/system-role.token';
import { BehaviorSubject } from 'rxjs';
import { SystemUserRoleEnum } from '../../utils/resolution-directive/enum/system-user-role.enum';
import { IfAdminStructureDirective } from '../../utils/resolution-directive/if-admin/if-admin.structure-directive';
import { IfRootStructureDirective } from '../../utils/resolution-directive/if-root/if-root.structure-directive';

const routes: Routes = [
    {
        path: '',
        component: CabinetLayoutPage,
        children: [
            {
                path: 'dash',
                component: DashboardPage,
            },
            {
                path: 'available-device',
                component: AvailableDevicesPage,
            },
            {
                path: 'organization',
                component: OrganizationPage,
            },
            {
                path: 'role',
                component: RolePage,
            },
            {
                path: 'queue',
                component: QueuePage,
            },
            {
                path: 'history',
                component: HistoryPage,
            },
            {
                path: '',
                redirectTo: 'dash',
                pathMatch: 'full'
            }
        ]
    }
]

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TuiButtonModule,
        TuiIslandModule,
        DeviceCommonModule,
        TuiTreeModule,
        TuiSvgModule,
        TuiInputModule,
        TuiFieldErrorPipeModule,
        TuiErrorModule,
        TuiRadioBlockModule,
        TuiGroupModule,
        ReactiveFormsModule,
        TuiTableModule,
        TuiMultiSelectModule,
        TuiLetModule,
        TuiTextfieldControllerModule,
        TuiDataListWrapperModule,
        TuiBadgeModule,
        TuiStepperModule,
        UserAvatarComponent,
        DeviceQueueComponent,
        TuiInputDateRangeModule,
        TuiScrollbarModule,
        TuiTablePaginationModule,
        AbIntersectionModule,
        TuiDataListModule,
        TuiDataListDropdownManagerModule,
        TuiLabelModule,
        IfAdminStructureDirective,
        IfRootStructureDirective,
        TuiActiveZoneModule
    ],
    providers: [
        ProcessingUnitService,
        { provide: USER_SYSTEM_ROLE, useValue: new BehaviorSubject<SystemUserRoleEnum>(SystemUserRoleEnum.user)}
    ],
    declarations: [
        CabinetLayoutPage,
        DashboardPage,
        AsideMember,
        AvailableDevicesPage,
        OrganizationPage,
        RolePage,
        QueuePage,
        CreateNodeModalComponent,
        ReserveUserModalComponent,
        CreateRoleModalComponent,
        DeviceRegisterModalComponent,
        HistoryPage,
        RemoveNodeModalComponent,
        ProfileDataModalComponent,
        CreateDeviceModalComponent,
    ]
})
export class CabinetModule {
    constructor(
        private _coreUnit: ProcessingUnitService,
    ) {
    }
}
