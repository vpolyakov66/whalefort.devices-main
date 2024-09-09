import { InjectionToken, ElementRef } from '@angular/core';

export const INTERSECTION_ROOT: InjectionToken<ElementRef> = new InjectionToken<ElementRef>(
    'intersect'
);
