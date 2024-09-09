import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { RemoveNodeModalInterface } from '../remove-node/interface/remove-node-modal.interface';
import { ProfileQueryService } from '../../../../stores/profile/profile-query.service';
import { ProfileManagerService } from '../../../../services/profile/profile-manager.service';
import { tap } from 'rxjs';
import { ProfileUpdateRequestModel } from '../../../../services/profile/interfaces/profile-update.request-model';
import { FormControl, Validators } from '@angular/forms';

@Component({
    templateUrl: './profile-data.modal-component.html',
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileDataModalComponent{

    public firstName: FormControl<string | null> = new FormControl<string | null>('', [Validators.required])
    public secondName: FormControl<string | null> = new FormControl<string | null>('', [Validators.required])
    public phone: FormControl<string | null> = new FormControl<string | null>('', [Validators.required])
    public link: FormControl<string | null> = new FormControl<string | null>('', [Validators.required])

    constructor(
        @Inject(POLYMORPHEUS_CONTEXT)
        private readonly context: TuiDialogContext<boolean, RemoveNodeModalInterface>,
        private _profileQ: ProfileQueryService,
        private _profileMan: ProfileManagerService,
    ) {
    }

    public patch(): void{
        if(!(this.firstName.valid &&
            this.secondName.valid &&
            this.phone.valid &&
            this.link.valid)){
            return;
        }

        const model: ProfileUpdateRequestModel = {
            firstName: this.firstName.getRawValue()!,
            secondName: this.secondName.getRawValue()!,
            phone: this.phone.getRawValue()!,
            link: this.link.getRawValue()!,
        }

        this._profileMan.modifyEmployee(model)
            .pipe(
                tap(() => {
                    this.context.completeWith(true);
                })
            )
            .subscribe();
    }
}
