import { ChangeDetectionStrategy, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { DeviceQueryService } from '../../../stores/device/device-query.service';
import { DeviceManagerService } from '../../../services/device/device-manager.service';
import { QueueQueryService } from '../../../stores/queue/queue-query.service';
import { QueueManagerService } from '../../../services/queue/queue-manager.service';
import { finalize, Observable, of, switchMap } from 'rxjs';
import { IDevice } from '../interfaces/device.interface';
import { filterNilValue } from '@datorama/akita';
import { QueueInterface } from '../../queue/interfaces/queue.interface';
import { IFRole } from '../../../services/role/interfaces/role.interface';
import { RoleQueryService } from '../../../stores/role/role-query.service';
import { TuiContextWithImplicit, tuiPure, TuiStringHandler } from '@taiga-ui/cdk';
import { TuiDialogService } from '@taiga-ui/core';
import { ProfileQueryService } from '../../../stores/profile/profile-query.service';
import { IFProfile } from '../../../services/profile/interfaces/profile.interface';
import { FormControl, Validators } from '@angular/forms';
import { RoleManagerService } from '../../../services/role/role-manager.service';
import { SafeSubscriber } from 'rxjs/internal/Subscriber';
import { OrganizationManagerService } from '../../../services/organization/organization-manager.service';
import { OrganizationQueryService } from '../../../stores/organization/organization-query.service';
import { IOrganization } from '../../organization/interfaces/organization-root.interface';
import { IShelf } from '../../organization/interfaces/shelf-node.interface';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import {
    DeviceRegisterModalComponent
} from '../../organization/modal/device-register/device-register.modal-component';
import { SmartShelfDataService } from '../../../services/smart-shelf/smart-shelf-data.service';
import { SmartShelfStoreService } from '../../../stores/smartshelf/smart-shelf-store.service';

interface TreeValue{
    value: string[],
    alias: string,
    isSmart?: boolean,
    guid: string
}

@Component({
    templateUrl: './device-description.modal-component.html',
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceDescriptionModalComponent{

    @ViewChild('addRole', {static: true})
    public roleDialog!: TemplateRef<any>

    @ViewChild('transaction', {static: true})
    public transactionDialog!: TemplateRef<any>

    @tuiPure
    public get profile$(): Observable<IFProfile>{
        return this._profileQ.getMyself$()
            .pipe(
                filterNilValue()
            )
    }

    @tuiPure
    public get device$(): Observable<IDevice>{
        return this._deviceQ.selectActive()
            .pipe(
                filterNilValue()
            )
    }
    @tuiPure
    public get queue$(): Observable<QueueInterface>{
        return this._queueQ.selectActive()
            .pipe(
                filterNilValue()
            );
    }

    public get roleList$(): Observable<IFRole[]>{
        return this._roleQ.selectAll({filterBy: (e) => e.deviceList.includes(this._deviceQ.getActive()?.guid!)})
    }

    public get availableRoleList$(): Observable<IFRole[]>{
        return this._roleQ.selectAll({filterBy: (e) => !e.deviceList.includes(this._deviceQ.getActive()?.guid!)})
    }

    public roleUUID!: FormControl
    public transactionTree!: FormControl



    @tuiPure
    stringifyRoles(
        items: readonly IFRole[],
    ): TuiStringHandler<TuiContextWithImplicit<string>> {
        const map = new Map(items.map(({guid, alias}) => [guid, alias] as [string, string]));

        return ({$implicit}: TuiContextWithImplicit<string>) => map.get($implicit) || '';
    }

    @tuiPure
    stringifyTree(
        items: readonly TreeValue[],
    ): TuiStringHandler<TuiContextWithImplicit<string>> {
        const map = new Map(items.map(({guid,alias}) => [guid, alias] as [string, string]));

        return ({$implicit}: TuiContextWithImplicit<string>) => map.get($implicit) || '';
    }

    constructor(
        private _deviceQ: DeviceQueryService,
        private _deviceMan: DeviceManagerService,
        private _queueQ: QueueQueryService,
        private _queueMan: QueueManagerService,
        private _roleQ: RoleQueryService,
        private _roleMan: RoleManagerService,
        private _profileQ: ProfileQueryService,
        private _dialogService: TuiDialogService,
        private _orgMan: OrganizationManagerService,
        private _orgQ: OrganizationQueryService,
        private _injector: Injector,
        private _shelfStoreService: SmartShelfStoreService,
    ) {
        this._queueMan.getQueue().subscribe();
    }

    public openRoleDialog(): void{
        this.roleUUID = new FormControl('', { validators: [Validators.required]});
        this._dialogService.open(this.roleDialog).subscribe()
    }

    public openTransactionDialog(): void{
        this.transactionTree = new FormControl([], { validators: [Validators.required]});
        this._dialogService.open(this.transactionDialog).subscribe()
    }

    public joinQueue(): void{
        this._queueMan.joinQueue().subscribe();
    }

    public cancelQueue(): void{
        this._queueMan.cancelQueue().subscribe();
    }

    public takeQueue(): void{
        this._queueMan.takeQueue().subscribe();
    }

    public laydownQueue(): void{
        this._queueMan.takeoffQueue().subscribe();
    }

    public beginTransaction(ev: SafeSubscriber<void>): void{
        const foundedNode = this.getTreenodeList().find((n) => n.guid === this.transactionTree.value)

        if(foundedNode){
            this._orgMan.transaction({to: {
                    building: foundedNode.value[0],
                    shelf: foundedNode.value[2] ?? undefined,
                    unit: foundedNode.value[1]
                }})
                .pipe(
                    switchMap(() => {
                        if(foundedNode.isSmart){
                            return this._dialogService.open(new PolymorpheusComponent(DeviceRegisterModalComponent, this._injector),
                                {
                                    data: {
                                        shelfGuid: foundedNode.guid
                                    }
                                }
                                )
                        }

                        this._shelfStoreService.resetActive();

                        return of(void 0)
                    }),
                    finalize(() => ev.complete())
                )
                .subscribe()
        }
    }

    public removeRole(guid: string): void{
        const role = {...this._roleQ.getEntity(this.roleUUID.value as string)!}
        role.deviceList.splice(role.deviceList.indexOf(this._deviceQ.getActive()!.guid),1)

        this._roleMan.editRole(role, role.guid).subscribe();
    }

    public insertRole(obs: SafeSubscriber<any>): void{
        const role = structuredClone({...this._roleQ.getEntity(this.roleUUID.value as string)!})

        role.deviceList.push(this._deviceQ.getActive()!.guid)

        this._roleMan.editRole(role, role.guid)
            .pipe(
                finalize(() => obs.complete())
            )
            .subscribe();
    }

    @tuiPure
    public getTreenodeList(): TreeValue[]{
        const org = this._orgQ.getActive() as any as IOrganization;

        const arr: TreeValue[] = [];

        org?.children.forEach((b) => {
            b.children.forEach((u) => {
                arr.push({
                        value: [b.guid, u.guid],
                        alias: (u as any).name,
                        guid: u.guid
                    })

                u.children.forEach((s) => {
                    arr.push({
                        value: [b.guid, u.guid, s.guid],
                        alias: (s as any).name,
                        isSmart: (s as IShelf).isSmartShelf,
                        guid: s.guid
                    })
                })
            })
        })

        return arr;
    }
}
