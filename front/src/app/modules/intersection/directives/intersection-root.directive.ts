import { Directive, ElementRef, forwardRef } from '@angular/core';
import { INTERSECTION_ROOT } from '../tokens/intersection_root.token';


/** эту директиву вешаем на объект, если у него свой скролл, если он отображается на странице, то не вешаем */
@Directive({
    selector: '[abIntersectionRoot]',
    providers: [
        {
            provide: INTERSECTION_ROOT,
            useExisting: forwardRef(() => ElementRef),
        },
    ],
})
export class IntersectionRootDirective {

}
