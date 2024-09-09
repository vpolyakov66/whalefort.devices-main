import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { AuthorizeGuard } from './guard/authorize.guard';

const routes: Routes = [
    {
        path: 'account',
        loadChildren: () => import('./children/account/account.module').then((m) => m.AccountModule)
    },
    {
        path: 'cabinet',
        loadChildren: () => import('./children/cabinet/cabinet.module').then((m) => m.CabinetModule),
        canActivate: [AuthorizeGuard]
    },
    {
        path: '',
        redirectTo: 'cabinet',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'account',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes),
        AkitaNgRouterStoreModule,
    ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {
}
