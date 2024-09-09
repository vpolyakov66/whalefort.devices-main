import { ChangeDetectionStrategy, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { OrganizationQueryService } from '../../../../stores/organization/organization-query.service';
import { ProfileQueryService } from '../../../../stores/profile/profile-query.service';
import { OrganizationManagerService } from '../../../../services/organization/organization-manager.service';
import { EMPTY_ARRAY, TuiHandler, tuiPure } from '@taiga-ui/cdk';
import { IAbstractNode } from '../../../../modules/organization/interfaces/abstract-node.interface';
import { Observable, take, tap } from 'rxjs';
import { filterNilValue } from '@datorama/akita';
import { OrganizationNode } from '../../../../modules/organization/enum/organization-node.enum';
import { IShelf } from '../../../../modules/organization/interfaces/shelf-node.interface';
import { AuthService } from '../../../../modules/httpUserLayer';
import { map } from 'rxjs/operators';
import { IOrganization } from '../../../../modules/organization/interfaces/organization-root.interface';
import { TuiDialogService } from '@taiga-ui/core';
import {
    CreateNodeModalComponent
} from '../../../../modules/organization/modal/create-node/create-node.modal-component';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import {
    CreateNodeModalInterface
} from '../../../../modules/organization/modal/create-node/interface/create-node-modal.interface';
import { OrganizationStoreService } from '../../../../stores/organization/organization-store.service';
import {
    ReserveUserModalComponent
} from '../../../../modules/organization/modal/reserve-user/reserve-user.modal-component';
import {
    RemoveNodeModalComponent
} from '../../../../modules/organization/modal/remove-node/remove-node.modal-component';
import {
    RemoveNodeModalInterface
} from '../../../../modules/organization/modal/remove-node/interface/remove-node-modal.interface';


@Component({
    templateUrl: './organization.page.html',
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationPage{

    @ViewChild('root', {static: true})
    public rootTemplate!: TemplateRef<any>

    @ViewChild('building', {static: true})
    public buildingTemplate!: TemplateRef<any>

    @ViewChild('department', {static: true})
    public departmentTemplate!: TemplateRef<any>

    @ViewChild('shelf', {static: true})
    public shelfTemplate!: TemplateRef<any>

    @ViewChild('smartShelf', {static: true})
    public smartShelfTemplate!: TemplateRef<any>

    @tuiPure
    public get treeValue(): Observable<IAbstractNode>{
        return this._orgQuery.selectFirst()
            .pipe(
                filterNilValue()
            )
    }

    constructor(
        private _orgQuery: OrganizationQueryService,
        private _profileQuery: ProfileQueryService,
        private _orgManager: OrganizationManagerService,
        private _orgData: OrganizationStoreService,
        private _authService: AuthService,
        private _dialogService: TuiDialogService,
        private _injector: Injector
    ) {
        this._orgManager.updateAvailableOrganizationList()
            .pipe(
                tap(() => {
                    this._orgData.setActive(this._orgQuery.getAll()[0].guid)
                })
            )
            .subscribe();
    }

    public resolveNodeType(item: IAbstractNode): TemplateRef<any> | null{
        switch (item?.type){
            case OrganizationNode.root:
                return this.rootTemplate;
            case OrganizationNode.unit:
                return this.departmentTemplate;
            case OrganizationNode.building:
                return this.buildingTemplate;
            case OrganizationNode.shelf:
                return (item as IShelf).isSmartShelf ? this.smartShelfTemplate : this.shelfTemplate;

            default:
                return null;
        }
    }

    public reserveUser(): void{
        this._dialogService.open(new PolymorpheusComponent(ReserveUserModalComponent, this._injector)).pipe().subscribe()
    }

    public addBuilding(item: IOrganization): void{
        this._dialogService.open<boolean>(new PolymorpheusComponent(CreateNodeModalComponent, this._injector), {
            data: {

                root: item.guid!,
                type: OrganizationNode.building
            } as CreateNodeModalInterface
        }).subscribe()
    }

    public addDepartment(item: IOrganization): void{
        this._dialogService.open<boolean>(new PolymorpheusComponent(CreateNodeModalComponent, this._injector), {
            data: {

                root: item.parent!,
                building: item.guid!,
                type: OrganizationNode.unit
            } as CreateNodeModalInterface
        }).subscribe()
    }

    public addShelf(item: IOrganization): void{
        this._dialogService.open<boolean>(new PolymorpheusComponent(CreateNodeModalComponent, this._injector), {
            data: {
                root: this._orgQuery.getActive()!.guid!,
                building: item.parent!,
                department: item.guid!,
                type: OrganizationNode.shelf
            } as CreateNodeModalInterface
        }).subscribe()
    }

    public removeBuilding(item: IOrganization): void{
        this._dialogService.open<boolean>(new PolymorpheusComponent(RemoveNodeModalComponent, this._injector), {
            data: {
                organizationGuid: item.parent!,
                type: OrganizationNode.building,
                node: item,
                buildingGuid: item.guid
            } as RemoveNodeModalInterface
        }).subscribe()
    }

    public removeDepartment(item: IOrganization): void{
        this._dialogService.open<boolean>(new PolymorpheusComponent(RemoveNodeModalComponent, this._injector), {
            data: {
                organizationGuid: this._orgQuery.getActive()!.guid!,
                buildingGuid: item.parent!,
                unitGuid: item.guid!,
                type: OrganizationNode.unit,
                node: item
            } as RemoveNodeModalInterface
        }).subscribe()
    }

    public removeShelf(item: IOrganization): void{
        this._dialogService.open<boolean>(new PolymorpheusComponent(RemoveNodeModalComponent, this._injector), {
            data: {
                organizationGuid: this._orgQuery.getActive()!.guid!,
                buildingGuid: this._orgQuery.getActive()!.children.find((x) => x.children.map((c) => c.guid).includes(item.parent!))!.guid,
                unitGuid: item.parent!,
                shelfGuid: item.guid,
                type: OrganizationNode.shelf,
                node: item
            } as RemoveNodeModalInterface
        }).subscribe()
    }

    readonly handler: TuiHandler<IAbstractNode, readonly IAbstractNode[]> = item =>
        item && item.children.length > 0 && item.children || EMPTY_ARRAY;

    public retrieveKeys(item: IShelf): void{
        this._orgManager.retrieveKeys(item.guid).subscribe()
    }

}
