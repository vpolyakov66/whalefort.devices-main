import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tuiPure } from '@taiga-ui/cdk';
import { UserCredentialsService } from '../../../modules/httpUserLayer';
import { Router } from '@angular/router';
import { ProcessingUnitService } from '../../../services/processing-unit.service';
import { initializeApp } from "firebase/app";
import { getAnalytics } from 'firebase/analytics';


const firebaseConfig = {
    apiKey: "AIzaSyCiWi_nc36mnJRdTZAi7cazWGgRRcBY0C4",
    authDomain: "artsoftedevices.firebaseapp.com",
    projectId: "artsoftedevices",
    storageBucket: "artsoftedevices.appspot.com",
    messagingSenderId: "412920891898",
    appId: "1:412920891898:web:32cf12046123f67752bc43",
    measurementId: "G-VMQVLE6RD8"
};

@Component({
    templateUrl: './cabinet-layout.page.html',
    styleUrls: ['./styles/cabinet-layout.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CabinetLayoutPage{

    @tuiPure
    public get isAsideOpen$(): Observable<boolean>{
        return this._isAsideOpen$.asObservable();
    }

    private _isAsideOpen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

    constructor(
        private _credService: UserCredentialsService,
        private _router: Router,
        private _coreUnit: ProcessingUnitService,
        ) {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);
    }

    public openAside(): void{
        this._isAsideOpen$.next(!this._isAsideOpen$.value)
    }

    public logout(): void{
        this._credService.clearCredential();
        this._coreUnit.resetStores();
        this._router.navigate(['/account']);
    }

    public zoneCtrl(isActive: boolean){
        if(!isActive){
            this._isAsideOpen$.next(false)
        }
    }
}
