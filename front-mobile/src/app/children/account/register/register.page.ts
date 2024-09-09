import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../modules/httpUserLayer';
import { take, tap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    templateUrl: './register.page.html',
    styleUrls: ['register.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterPage{
    public registerForm: FormGroup = new FormGroup({
        username: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required]),
        inviteCode: new FormControl('', [Validators.required])
    })

    public username: FormControl = new FormControl('', [Validators.required]);
    public password: FormControl = new FormControl('', [Validators.required]);
    public guid: FormControl = new FormControl('', [Validators.required]);
    public organizationName = new FormControl('')


    public isEmployeeRegister: boolean = true;

    constructor(
        private _authService: AuthService,
        private _router: Router
    ) {
    }

    public registerEmployee(): void{
        this._authService.register({username: this.username.getRawValue(), password: this.password.getRawValue(), guid: this.guid.getRawValue()})
            .pipe(
                tap(() => {
                    this._router.navigate(['/cabinet'])
                }),
                take(1),
            )
            .subscribe()
    }

    public switchState(ev: Event): void{
        ev.preventDefault();
        ev.stopImmediatePropagation();
        this.isEmployeeRegister = !this.isEmployeeRegister;
        this.guid.reset();
        this.organizationName.reset();
        if(this.isEmployeeRegister){
            this.guid.setValidators([]);
        } else {
            this.guid.setValidators([Validators.required]);
        }
    }

    public registerOrganization(): void{

    }
}
