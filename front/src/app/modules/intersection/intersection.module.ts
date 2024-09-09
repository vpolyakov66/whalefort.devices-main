import { NgModule } from '@angular/core';
import { IntersectionObserveeDirective } from './directives/intersection-observee.directive';
import { IntersectionObserverDirective } from './directives/intersection-observer.directive';
import { IntersectionRootDirective } from './directives/intersection-root.directive';

const items: any[] = [
    IntersectionRootDirective,
    IntersectionObserveeDirective,
    IntersectionObserverDirective,
];


@NgModule({
    declarations: [ items ],
    exports: [ items ],
})
export class AbIntersectionModule { }
