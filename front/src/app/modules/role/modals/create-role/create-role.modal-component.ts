import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { RoleQueryService } from '../../../../stores/role/role-query.service';
import { ProfileQueryService } from '../../../../stores/profile/profile-query.service';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, startWith, switchMap, tap } from 'rxjs';
import {
    TUI_DEFAULT_MATCHER,
    TuiContextWithImplicit,
    TuiHandler,
    tuiIsNumber,
    tuiIsString,
    tuiPure
} from '@taiga-ui/cdk';
import { IFRole } from '../../../../services/role/interfaces/role.interface';
import { IFProfile } from '../../../../services/profile/interfaces/profile.interface';
import { map } from 'rxjs/operators';
import { ProfileManagerService } from '../../../../services/profile/profile-manager.service';
import { RoleManagerService } from '../../../../services/role/role-manager.service';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import {
    CreateNodeModalInterface
} from '../../../organization/modal/create-node/interface/create-node-modal.interface';
import { OrganizationQueryService } from '../../../../stores/organization/organization-query.service';

@Component({
    templateUrl: './create-role.modal-component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: []
})
export class CreateRoleModalComponent{

    public roleNameControl: FormControl<string | null> = new FormControl<string>(this.context.data?.isEdit? this._roleQ.getActive()?.alias?? '' : '', { validators: Validators.required });
    public roleDescriptionControl: FormControl<string | null> = new FormControl<string>('');
    public roleUserControl: FormControl<string[] | null> = new FormControl(this.context.data?.isEdit? this._roleQ.getActive()?.userList??[] : []);
    public roleOwnerControl: FormControl<string[] | null> = new FormControl(this.context.data?.isEdit? this._roleQ.getActive()?.ownerList?? [] : [this._profileQ.getMyself().guid!]);
    public roleAdminControl: FormControl<string[] | null> = new FormControl(this.context.data?.isEdit? this._roleQ.getActive()?.adminList??[] : []);

    public get isEdit(): boolean{
        return this.context.data?.isEdit ?? false
    }

    /**
     *
     */
    @tuiPure
    public get roleList$(): Observable<IFRole[]> {
        return this._roleQ.selectAll();
    }

    /**
     *
     */
    @tuiPure
    public get userList$(): Observable<string[]> {
        return this._search
            .pipe(
                startWith(''),
                switchMap((query: string) => {
                    return this._profileQ.selectAll()
                        .pipe(
                            map((list: IFProfile[]) => {
                                return list.filter((user: IFProfile) => {
                                    return TUI_DEFAULT_MATCHER(`${user.secondName ?? ''} ${user.firstName ?? ''}`, query);
                                }).map((user: IFProfile) => user.guid);
                            })
                        );
                })
            );
    }

    private _search: BehaviorSubject<string> = new BehaviorSubject<string>('');

    constructor(
        private _roleQ: RoleQueryService,
        private _profileQ: ProfileQueryService,
        private _roleMan: RoleManagerService,
        private _orgQ: OrganizationQueryService,
        @Inject(POLYMORPHEUS_CONTEXT)
        private readonly context: TuiDialogContext<void, {isEdit?: boolean}>,
        ) {
    }

    /**
     *
     */
    @tuiPure
    public stringifyUser$(): Observable<TuiHandler<TuiContextWithImplicit<string> | string, string>>{
        return this._profileQ.selectAll()
            .pipe(
                map((userList: IFProfile[]) => {
                    return new Map<string, string>(userList.map<[string, string]>((user: IFProfile) => [user.guid, `${user.secondName ?? ''} ${user.firstName ?? ''}`]));
                }),
                startWith(new Map()),
                map((dict: Map<string, string>) => (id: TuiContextWithImplicit<string> | string) => (tuiIsString(id) ? dict.get(id) : dict.get(id.$implicit)) || 'Loading')
            );
    }

    /**
     * поиск
     * @param {string | null} search
     */
    public onSearch(search: Event | string | null): void{
        this._search.next(search as string??'');
    }

    public createRole(): void{
        this._roleMan.createRole({
            alias: this.roleNameControl.value!,
            userList: this.roleUserControl.value??[],
            adminList: this.roleAdminControl.value!,
            ownerList: this.roleOwnerControl.value!
        })
            .pipe(
                tap(() => {
                    this.context.completeWith()
                }),
            )
            .subscribe()
    }

    public editRole(): void{
        this._roleMan.editRole({
            alias: this.roleNameControl.value!,
            userList: this.roleUserControl.value!,
            adminList: this.roleAdminControl.value!,
            ownerList: this.roleOwnerControl.value!,
            organizationGuid: this._orgQ.getActive()?.guid!,
            deviceList: this._roleQ.getActive()?.deviceList ?? []
        })
            .pipe(
                tap(() => {
                    this.context.completeWith()
                }),
            )
            .subscribe()
    }
}
