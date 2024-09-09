import { InjectionToken } from '@angular/core';

export const INTERSECTION_ROOT_MARGIN_DEFAULT: string = '0px 0px 0px 0px';
export const INTERSECTION_ROOT_MARGIN: InjectionToken<string> = new InjectionToken<string>(
    'rootMargin for IntersectionObserver',
    {
        providedIn: 'root',
        factory: (): string => INTERSECTION_ROOT_MARGIN_DEFAULT,
    },
);
