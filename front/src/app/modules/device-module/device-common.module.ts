import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiLetModule } from '@taiga-ui/cdk';
import { DevicePlateComponent } from './components/device-plate/device-plate.component';
import {
    TuiButtonModule,
    TuiDataListModule,
    TuiDropdownModule,
    TuiHostedDropdownModule, TuiLoaderModule,
    TuiSvgModule, TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { DeviceDescriptionModalComponent } from './modals/device-description.modal-component';
import { TuiBadgedContentModule, TuiBadgeModule, TuiIslandModule, TuiSelectModule } from '@taiga-ui/kit';
import { ReactiveFormsModule } from '@angular/forms';
import { IfAdminStructureDirective } from '../../utils/resolution-directive/if-admin/if-admin.structure-directive';
import { UserAvatarComponent } from '../../children/cabinet/components/user-avatar/user-avatar.component';

@NgModule({
    providers: [],
    exports: [
        DevicePlateComponent,
        DeviceDescriptionModalComponent,
    ],
    declarations: [
        DevicePlateComponent,
        DeviceDescriptionModalComponent,
    ],
    imports: [
        CommonModule,
        TuiLetModule,
        TuiButtonModule,
        TuiIslandModule,
        TuiSvgModule,
        TuiHostedDropdownModule,
        TuiDropdownModule,
        TuiDataListModule,
        TuiSelectModule,
        TuiTextfieldControllerModule,
        TuiLoaderModule,
        ReactiveFormsModule,
        TuiBadgeModule,
        TuiBadgedContentModule,
        IfAdminStructureDirective,
        UserAvatarComponent,
    ]
})
export class DeviceCommonModule{

}
