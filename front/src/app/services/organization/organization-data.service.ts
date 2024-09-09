import { Inject, Injectable } from '@angular/core';
import { IdentityRequestService, IResponseDataWrapper } from '../../modules/httpUserLayer';
import { ART_BACKEND_HREF } from '../../token/backend-href.token';
import { Observable, of } from 'rxjs';
import { IOrganization } from '../../modules/organization/interfaces/organization-root.interface';
import { concatUrl } from '../../utils/concat-url.util';
import { map } from 'rxjs/operators';
import { IAbstractNode } from '../../modules/organization/interfaces/abstract-node.interface';
import { HttpParams } from '@angular/common/http';
import { IFCreateBuildingRequestModel } from './interfaces/create-building.request-model';
import { IFCreateUnitRequestModel } from './interfaces/create-unit.request-model';
import { IFCreateShelfRequestModel } from './interfaces/create-shelf.request-model';
import { TransactionInterface } from '../../modules/organization/interfaces/transaction.interface';
import { HistoryRequestInterface } from '../../modules/history/interfaces/history-request.interface';
import { IFHistoryEvent } from '../../modules/history/interfaces/hystory-event.interface';
import { RemoveNodeRequestModel } from './interfaces/remove-node.request-model';
import { SystemUserRoleEnum } from '../../utils/resolution-directive/enum/system-user-role.enum';


@Injectable({providedIn: 'root'})
export class OrganizationDataService{

    private get serviceHref(): string{
        return `${this._baseHref}/organization`
    }

    constructor(
        private _requestService: IdentityRequestService,
        @Inject(ART_BACKEND_HREF)
        private _baseHref: string
    ) {
    }

    public transaction(dto: TransactionInterface): Observable<IOrganization>{
        return this._requestService.post<IOrganization, TransactionInterface>({
            url: concatUrl(this.serviceHref, 'device', 'transaction'),
            body: dto
        })
            .pipe(
                map((data: IResponseDataWrapper<IOrganization>) => data.data!)
            )
    }

    public createOrganization(name: string): Observable<IOrganization>{
        return this._requestService.post<IOrganization, {name: string}>({
            url: concatUrl(this.serviceHref, 'create', 'organization'),
            body: {
                name: name
            }
        })
            .pipe(
                map((data: IResponseDataWrapper<IOrganization>) => data.data!)
            )
    }

    public getHistoryInfo(dto: HistoryRequestInterface, orgGuid: string): Observable<IFHistoryEvent[]>{
        let params = new HttpParams();
        if (dto.type){
            if (Array.isArray(dto.type)){
                dto.type.forEach((t) => params = params.append('type', t))
            } else {
                params = params.set('type', dto.type)
            }
        }
        if (dto.deviceGuid){
            if (Array.isArray(dto.deviceGuid)){
                dto.deviceGuid.forEach((t) => params = params.append('deviceGuid', t))
            } else {
                params = params.set('deviceGuid', dto.deviceGuid)
            }
        }
        if (dto.by){
            if (Array.isArray(dto.by)){
                dto.by.forEach((t) => params = params.append('by', t))
            } else {
                params = params.set('by', dto.by)
            }
        }
        if (dto.get){
            params = params.set('get', dto.get);
        }
        if (dto.skip){
            params = params.set('skip', dto.skip);
        }
        if (dto.from){
            params = params.set('from', dto.from.toISOString());
        }
        if (dto.to){
            params = params.set('to', dto.to.toISOString());
        }

        params = params.set('organizationGuid', orgGuid);

        return this._requestService.get<IFHistoryEvent[]>({
            url: concatUrl(this.serviceHref, 'history'),
            options: {params: params}
        })
            .pipe(
                map((data: IResponseDataWrapper<IFHistoryEvent[]>) => data.data!)
            )
    }

    public createBuilding(dto: IFCreateBuildingRequestModel): Observable<IAbstractNode>{
        return this._requestService.post<IAbstractNode, IFCreateBuildingRequestModel>({
            url: concatUrl(this.serviceHref, 'create', 'building'),
            body: dto
        })
            .pipe(
                map((data) => data.data!)
            )
    }

    public removeBuilding(dto: RemoveNodeRequestModel): Observable<void>{
        return this._requestService.delete<void, RemoveNodeRequestModel>({
            url: concatUrl(this.serviceHref, 'delete', 'building'),
            body: dto
        })
            .pipe(
                map((data) => void 0)
            )
    }

    public createDepartment(dto: IFCreateUnitRequestModel): Observable<IAbstractNode>{
        return this._requestService.post<IAbstractNode, IFCreateUnitRequestModel>({
            url: concatUrl(this.serviceHref, 'create', 'unit'),
            body: dto
        })
            .pipe(
                map((data) => data.data!)
            )
    }

    public getSystemRole(): Observable<SystemUserRoleEnum>{
        return this._requestService.get<SystemUserRoleEnum>({
            url: concatUrl(this.serviceHref, 'system-role'),
        })
            .pipe(
                map((data: IResponseDataWrapper<SystemUserRoleEnum>) => data.data!)
            )
    }

    public removeDepartment(dto: RemoveNodeRequestModel): Observable<void>{
        return this._requestService.delete<void, RemoveNodeRequestModel>({
            url: concatUrl(this.serviceHref, 'delete', 'unit'),
            body: dto
        })
            .pipe(
                map((data) => void 0)
            )
    }

    public createShelf(dto: IFCreateShelfRequestModel): Observable<IAbstractNode>{
        return this._requestService.post<IAbstractNode, IFCreateShelfRequestModel>({
            url: concatUrl(this.serviceHref, 'create', 'shelf'),
            body: dto
        })
            .pipe(
                map((data) => data.data!)
            )
    }

    public removeShelf(dto: RemoveNodeRequestModel): Observable<void>{
        return this._requestService.delete<void, RemoveNodeRequestModel>({
            url: concatUrl(this.serviceHref, 'delete', 'shelf'),
            body: dto
        })
            .pipe(
                map((data) => void 0)
            )
    }

    public getMyOrganizationList(): Observable<any>{
        return of(null);


    }

    public retrieveKeys(shelfGuid: string, orgGuid: string): Observable<any>{
        return this._requestService.post({
            url: concatUrl(this.serviceHref, 'keys', 'shelf'),
            body: {
                orgGuid,
                shelfGuid
            }
        })
            .pipe(
                map((data) => data.data!)
            )
    }

    public getOrganization(guid: string): Observable<IAbstractNode>{
        return this._requestService.get<IAbstractNode>({
            url: concatUrl(this.serviceHref, 'get', 'organization'),
            options: {params: new HttpParams().set('guid', guid)}
        })
            .pipe(
                map((data: IResponseDataWrapper<IAbstractNode>) => data.data!)
            )
    }

}
