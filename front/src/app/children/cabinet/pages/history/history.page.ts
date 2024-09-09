import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
    TUI_DEFAULT_MATCHER,
    TuiContextWithImplicit,
    TuiDay,
    TuiDayRange,
    TuiHandler,
    tuiIsString,
    tuiPure
} from '@taiga-ui/cdk';
import { TuiDayRangePeriod } from '@taiga-ui/kit';
import * as dayjs from 'dayjs';
import { HistoryTypeEnum } from '../../../../modules/history/enums/history-type.enum';
import { ProfileQueryService } from '../../../../stores/profile/profile-query.service';
import { DeviceQueryService } from '../../../../stores/device/device-query.service';
import { BehaviorSubject, finalize, merge, Observable, of, startWith, Subject, switchMap, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { IFProfile } from '../../../../services/profile/interfaces/profile.interface';
import { IDevice } from '../../../../modules/device-module/interfaces/device.interface';
import { IFHistoryEvent } from '../../../../modules/history/interfaces/hystory-event.interface';
import { OrganizationManagerService } from '../../../../services/organization/organization-manager.service';

const today = TuiDay.currentLocal();

@Component({
    templateUrl: './history.page.html',
    styleUrls: ['./styles/history-page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryPage{
    public dateRange: FormControl<TuiDayRange | null> = new FormControl<TuiDayRange | null>(null)
    public deviceControl: FormControl = new FormControl<string[]>([])
    public profileControl: FormControl = new FormControl<string[]>([])
    public typeControl: FormControl = new FormControl<HistoryTypeEnum[]>([])
    readonly columns: Array<keyof IFHistoryEvent> = ['type', 'object', 'subject', 'createdAt'];

    public periods = [
        new TuiDayRangePeriod(new TuiDayRange(today, today), 'За сегодня'),
        new TuiDayRangePeriod(new TuiDayRange(today.append({day: -1}), today.append({day: -1})), 'За вчера'),
        new TuiDayRangePeriod(new TuiDayRange(today.append({day: -7}), today), 'За неделю'),
        new TuiDayRangePeriod(new TuiDayRange(today.append({month: -1}), today), 'За месяц'),
    ]


    /**
     *
     */
    @tuiPure
    public get profileList$(): Observable<string[]> {
        return this._profileSearch$
            .pipe(
                startWith(''),
                switchMap((query: string) => {
                    return this._profileQ.selectAll()
                        .pipe(
                            map((list: IFProfile[]) => {
                                return list.filter((user: IFProfile) => {
                                    return TUI_DEFAULT_MATCHER(`${user.secondName ?? ''} ${user.firstName ?? ''}`, query);
                                }).map((user: IFProfile) => user.guid);
                            })
                        );
                })
            );
    }

    /**
     *
     */
    @tuiPure
    public get deviceList$(): Observable<string[]> {
        return this._deviceSearch$
            .pipe(
                startWith(''),
                switchMap((query: string) => {
                    return this._deviceQ.selectAll()
                        .pipe(
                            map((list: IDevice[]) => {
                                return list.filter((device: IDevice) => {
                                    return TUI_DEFAULT_MATCHER(`${device.name ?? ''}`, query);
                                }).map((device: IDevice) => device.guid);
                            })
                        );
                })
            );
    }

    /**
     *
     */
    @tuiPure
    public get stringifyProfile$(): Observable<TuiHandler<TuiContextWithImplicit<string> | string, string>>{
        return this._profileQ.selectAll()
            .pipe(
                map((userList: IFProfile[]) => {
                    return new Map<string, string>(userList.map<[string, string]>((user: IFProfile) => [user.guid, `${user.secondName ?? ''} ${user.firstName ?? ''}`]));
                }),
                startWith(new Map()),
                map((dict: Map<string, string>) => (id: TuiContextWithImplicit<string> | string) => (tuiIsString(id) ? dict.get(id) : dict.get(id.$implicit)) || 'Loading')
            );
    }

    /**
     *
     */
    @tuiPure
    public get stringifyDevice$(): Observable<TuiHandler<TuiContextWithImplicit<string> | string, string>>{
        return this._deviceQ.selectAll()
            .pipe(
                map((deviceList: IDevice[]) => {
                    return new Map<string, string>(deviceList.map<[string, string]>((iDevice: IDevice) => [iDevice.guid, `${iDevice.name ?? ''}`]));
                }),
                startWith(new Map()),
                map((dict: Map<string, string>) => (id: TuiContextWithImplicit<string> | string) => (tuiIsString(id) ? dict.get(id) : dict.get(id.$implicit)) || 'Loading')
            );
    }

    @tuiPure
    public get data$(): Observable<IFHistoryEvent[]>{
        return this._onSearch$
            .pipe(
                startWith(void 0),
                switchMap(() => {
                    const tuiFrom = this.dateRange.getRawValue()?.from.toLocalNativeDate();
                    const tuiTo = this.dateRange.getRawValue()?.to.toLocalNativeDate();

                    return this._orgMan.getHistoryInfo({
                        type: this.typeControl.getRawValue(),
                        skip: this._currentEvents$.value.length,
                        get: 20,
                        from: tuiFrom ? dayjs(tuiFrom).startOf('day').toDate() : undefined,
                        to: tuiTo ? dayjs(tuiTo).endOf('day').toDate() : undefined,
                        deviceGuid: this.deviceControl.getRawValue(),
                        by: this.profileControl.getRawValue()
                    })
                }),
                tap((data: IFHistoryEvent[]) => {
                    const current = this._currentEvents$.value;
                    current.push(...data);

                    this._currentEvents$.next(current);
                }),
                switchMap(() => this._currentEvents$),
                finalize(() => {
                    console.log('DEAD');
                })

            )
    }

    /**
     *
     */
    @tuiPure
    public get stringifyType$(): Observable<TuiHandler<TuiContextWithImplicit<string> | string, string>>{
        return of(this.typeArray)
            .pipe(
                map((typeList) => {
                    return new Map<string, string>(typeList.map<[string, string]>((type) => [type.type, `${type.alias}`]));
                }),
                startWith(new Map()),
                map((dict: Map<string, string>) => (id: TuiContextWithImplicit<string> | string) => (tuiIsString(id) ? dict.get(id) : dict.get(id.$implicit)) || 'Loading')
            );
    }

    /**
     *
     */
    @tuiPure
    public get typeList$(): Observable<string[]> {
        return this._typeSearch$
            .pipe(
                startWith(''),
                switchMap((query: string) => {
                    return of(this.typeArray)
                        .pipe(
                            map((list) => {
                                return list.filter((type) => {
                                    return TUI_DEFAULT_MATCHER(`${type.alias ?? ''}`, query);
                                }).map((type) => type.type);
                            })
                        );
                })
            );
    }

    private readonly _typeSearch$ = new Subject<string>();
    private readonly _deviceSearch$ = new Subject<string>();
    private readonly _profileSearch$ = new Subject<string>();
    private readonly _onSearch$ = new Subject<void>();
    private readonly _onLazyTriggered$ = new Subject<void>();

    private readonly _currentCount$ = new BehaviorSubject<number>(0);
    private readonly _currentEvents$ = new BehaviorSubject<IFHistoryEvent[]>([]);
    // private readonly _currentCount$ = new Subject<number>();

    private readonly typeArray = [
        {type: HistoryTypeEnum.deviceQueue, alias: 'Встал в очередь'},
        {type: HistoryTypeEnum.deviceQueueCancel, alias: 'Отменил бронь'},
        {type: HistoryTypeEnum.deviceQueueCancelForce, alias: 'Система сбросила бронь'},
        {type: HistoryTypeEnum.deviceTake, alias: 'Устройство взято'},
        {type: HistoryTypeEnum.deviceTakeoff, alias: 'Устройство возвращено'},
    ];


    constructor(
        private _profileQ: ProfileQueryService,
        private _deviceQ: DeviceQueryService,
        private _orgMan: OrganizationManagerService,
    ) {
    }

    public trackBy(index: number, item: IFHistoryEvent): string{
        return dayjs(item.createdAt).valueOf().toString();
    }

    public onTypeSearch(query: string | null): void{
        this._typeSearch$.next(query??'');
    }

    public onDeviceSearch(query: string | null): void{
        this._deviceSearch$.next(query??'');
    }

    public onProfileSearch(query: string | null): void{
        this._profileSearch$.next(query??'');
    }

    public onSearch(): void{
        this._onSearch$.next();
        this._currentEvents$.next([]);
        console.log('ld');
    }

    public observe(isLAst: boolean, event: IntersectionObserverEntry[]): void{
        if(event[0].isIntersecting && isLAst){
            console.log(isLAst)
            this._onSearch$.next()
        }
    }

}
