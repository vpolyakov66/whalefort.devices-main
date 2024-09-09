import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'account',
        loadChildren: () => import('./children/account/account.module').then( m => m.AccountModule)
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
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
