import { ChangeDetectionStrategy, Component, Inject, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { TuiDialogContext, TuiDialogService } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { OrganizationNode } from '../../enum/organization-node.enum';
import { CreateNodeModalInterface } from './interface/create-node-modal.interface';
import { FormControl, FormGroup } from '@angular/forms';
import {
    IFCreateBuildingRequestModel
} from '../../../../services/organization/interfaces/create-building.request-model';
import { IFCreateShelfRequestModel } from '../../../../services/organization/interfaces/create-shelf.request-model';
import { IFCreateUnitRequestModel } from '../../../../services/organization/interfaces/create-unit.request-model';
import { OrganizationManagerService } from '../../../../services/organization/organization-manager.service';
import { Observable, of, take, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { clearObject } from '../../../../utils/clear-object';
import { ProfileQueryService } from '../../../../stores/profile/profile-query.service';


type UniversalCreateForm = IFCreateBuildingRequestModel | IFCreateShelfRequestModel | IFCreateUnitRequestModel;

@Component({
    templateUrl: './create-node.modal-component.html',
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateNodeModalComponent{

    @ViewChild('building',{ static: true })
    public buildingTemplate!: TemplateRef<any>

    @ViewChild('department',{ static: true })
    public departmentTemplate!: TemplateRef<any>

    @ViewChild('shelf',{ static: true })
    public shelfTemplate!: TemplateRef<any>

    public universalForm: FormGroup


    constructor(
        @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
        @Inject(POLYMORPHEUS_CONTEXT)
        private readonly context: TuiDialogContext<boolean, CreateNodeModalInterface>,
        private _orgManager: OrganizationManagerService,
        private _profileQ: ProfileQueryService,
    ) {
        this.universalForm  = new FormGroup({
            name: new FormControl<string>(''),
            address: new FormControl<string | undefined>(undefined),
            administratorList: new FormControl<string[]>([this._profileQ.getMyself().guid]),
            buildingGuid: new FormControl<string | undefined>(this.context.data.building ?? undefined),
            isSmartShelf: new FormControl<boolean | undefined>(undefined),
            organizationGuid: new FormControl<string>(this.context.data.root),
            unitGuid: new FormControl<string | undefined>(this.context.data.department ?? undefined),
        })
    }

    public compileModel(): void{
        this.resolveEndpoint()
            .pipe(
                tap(() => {
                    this.context.completeWith(true);
                }),
                catchError(() => {
                    this.context.completeWith(false)

                    return of(void 0)
                }),
                take(1)
            ).subscribe()
    }

    public resolveFunction(): TemplateRef<any> | null{
        switch (this.context.data.type){
            case OrganizationNode.unit:
                return this.departmentTemplate;
            case OrganizationNode.building:
                return this.buildingTemplate;
            case OrganizationNode.shelf:
                return this.shelfTemplate;
        }

        return null;
    }

    public resolveEndpoint(): Observable<void>{
        switch (this.context.data.type){
            case OrganizationNode.unit:
                return this._orgManager.createDepartment(clearObject(this.universalForm.value));
            case OrganizationNode.building:
                return this._orgManager.createBuilding(clearObject(this.universalForm.value));
            case OrganizationNode.shelf:
                const readyObj: IFCreateShelfRequestModel = this.universalForm.value;
                (readyObj as any).administratorList = null;
                return this._orgManager.createShelf(clearObject(readyObj));
            default:
                return throwError(() => 'Unable to resolve creation')
        }
    }
}
