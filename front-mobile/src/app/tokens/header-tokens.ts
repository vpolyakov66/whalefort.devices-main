import { InjectionToken } from '@angular/core';
import { HeaderButton } from '../utils/header-button';
import { BehaviorSubject } from "rxjs";

export const PAGE_TITLE: InjectionToken<BehaviorSubject<string>> = new InjectionToken<BehaviorSubject<string>>('Текст заголовка страницы')
export const LEFT_BUTTON: InjectionToken<BehaviorSubject<HeaderButton>> = new InjectionToken<BehaviorSubject<HeaderButton>>('Левая кнопка хедера')
export const RIGHT_BUTTON: InjectionToken<BehaviorSubject<HeaderButton>> = new InjectionToken<BehaviorSubject<HeaderButton>>('Правая кнопка хедера')
