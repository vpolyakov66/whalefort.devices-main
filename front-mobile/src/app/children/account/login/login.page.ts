import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TUI_PASSWORD_TEXTS } from '@taiga-ui/kit';
import { of, take } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../modules/httpUserLayer';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
    templateUrl: './login.page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['login.scss'],
    providers: [
        {
            provide: TUI_PASSWORD_TEXTS,
            useValue: of(['Убрать маску', 'Наложить маску'])
        },
        TuiDestroyService
    ]
})
export class LoginPage{

    public loginForm: FormGroup = new FormGroup({
        username: new FormControl(undefined, Validators.required),
        password: new FormControl('', Validators.required)
    })

    constructor(
        private _fb: FormBuilder,
        private _router: Router,
        private _auth: AuthService,
        private _destroy$: TuiDestroyService
    ) {
    }

    public login(): void{
        if (!this.loginForm.valid){
            return;
        }
        this._auth.authorize(this.loginForm.getRawValue())
            .pipe(
                take(1)
            )
            .subscribe({
                next: () => {
                    this._router.navigate(['/cabinet'])
                }
            })
    }

    public goToRegister(): void {
        this._router.navigate(['/account/register'])
    }
}
