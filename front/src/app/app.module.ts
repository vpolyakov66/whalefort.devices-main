import { NgDompurifySanitizer } from "@tinkoff/ng-dompurify";
import { TuiRootModule, TuiDialogModule, TuiAlertModule, TUI_SANITIZER } from "@taiga-ui/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { isDevMode, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import {
    AuthService,
    AuthValidatorInterceptor,
    HttpUserLayerModule, IdentityRequestService,
    UserCredentialsService
} from './modules/httpUserLayer';
import { ART_BACKEND_HREF } from './token/backend-href.token';
import { environment } from '../environments/environment';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { LEGACY_UPDATE } from './token/legacy-update.token';
import { AuthorizeGuard } from './guard/authorize.guard';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        TuiRootModule,
        TuiDialogModule,
        TuiAlertModule,
        HttpUserLayerModule.forRoot(),
        AkitaNgDevtools.forRoot(),
        HttpClientModule,
    ],
    providers: [
        AuthorizeGuard,
        { provide: TUI_SANITIZER, useClass: NgDompurifySanitizer },
        { provide: HTTP_INTERCEPTORS, multi: true, useClass: AuthValidatorInterceptor },
        { provide: UserCredentialsService, multi: false, useClass: UserCredentialsService },
        { provide: AuthService, multi: false },
        { provide: IdentityRequestService },
        { provide: LEGACY_UPDATE, useValue: true },
        { provide: ART_BACKEND_HREF,
            useFactory: (): string => {
                return !isDevMode()? environment.baseHref: '/art/api/v1';
            }
        },
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule {

}
