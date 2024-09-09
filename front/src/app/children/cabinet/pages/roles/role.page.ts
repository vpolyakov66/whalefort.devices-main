import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { RoleQueryService } from '../../../../stores/role/role-query.service';
import { RoleManagerService } from '../../../../services/role/role-manager.service';
import { finalize, Observable } from 'rxjs';
import { IFRole } from '../../../../services/role/interfaces/role.interface';
import { tuiPure } from '@taiga-ui/cdk';
import { ProfileManagerService } from '../../../../services/profile/profile-manager.service';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { CreateRoleModalComponent } from '../../../../modules/role/modals/create-role/create-role.modal-component';
import { ProfileQueryService } from '../../../../stores/profile/profile-query.service';
import { RoleStoreService } from '../../../../stores/role/role-store.service';

@Component({
    templateUrl: './role.page.html',
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolePage{

    @tuiPure
    public get roleList$(): Observable<IFRole[]>{
        return this._roleQ.selectAll()
    }

    public readonly columnsKeyList: string[] = ['alias', 'ownerList', 'adminList', 'userList', 'devices', 'actions'];


    constructor(
        private _roleQ: RoleQueryService,
        private _roleStateService: RoleStoreService,
        private _roleManager: RoleManagerService,
        private _profileMan: ProfileManagerService,
        private _profileQuery: ProfileQueryService,
        private _dialogService: TuiDialogService,
        private _injector: Injector
    ) {
        this._profileMan.updateEmployee();
    }

    public isRoleOwner(role: IFRole): boolean{
        return role.ownerList.includes(this._profileQuery.getMyself()?.guid!) || role.ownerList.includes(this._profileQuery.getMyself()?.guid!)
    }

    public editRole(role: IFRole): void{
        this._roleStateService.setActive(role.guid)

        this._dialogService.open(new PolymorpheusComponent(CreateRoleModalComponent, this._injector), {
            data: {isEdit: true}
        })
            .pipe(
                finalize(() => {
                    this._roleStateService.resetActive();
                })
            )
            .subscribe()
    }

    public createRole(): void{
        this._dialogService.open(new PolymorpheusComponent(CreateRoleModalComponent, this._injector))
            .pipe()
            .subscribe()
    }

}
