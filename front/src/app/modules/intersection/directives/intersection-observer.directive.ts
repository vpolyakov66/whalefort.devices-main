import { Attribute, Directive, ElementRef, Inject, OnDestroy, Optional } from '@angular/core';
import { INTERSECTION_ROOT } from '../tokens/intersection_root.token';
import { INTERSECTION_ROOT_MARGIN_DEFAULT } from '../tokens/intersection_root_margin.token';
import { INTERSECTION_THRESHOLD_DEFAULT } from '../tokens/intersection_threshold.token';


/** директива наблюдателя за пересечением элемента в документе */
@Directive({
    selector: '[abIntersectionObserver]',
})
export class IntersectionObserverDirective extends IntersectionObserver implements OnDestroy {
    private readonly _callbacks: Map<Element, IntersectionObserverCallback> = new Map<Element, IntersectionObserverCallback>();

    constructor(
        @Optional() @Inject(INTERSECTION_ROOT) root: ElementRef<Element> | null,
        @Attribute('abIntersectionRootMargin') rootMargin: string | null,
        @Attribute('abIntersectionThreshold') threshold: string | null,
    ) {
        super(
            (entries: IntersectionObserverEntry[]) => {
                this._callbacks.forEach((callback: IntersectionObserverCallback, element: Element) => {
                    const filtered: IntersectionObserverEntry[] = entries.filter((target: IntersectionObserverEntry) => target.target === element);

                    return filtered.length && callback(filtered, this);
                });
            },
            {
                root: root && root.nativeElement,
                rootMargin: rootMargin || INTERSECTION_ROOT_MARGIN_DEFAULT,
                threshold: threshold
                    ? threshold.split(',').map(parseFloat)
                    : INTERSECTION_THRESHOLD_DEFAULT,
            },
        );
    }

    /**
     * наблюдатель
     * @param target Element
     * @param callback IntersectionObserverCallback = (): void => {}
     */
    public override observe(target: Element, callback: IntersectionObserverCallback = (): void => { }): void {
        super.observe(target);
        this._callbacks.set(target, callback);
    }

    /**
     * перестать следить
     * @param target Element
     */
    public override unobserve(target: Element): void {
        super.unobserve(target);
        this._callbacks.delete(target);
    }

    public ngOnDestroy(): void {
        this.disconnect();
    }
}
