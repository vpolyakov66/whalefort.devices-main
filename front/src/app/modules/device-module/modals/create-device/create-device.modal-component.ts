import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { DeviceManagerService } from '../../../../services/device/device-manager.service';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { FormControl, Validators } from '@angular/forms';
import { take, tap } from 'rxjs';

@Component({
    templateUrl: './create-device.modal-component.html',
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateDeviceModalComponent{

    public name: FormControl = new FormControl<any>('', [Validators.required]);
    public serialNumber: FormControl = new FormControl<any>('', );
    public physicLocation: FormControl = new FormControl<any>('');

    constructor(
        private _devMan: DeviceManagerService,
        @Inject(POLYMORPHEUS_CONTEXT)
        private readonly context: TuiDialogContext<boolean>,
        ) {

    }


    public createDevice(): void{
        if(!this.name.valid){
            return
        }

        this._devMan.createDevice({
            name: this.name.getRawValue(),
            serialNumber: this.serialNumber.getRawValue(),
            physicLocation: this.physicLocation.getRawValue(),
        })
            .pipe(
                tap(() => {
                    this.context.completeWith(true);
                }),
                take(1)
            ).subscribe()
    }

}
