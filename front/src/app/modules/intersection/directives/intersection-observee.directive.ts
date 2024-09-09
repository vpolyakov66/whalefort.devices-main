import { Directive, Inject, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { IntersectionObserveeService } from '../services/intersection-observee.service';

/** через DI проталкиваем сервис, наследуемый от Observable, поэтому мы может выкинуть его через Output */
@Directive({
    selector: '[abIntersectionObservee]',
    providers: [IntersectionObserveeService],
})
export class IntersectionObserveeDirective {

    @Output('abIntersectionObservee')
    public intersectionObservee: Observable<IntersectionObserverEntry[]> = this.abIntersectionObservee;

    constructor(
        @Inject(IntersectionObserveeService) public readonly abIntersectionObservee: Observable<IntersectionObserverEntry[]>,
    ) {

    }
}
