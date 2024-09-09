import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginPage } from './login/login.page';
import { TuiFieldErrorPipeModule, TuiInputModule, TuiInputPasswordModule, TuiIslandModule } from '@taiga-ui/kit';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiButtonModule, TuiErrorModule, TuiHintModule } from '@taiga-ui/core';
import { LayoutPage } from './layout/layout.page';
import { RegisterPage } from './register/register.page';

const routes: Routes = [
    {
        path: '',
        component: LayoutPage,
        children: [
            {
                path: 'login',
                component: LoginPage
            },
            {
                path: 'register',
                component: RegisterPage
            },
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            }
        ]
    },
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
        TuiHintModule
    ],
    declarations: [
        LoginPage,
        LayoutPage,
        RegisterPage
    ],
    providers: []
})
export class AccountModule {

}
