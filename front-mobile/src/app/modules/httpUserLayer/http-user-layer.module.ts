import { ModuleWithProviders, NgModule } from '@angular/core';

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
