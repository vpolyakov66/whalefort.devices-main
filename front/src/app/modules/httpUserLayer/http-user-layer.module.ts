import { ModuleWithProviders, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthValidatorInterceptor } from './interceptors';
import { UserCredentialsService } from './services';
import { AuthService } from './services';
import { IdentityRequestService } from './services';

@NgModule({
    imports: [

    ],
    providers: [

    ]
})
export class HttpUserLayerModule{
    /**
     * forRoot()
     * @return ModuleWithProviders
     */
    public static forRoot(): ModuleWithProviders<HttpUserLayerModule>{
        return {
            ngModule: HttpUserLayerModule,
            providers: [

            ]
        };
    }
}
