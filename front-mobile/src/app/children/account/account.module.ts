import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginPage } from './login/login.page';
import { TuiFieldErrorPipeModule, TuiInputModule, TuiInputPasswordModule, TuiIslandModule } from "@taiga-ui/kit";
import { ReactiveFormsModule } from "@angular/forms";
import { TuiButtonModule, TuiErrorModule, TuiHintModule } from "@taiga-ui/core";
import { IonicModule } from "@ionic/angular";
import { headerResolver } from "../../utils/header-resolver";
import { RegisterPage } from './register/register.page';
import { HeaderButton } from 'src/app/utils/header-button';



const routes: Routes = [
    {
        path: '',
        component: LoginPage,
        resolve: {
            header: () => headerResolver('Вход в систему')
        }
    },
    {
        path: 'register',
        component: RegisterPage,
        resolve: {
            header: () => headerResolver('Регистрация в системе', new HeaderButton(true))
        }
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }
]

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TuiInputModule,
        TuiFieldErrorPipeModule,
        TuiInputPasswordModule,
        ReactiveFormsModule,
        TuiErrorModule,
        TuiIslandModule,
        TuiButtonModule,
        TuiHintModule,
        IonicModule
    ],
    declarations: [
        LoginPage,
        RegisterPage
    ],
    providers: []
})
export class AccountModule {

}
