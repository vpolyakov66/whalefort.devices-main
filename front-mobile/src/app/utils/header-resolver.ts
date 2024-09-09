import { HeaderButton } from "./header-button";
import { BehaviorSubject } from "rxjs";
import { inject } from "@angular/core";
import { LEFT_BUTTON, PAGE_TITLE, RIGHT_BUTTON } from "../tokens/header-tokens";

export function headerResolver(
    title?: string,
    leftButton?: HeaderButton,
    rightButton?: HeaderButton,
    titleState: BehaviorSubject<string> = inject(PAGE_TITLE),
    leftButtonState: BehaviorSubject<HeaderButton> = inject(LEFT_BUTTON),
    rightButtonState: BehaviorSubject<HeaderButton> = inject(RIGHT_BUTTON)
    ){
    titleState.next(title || '')
    leftButtonState.next(leftButton || new HeaderButton(false))
    rightButtonState.next(rightButton || new HeaderButton(false))
}
