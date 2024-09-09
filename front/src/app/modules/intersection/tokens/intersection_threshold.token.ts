import { InjectionToken } from '@angular/core';

export const INTERSECTION_THRESHOLD_DEFAULT: number = 0;
export const INTERSECTION_THRESHOLD: InjectionToken<number | number[]> = new InjectionToken<number | number[]>(
    'threshold for IntersectionObserver',
    {
        providedIn: 'root',
        factory: (): number | number[] => INTERSECTION_THRESHOLD_DEFAULT,
    },
);

