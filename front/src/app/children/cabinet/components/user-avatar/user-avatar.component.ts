import { ChangeDetectionStrategy, Component, Input, OnInit, TemplateRef } from '@angular/core';
import { ProfileQueryService } from '../../../../stores/profile/profile-query.service';
import { BehaviorSubject, filter, Observable, of, retry, switchMap, take, tap, throwError } from 'rxjs';
import { IFProfile } from '../../../../services/profile/interfaces/profile.interface';
import { filterNilValue, isDefined } from '@datorama/akita';
import { TuiLetModule, tuiPure } from '@taiga-ui/cdk';
import { TuiAvatarModule } from '@taiga-ui/kit';
import { AsyncPipe, NgIf } from '@angular/common';
import { TuiDropdownModule } from '@taiga-ui/core';

@Component({
    selector: 'art-avatar',
    templateUrl: './user-avatar.component.html',
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        TuiAvatarModule,
        TuiLetModule,
        AsyncPipe,
        NgIf,
        TuiDropdownModule

    ]
})
export class UserAvatarComponent implements OnInit{
    @Input()
    userGuid?: string;

    @Input()
    template?: TemplateRef<any>

    @tuiPure
    public get userProfile(): Observable<IFProfile>{
        return this._userProfile
            .pipe(
                filterNilValue()
            )
    }

    private _userProfile: BehaviorSubject<IFProfile | null> = new BehaviorSubject<IFProfile | null>(null);

    constructor(
        private _profileQ: ProfileQueryService,
    ) {
    }

    public ngOnInit() {
        console.log(this.userGuid)
        if (this.userGuid){
            of(void 0)
                .pipe(
                    switchMap(() => {
                        return this._profileQ.selectEntity((s) => {
                            return s.guid === this.userGuid
                        })
                    }),
                    switchMap((entity: IFProfile | undefined) => {
                        if(!this._profileQ.hasEntity() || !isDefined(entity)){
                            return throwError(() => {})
                        }

                        return of(entity!);
                    }),
                    retry({count: 6, delay: 500}),
                    tap((user) => {
                        this._userProfile.next(user)
                    }),
                    take(3)
                )
                .subscribe()

            return;
        }

        this._profileQ.getMyself$()
            .pipe(
                filterNilValue(),
                tap((user) => this._userProfile.next(user)),
                take(1)
            )
            .subscribe()
    }
}
