import { Injectable, Inject, ElementRef } from '@angular/core';
import { Observable, Subscriber, share } from 'rxjs';
import { IntersectionObserverDirective } from '../directives/intersection-observer.directive';


/** сервис для вызова callBack при пересечении */
@Injectable()
export class IntersectionObserveeService extends Observable<IntersectionObserverEntry[]> {
    constructor(
       @Inject(ElementRef) { nativeElement }: ElementRef<Element>,
       @Inject(IntersectionObserverDirective)
           observer: IntersectionObserverDirective,
    ) {
        super((subscriber: Subscriber<IntersectionObserverEntry[]>) => {
            observer.observe(nativeElement, (entries: IntersectionObserverEntry[]) => {
                subscriber.next(entries);
            });

            return () : void => {
                observer.unobserve(nativeElement);
            };
        });

        return this.pipe(share());
    }
}
