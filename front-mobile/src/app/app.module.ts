import { isDevMode, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './components/app/app.component';
import { AppRoutingModule } from './app-routing.module';
import {
    TUI_SANITIZER,
    TuiLoaderModule,
    TuiRootModule,
    TuiDialogModule,
    TuiAlertModule
} from "@taiga-ui/core";
import { MobileLayoutComponent } from "./components/mobile-layout/mobile-layout.component";
import { LEFT_BUTTON, PAGE_TITLE, RIGHT_BUTTON } from "./tokens/header-tokens";
import { BehaviorSubject } from "rxjs";
import { HeaderButton } from "./utils/header-button";
import { TuiLetModule } from '@taiga-ui/cdk';
import { ART_BACKEND_HREF } from "./tokens/backend-href.token";
import {
    AuthService,
    AuthValidatorInterceptor,
    HttpUserLayerModule,
    IdentityRequestService,
    UserCredentialsService
} from "./modules/httpUserLayer";
import { AuthorizeGuard } from "./guards/authorize.guard";
import { NgDompurifySanitizer } from "@tinkoff/ng-dompurify";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { environment } from "../environments/environment";
import { AkitaNgDevtools } from "@datorama/akita-ngdevtools";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

@NgModule({
    declarations: [
        AppComponent,
        MobileLayoutComponent,
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        BrowserAnimationsModule,
        TuiRootModule,
        TuiLoaderModule,
        TuiLetModule,
        TuiDialogModule,
        TuiAlertModule,
        HttpUserLayerModule.forRoot(),
        AkitaNgDevtools.forRoot(),
        HttpClientModule,

    ],
    providers: [
        {
            provide: RouteReuseStrategy,
            useClass: IonicRouteStrategy
        },
        {
            provide: PAGE_TITLE,
            useValue: new BehaviorSubject<string>('')
        },
        {
            provide: LEFT_BUTTON,
            useValue: new BehaviorSubject<HeaderButton>(new HeaderButton(false))
        },
        {
            provide: RIGHT_BUTTON,
            useValue: new BehaviorSubject<HeaderButton>(new HeaderButton(false))
        },
        AuthorizeGuard,
        { provide: TUI_SANITIZER, useClass: NgDompurifySanitizer },
        { provide: HTTP_INTERCEPTORS, multi: true, useClass: AuthValidatorInterceptor },
        { provide: UserCredentialsService, multi: false, useClass: UserCredentialsService },
        { provide: AuthService, multi: false },
        { provide: IdentityRequestService },
        { provide: ART_BACKEND_HREF,
            useFactory: (): string => {
                return !isDevMode()? environment.baseHref: '/art/api/v1';
            }
        },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
