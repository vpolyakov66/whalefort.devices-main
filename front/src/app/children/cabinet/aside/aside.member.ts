import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'art-cabinet-aside',
    templateUrl: './aside.member.html',
    styleUrls: ['./styles/aside.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsideMember{

    @Output()
    public navigated: EventEmitter<void> = new EventEmitter<void>()

    constructor(
        private _router: Router
    ) {
    }

    public navigateTo(path: string): void{
        this._router.navigate(['/cabinet',path]);
        this.navigated.next();
    }
}
