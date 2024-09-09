import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from "@angular/router";
import { LEFT_BUTTON, PAGE_TITLE, RIGHT_BUTTON } from "../../tokens/header-tokens";
import { BehaviorSubject, Observable } from "rxjs";
import { HeaderButton } from "../../utils/header-button";
import { tuiPure } from "@taiga-ui/cdk";
import { HeaderButtonTypeEnum } from "../../enums/header-button-type.enum";

@Component({
    selector: 'art-mobile-layout',
    templateUrl: 'mobile-layout.component.html',
    styleUrls: ['./mobile-layout.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileLayoutComponent {
    @tuiPure
    public get isRoutingProcess$(): Observable<boolean> {
        return this._isRoutingProcess$.asObservable();
    }

    @tuiPure
    public get pageTitle$(): Observable<string> {
        return this._pageTitle$.asObservable();
    }

    @tuiPure
    public get leftButton$(): Observable<HeaderButton> {
        return this._leftButton$.asObservable();
    }

    @tuiPure
    public get rightButton$(): Observable<HeaderButton> {
        return this._rightButton$.asObservable();
    }

    public headerButtonTypeEnum: typeof HeaderButtonTypeEnum = HeaderButtonTypeEnum;
    private _isRoutingProcess$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

    constructor(
        @Inject(PAGE_TITLE)
        private _pageTitle$: BehaviorSubject<string>,
        @Inject(LEFT_BUTTON)
        private _leftButton$: BehaviorSubject<HeaderButton>,
        @Inject(RIGHT_BUTTON)
        private _rightButton$: BehaviorSubject<HeaderButton>,
        private _router: Router,
    ) {
        this.navigateHandler();
    }

    private navigateHandler(): void {
        this._router.events
            .subscribe(event => {
                if (event instanceof NavigationStart) {
                    this._isRoutingProcess$.next(true)
                }

                if (event instanceof NavigationEnd || event instanceof NavigationError || event instanceof NavigationCancel) {
                    this._isRoutingProcess$.next(false)
                }
            });
    }
}
