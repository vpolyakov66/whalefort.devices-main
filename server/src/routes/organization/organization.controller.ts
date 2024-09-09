import { Body, Controller, Delete, Get, Post, Query, Request, Route, Security, Tags } from 'tsoa';
import { IAbstractNode } from '../../model/organization/interfaces/abstract-node.interface';
import { firstValueFrom, from, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { OrganizationDBM } from '../../model/organization/mongo-model/organization.contract';
import { IOrganizationRoot } from '../../model/organization/interfaces/organization-root.interface';
import { NodeType } from '../../model/organization/enums/node-type.enum';
import {
    ICreateOrganizationRequestModel
} from '../../model/organization/request-model/create-organization.request-model';
import { randomUUID } from 'crypto';
import { CreateBuildingRequestModel } from '../../model/organization/request-model/create-building.request-model';
import { isDefined } from '../../utils/is-defined.util';
import { ISystemError } from '../../system-types/system-error.interface';
import { SystemErrorCode } from '../../system-types/system-error-code.enum';
import { CreateUnitRequestModel } from '../../model/organization/request-model/create-unit.request-model';
import { CreateShelfRequestModel } from '../../model/organization/request-model/create-shelf.request-model';
import { IBuildingNode } from '../../model/organization/interfaces/building-node.interface';
import { IUnitNode } from '../../model/organization/interfaces/unit-node.interface';
import { IShelfNode } from '../../model/organization/interfaces/shelf-node.interface';
import { SseService } from '../../services/sse/sse.service';
import { injectable } from 'tsyringe';
import express from 'express';
import { SmartShelfDBM } from '../../model/smart-shelf/mongo-model/smart-shelf.contract';
import { ShelfState } from '../../model/smart-shelf/enum/shelf-state.enum';
import { ShelfScope, UserScope } from '../../utils/type-handlers/user-scope';
import { ApiKeyDBM } from '../../model/api-keys/mongo-model/api-key.contract';
import dayjs from 'dayjs';
import { RoleAuthorizerService } from '../../services/role-authorizer/role-authorizer.service';
import { AccessType } from '../../model/role/enums/access-type.enum';
import { ApiKeyInterface } from '../../model/api-keys/interfaces/api-key.interface';
import { SystemRole } from '../../system-types/systemRole/system-role.enum';
import { TransactionRequestModel } from '../../model/organization/request-model/transaction.request-model';
import { PathComponent } from 'jsonpath';
import { SSEEventName } from '../../services/sse/enum/event-name.enum';
import { SmartShelfInterface } from '../../model/smart-shelf/interfaces/smart-shelf.interface';
import { Document } from 'mongoose';
import { ProfileDBM } from '../../model/profile/mongo-model/profile.contract';
import { IProfile } from '../../model/profile/interfaces/profile.interface';
import { HistoryEventType } from '../../model/event/enum/history-event.type';
import { HistoryDBM } from '../../model/event/mongo-model/hystory-event.contract';
import { EventInterface } from '../../model/event/interface/event.interface';
import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { DeviceDBM } from '../../model/device/mongo-model/device.contract';
import { RoleDBM } from '../../model/role/mongo-model/role.contract';
import { IRole } from '../../model/role/interfaces/role.interface';
import { DeviceInterface } from '../../model/device/interfaces/device.interface';

const bcrypt = require('bcrypt');
const jp = require('jsonpath');

@injectable()
@Tags('Organization')
@Route("/api/v1/organization")
export class OrganizationController extends Controller{
    constructor(
        private _sse: SseService,
        private _auth: RoleAuthorizerService,
    ) {
        super();
    }

    /**
     * Создание организации
     * @return {Promise<IAbstractNode>}
     */
    @Post('create/organization')
    @Security('jwt')
    public async createOrganization(@Body() dto: ICreateOrganizationRequestModel): Promise<IAbstractNode>{
        const organizationPrebuild: IOrganizationRoot = {
            type: NodeType.root,
            guid: randomUUID(),
            ownerGuid: 'aacfa908-c3b4-4273-bbad-6c2fe0f21fa5',
            children: [],
            leafList: [],
            parent: null,
            name: dto.name
        }

        const executable = from(OrganizationDBM.create(organizationPrebuild))
            .pipe(
                tap((model) => {
                    // console.log(model);
                    // this._sse.sendEvent('Organization Created!', EventName.organization, organizationPrebuild.guid)
                })
            )

        const result = await firstValueFrom(executable);

        return result.toObject();
    }

    @Get('get/organization')
    @Security('jwt')
    public async getOrganization(@Query() guid: string): Promise<IAbstractNode | ISystemError>{
        const executable = from(OrganizationDBM.findOne({guid: guid}))
            .pipe(
                tap((model) => {
                    console.log(model);
                })
            )

        const result = await firstValueFrom(executable);

        if (!isDefined(result?.guid)){
            this.setStatus(SystemErrorCode.NOT_FOUND)

            return {
                error: SystemErrorCode.NOT_FOUND,
                description: 'Unable to find organization with current guid'
            } as ISystemError;
        }

        return result!.toObject()!;
    }

    @Get('listen')
    @Security('jwt')
    public async listen(@Request() ds: express.Request){
        return this._sse.createConnection((ds as any).user.guid).init(ds, ds.res!, () => {}) as any as void;
    }

    @Get('externalListner')
    @Security('api')
    public async listenExternal(@Request() ds: express.Request){
        return this._sse.createConnection((ds as any as ShelfScope).user.guid).init(ds, ds.res!, () => {}) as any as void;
    }

    @Get('system-role')
    @Security('jwt')
    public async getSystemRole(@Request() rs: UserScope){
        return rs.user.scopes[0];
    }

    @Delete('delete/building')
    @Security('jwt', [SystemRole.admin, SystemRole.root])
    public async deleteBuilding(@Body() dto: {organizationGuid: string, buildingGuid: string}){
        const executable = from(OrganizationDBM.findOne({guid: dto.organizationGuid}))
            .pipe(
                switchMap((orgStructure) => {
                    if (!orgStructure){
                        return throwError(() => {
                            return {
                                error: SystemErrorCode.NOT_FOUND,
                                description: 'Unable to find organization with current guid'
                            } as ISystemError
                        })
                    }

                    if(!isDefined(orgStructure!.children)){
                        orgStructure.children = []
                    }

                    //todo: Сделать рекурсивный поиск SmartShelf и их удаление.
                    orgStructure.children.splice(orgStructure.children.findIndex((v) => {
                        return v.guid === dto.buildingGuid;
                    }), 1)

                    return from(orgStructure.save())
                }),
                tap(() => {
                    from(ProfileDBM.find({symlinkedWith: dto.organizationGuid}))
                        .pipe(
                            tap((profileList) => {
                                this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.organizationUpdate)
                            }),
                            take(1)
                        )
                        .subscribe();
                })
            )

        const result = await firstValueFrom(executable);

        return void 0;
    }

    @Post('create/building')
    @Security('jwt')
    public async createBuilding(@Body() dto: CreateBuildingRequestModel): Promise<IAbstractNode> {
        const executable = from(OrganizationDBM.findOne({guid: dto.organizationGuid}))
            .pipe(
                switchMap((orgStructure) => {
                    if (!orgStructure){
                        return throwError(() => {
                            return {
                                error: SystemErrorCode.NOT_FOUND,
                                description: 'Unable to find organization with current guid'
                            } as ISystemError
                        })
                    }

                    if(!isDefined(orgStructure!.children)){
                        orgStructure.children = []
                    }

                    const guid: string = randomUUID();

                    orgStructure.children.push({
                        guid: guid,
                        parent: orgStructure.guid,
                        children: [],
                        leafList: [],
                        type: NodeType.building,
                        address: dto.address,
                        name: dto.name,
                        administratorList: dto.administratorList,
                        comment: ''
                    } as IBuildingNode)

                    return from(orgStructure.save())
                }),
                tap(() => {
                    from(ProfileDBM.find({symlinkedWith: dto.organizationGuid}))
                        .pipe(
                            tap((profileList) => {
                                this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.organizationUpdate)
                            }),
                            take(1)
                        )
                        .subscribe();
                })
            )

        const result = await firstValueFrom(executable);

        if ((result as any as ISystemError).error){
            this.setStatus((result as any as ISystemError).error)

            return result;
        }

        return result.toObject();
    }


    @Delete('delete/unit')
    @Security('jwt', [SystemRole.admin, SystemRole.root])
    public async deleteUnit(@Body() dto: {organizationGuid: string, buildingGuid: string, unitGuid: string}){
        const executable = from(OrganizationDBM.findOne({guid: dto.organizationGuid}))
            .pipe(
                switchMap((orgStructure) => {
                    if (!orgStructure){
                        return throwError(() => {
                            return {
                                error: SystemErrorCode.NOT_FOUND,
                                description: 'Unable to find organization with current guid'
                            } as ISystemError
                        })
                    }

                    if(!isDefined(orgStructure!.children)){
                        orgStructure.children = []
                    }

                    const building = orgStructure.children.find((x) => x.guid === dto.buildingGuid);

                    if (!isDefined(building)){
                        return throwError(() => {
                            return {
                                error: SystemErrorCode.NOT_FOUND,
                                description: 'Unable to find building with current guid'
                            } as ISystemError
                        })
                    }

                    //todo: Сделать рекурсивный поиск SmartShelf и их удаление.
                    building.children.splice(building.children.findIndex((v) => {
                        return v.guid === dto.unitGuid;
                    }), 1)

                    return from(orgStructure.save())
                }),
                tap(() => {
                    from(ProfileDBM.find({symlinkedWith: dto.organizationGuid}))
                        .pipe(
                            tap((profileList) => {
                                this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.organizationUpdate)
                            }),
                            take(1)
                        )
                        .subscribe();
                })
            )


        const result = await firstValueFrom(executable);

        return void 0;
    }

    @Post('create/unit')
    @Security('jwt')
    public async createUnit(@Body() dto: CreateUnitRequestModel): Promise<IAbstractNode> {
        const executable = from(OrganizationDBM.findOne( {guid: dto.organizationGuid} ))
            .pipe(
                switchMap((orgStructure) => {
                    if (!orgStructure){
                        return throwError(() => {
                            return {
                                error: SystemErrorCode.NOT_FOUND,
                                description: 'Unable to find organization with current guid'
                            } as ISystemError
                        })
                    }

                    const building = orgStructure.children.find((x) => x.guid === dto.buildingGuid);

                    if (!isDefined(building)){
                        return throwError(() => {
                            return {
                                error: SystemErrorCode.NOT_FOUND,
                                description: 'Unable to find building with current guid'
                            } as ISystemError
                        })
                    }

                    building.children.push({
                        guid: randomUUID(),
                        parent: building.guid,
                        children: [],
                        leafList: [],
                        type: NodeType.unit,
                        name: dto.name,
                        comment: '',
                        administratorList: dto.administratorList
                    } as IUnitNode)

                    return from(orgStructure.save())
                }),
                tap(() => {
                    from(ProfileDBM.find({symlinkedWith: dto.organizationGuid}))
                        .pipe(
                            tap((profileList) => {
                                this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.organizationUpdate)
                            }),
                            take(1)
                        )
                        .subscribe();
                })
            )

        const result = await firstValueFrom(executable);

        if ((result as any as ISystemError).error){
            this.setStatus((result as any as ISystemError).error)

            return result;
        }

        return result.toObject();
    }

    @Delete('delete/shelf')
    @Security('jwt', [SystemRole.admin, SystemRole.root])
    public async deleteShelf(@Body() dto: {organizationGuid: string, buildingGuid: string, unitGuid: string, shelfGuid: string}){
        const executable = from(OrganizationDBM.findOne({guid: dto.organizationGuid}))
            .pipe(
                switchMap((orgStructure) => {
                    if (!orgStructure){
                        return throwError(() => {
                            return {
                                error: SystemErrorCode.NOT_FOUND,
                                description: 'Unable to find organization with current guid'
                            } as ISystemError
                        })
                    }

                    console.log(orgStructure);

                    const building = orgStructure.children.find((x) => x.guid === dto.buildingGuid)!;

                    if (dto.unitGuid){
                        console.log(dto.unitGuid, building.children);
                        const unit = building.children.find((q) => q.guid === dto.unitGuid)
                        if (!isDefined(unit)){
                            return throwError(() => {
                                return {
                                    error: SystemErrorCode.NOT_FOUND,
                                    description: 'Unable to find unit with current guid'
                                } as ISystemError
                            })
                        }

                        console.log(unit.children);


                        unit.children.splice(unit.children.findIndex((v) => {
                            return v.guid === dto.shelfGuid;
                        }), 1)

                    } else {
                        //todo: Сделать рекурсивный поиск SmartShelf и их удаление.
                        building.children.splice(building.children.findIndex((v) => {
                            return v.guid === dto.shelfGuid;
                        }))
                    }

                    return from(orgStructure.save())
                }),
                tap(() => {
                    from(ProfileDBM.find({symlinkedWith: dto.organizationGuid}))
                        .pipe(
                            tap((profileList) => {
                                this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.organizationUpdate)
                            }),
                            take(1)
                        )
                        .subscribe();
                })
            )


        const result = await firstValueFrom(executable);

        return void 0;
    }

    @Post('create/shelf')
    @Security('jwt')
    public async createShelf(@Body() dto: CreateShelfRequestModel): Promise<IAbstractNode> {
        const executable = from(OrganizationDBM.findOne( {guid: dto.organizationGuid} ))
            .pipe(
                switchMap((orgStructure) => {
                    if (!orgStructure){
                        return throwError(() => {
                            return {
                                error: SystemErrorCode.NOT_FOUND,
                                description: 'Unable to find organization with current guid'
                            } as ISystemError
                        })
                    }


                    const building = orgStructure.children.find((x) => x.guid === dto.buildingGuid);

                    if (!isDefined(building)){
                        return throwError(() => {
                            return {
                                error: SystemErrorCode.NOT_FOUND,
                                description: 'Unable to find building with current guid'
                            } as ISystemError
                        })
                    }

                    const guid = randomUUID();

                    if (dto.unitGuid){
                        const unit = building.children.find((q) => q.guid === dto.unitGuid)
                        if (!isDefined(unit)){
                            return throwError(() => {
                                return {
                                    error: SystemErrorCode.NOT_FOUND,
                                    description: 'Unable to find unit with current guid'
                                } as ISystemError
                            })
                        }

                        unit.children.push({
                            guid: guid,
                            parent: unit.guid,
                            children: [],
                            leafList: [],
                            type: NodeType.shelf,
                            name: dto.name,
                            isSmartShelf: !!dto.isSmartShelf
                        } as IShelfNode)

                    } else {
                        building.children.push({
                            guid: guid,
                            parent: building.guid,
                            children: [],
                            leafList: [],
                            type: NodeType.shelf,
                            name: dto.name,
                            isSmartShelf: !!dto.isSmartShelf
                        } as IShelfNode)
                    }



                    return from(orgStructure.save())
                        .pipe(
                            switchMap((data) => {
                                if(dto.isSmartShelf){

                                    return from(SmartShelfDBM.create({
                                        guid: guid,
                                        state: ShelfState.closed,
                                        deviceList: [],
                                        unverifiedDeviceList: []
                                    }))
                                        .pipe(
                                            map(() => data)
                                        )
                                }

                                return of(data)
                            })
                        )
                }),
                tap(() => {
                    from(ProfileDBM.find({symlinkedWith: dto.organizationGuid}))
                        .pipe(
                            tap((profileList) => {
                                this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.organizationUpdate)
                            }),
                            take(1)
                        )
                        .subscribe();
                })
            )

        const result = await firstValueFrom(executable);

        if ((result as any as ISystemError).error){
            this.setStatus((result as any as ISystemError).error)

            return result;
        }

        return result.toObject();
    }

    @Post('keys/shelf')
    @Security('jwt')
    public async generateKey(@Body() dto: {shelfGuid: string, orgGuid: string}, @Request() rq: UserScope){
        const executable = from(OrganizationDBM.findOne({guid: dto.orgGuid}))
            .pipe(
                switchMap((org) => {
                    return this._auth.resolveOrgAccess(org!.guid, dto.shelfGuid, NodeType.shelf, rq.user.guid);
                }),
                switchMap((acc: AccessType) => {
                    if(acc === AccessType.write){
                        return from(SmartShelfDBM.findOne({guid: dto.shelfGuid}))
                    }

                    return throwError(() => 'Unable to find shelf in org')
                }),
                switchMap((sshelf) => {
                    return from(ApiKeyDBM.create({
                        value: bcrypt.hashSync(randomUUID(), 10),
                        symlinkedTo: dto.orgGuid,
                        createdBy: rq.user.guid,
                        createdAt: dayjs().toDate(),
                        guid: dto.shelfGuid
                    }))
                })
            )

        const result = await firstValueFrom(executable);

        return result.toObject() as ApiKeyInterface;
    }

    @Get('history')
    @Security('jwt')
    public async getHistory(@Query('organizationGuid') organizationGuid: string,
                            @Query('deviceGuid') deviceGuid?: string[],
                            @Query('type') type?: HistoryEventType[],
                            @Query('from') fromDate?: Date,
                            @Query('to') toDate?: Date,
                            @Query('get') getEntities?: number,
                            @Query('skip') skip?: number,
                            @Query('by') by?: string[],
                            @Request() rq?: UserScope){
        let query = {};
        if(deviceGuid){
            if (Array.isArray(deviceGuid)){
                console.log(deviceGuid);

                Object.defineProperty(query, 'object', {
                    enumerable: true,
                    value: {$in: deviceGuid}
                })
            } else {
                console.log(deviceGuid, 'NARR');

                Object.defineProperty(query, 'object', {
                    enumerable: true,
                    value: deviceGuid
                })
            }
        }
        if(by){
            if (Array.isArray(by)){
                Object.defineProperty(query, 'subject', {
                    enumerable: true,
                    value: {$in: by}
                })
            } else {

                Object.defineProperty(query, 'subject', {
                    enumerable: true,
                    value: by
                })
            }
        }
        if(type){
            if (Array.isArray(type)){
                Object.defineProperty(query, 'type', {
                    enumerable: true,
                    value: {$in: type}
                })
            } else {
                Object.defineProperty(query, 'type', {
                    enumerable: true,
                    value: type
                })
            }
        }
        if (fromDate || toDate){
            if(fromDate && toDate){
                Object.defineProperty(query, 'createdAt', {
                    enumerable: true,
                    value: {$gte: dayjs(fromDate).toISOString(), $lte: dayjs(toDate).toISOString()}
                })
            } else {
                if(fromDate){
                    Object.defineProperty(query, 'createdAt', {
                        enumerable: true,
                        value: {$gte: dayjs(fromDate).toISOString()}
                    })
                }
                if(toDate){
                    Object.defineProperty(query, 'createdAt', {
                        enumerable: true,
                        value: {$lte: dayjs(toDate).toISOString()}
                    })
                }
            }

        }

        let prepareExec: Observable<any>;

        if(rq!.user.scopes.includes(SystemRole.root)){
            prepareExec = of(void 0)
        }
        if(!rq!.user.scopes.includes(SystemRole.root)) {
            prepareExec = from(RoleDBM.find({
                $and:
                    [
                        {
                            $or: [
                                {userList: rq!.user.guid},
                                {ownerList: rq!.user.guid},
                                {adminList: rq!.user.guid}
                            ]
                        },
                        {
                            organizationGuid: organizationGuid
                        }
                    ]

            }))
                .pipe(
                    switchMap((data) => {
                        console.log(data);
                        const dataList: IRole[] = data as any as IRole[];

                        const targetList: string[] = [ ...new Set(dataList.map((role: IRole) => role.deviceList).reduce((acc, devList) => [ ...acc, ...devList ], [])) ]

                        return from(DeviceDBM.find({guid: {$in: targetList}}))
                    }),
                    map((data) => (data as any as Array<Document>).map((q: Document) => (q.toObject() as DeviceInterface).guid)),
                    tap((deviceList: string[]) => {
                        const q = query as any
                        if (q.object){
                            if(Array.isArray(q.object.value)){
                                const filtered = q.object.value.$in.filter((d: string) => deviceList.includes(d))
                                q.object.value.$in = filtered.length > 0 ? filtered : ['no-sequence']

                                return;
                            } else {
                                if(!deviceList.includes(q.object.value)){
                                    q.object.value = 'no-sequence'

                                    return;
                                }
                            }
                        }

                        Object.defineProperty(query, 'object', {
                            enumerable: true,
                            value: {$in: type}
                        })
                    })
                )
        }

        const executable = prepareExec!
            .pipe(
                switchMap(() => {
                    return from(HistoryDBM.find(query, undefined, {skip: skip??0, limit: getEntities}))
                }),
                map((data) => (data as any as Array<Document>).map((q: Document) => q.toObject()))
            )

        return await firstValueFrom(executable) as any as EventInterface[];
    }

    @Post('device/transaction')
    @Security('jwt', [SystemRole.root, SystemRole.admin])
    public async transactionDevice(@Body() dto: TransactionRequestModel, @Request() rq: UserScope){
        const executable = from(OrganizationDBM.findOne({guid: dto.orgGuid}))
            .pipe(
                switchMap((org) => {
                    const path = jp.nodes(org!.toObject(), `$..children[?((@.leafList).includes('${dto.deviceGuid}'))]`)[0]?.path
                    if(path){
                        const nestedLevel = path.filter((s: PathComponent) => s === 'children').length
                        if(nestedLevel === 3){
                            dto.from = {
                                building: org!.children[Number(path[2])].guid,
                                unit: org!.children[Number(path[2])].children[Number(path[4])].guid,
                                shelf: org!.children[Number(path[2])].children[Number(path[4])].children[Number(path[6])].guid,
                            }
                        }
                        if(nestedLevel === 2){
                            dto.from = {
                                building: org!.children[Number(path[2])].guid,
                                unit: org!.children[Number(path[2])].children[Number(path[4])].guid,
                            }
                        }
                    }
                    const nodeGuid = dto.to.shelf ?? dto.to.unit ?? dto.to.building
                    const nodeType = dto.to.shelf ? NodeType.shelf : dto.to.unit ? NodeType.unit : NodeType.building

                    return this._auth.resolveOrgAccess(org!.guid, nodeGuid, nodeType, rq.user.guid)
                        .pipe(
                            switchMap((acc: AccessType) => {
                                if(acc === AccessType.write){
                                    return from(OrganizationDBM.findOne({guid: dto.orgGuid}))
                                }

                                return throwError(() => 'Unable to find or you have not access')
                            }),
                        );
                }),
                switchMap((org) => {
                    let transactionShelf$: Observable<any> = of(void 0)

                    if(dto.from?.building){
                        this.relocateDevice(org!, dto.from as any, dto.deviceGuid, false)
                        if (dto.from.shelf){
                            transactionShelf$ = transactionShelf$.pipe(
                                switchMap(() => {
                                    return from(SmartShelfDBM.findOne({guid: dto.from!.shelf}))
                                }),
                                switchMap((shelf) => {
                                    if(shelf){
                                        shelf.deviceList.splice(shelf.deviceList.indexOf(dto.deviceGuid), 1);
                                        shelf.unverifiedDeviceList.splice(shelf.deviceList.indexOf(dto.deviceGuid), 1);

                                        return from(shelf.save())
                                    }

                                    return of(void 0)
                                })
                            )
                        }

                    }
                    this.relocateDevice(org!, dto.to, dto.deviceGuid, true)
                    if(dto.to.shelf){
                        transactionShelf$ = transactionShelf$.pipe(
                            switchMap(() => {
                                return from(SmartShelfDBM.findOne({guid: dto.to!.shelf}))
                            }),
                            switchMap((shelf) => {
                                if(shelf){
                                    shelf.unverifiedDeviceList.push(dto.deviceGuid);

                                    return from(shelf.save())
                                }

                                return of(void 0)
                            })
                        )
                    }



                    return from(org!.save())
                        .pipe(
                            switchMap(() => transactionShelf$),
                            tap(() => {
                                from(ProfileDBM.find({symlinkedWith: dto.orgGuid}))
                                    .pipe(
                                        tap((profileList) => {
                                            this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.shelfStateChange)
                                            this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.organizationUpdate)
                                        }),
                                        take(1)
                                    )
                                    .subscribe();
                            }),
                            map(() => org)
                        )
                }),

            )

        const result = await firstValueFrom(executable);

        return result!.toObject() as IAbstractNode;
    }

    @Get('enclave/all')
    @Security('jwt')
    public async getAllShelf(@Request() rq: UserScope, @Query('orgGuid') guid: string){
        const executable = from(OrganizationDBM.findOne({guid: guid}))
            .pipe(
                switchMap((org) => {
                    const allNodes = (jp.query((org!.toObject()), '$..children[?(@.type == "shelf" && @.isSmartShelf == true)]') ?? [])
                        .map((node: IAbstractNode) => node.guid)

                    console.log(allNodes);

                    return from(SmartShelfDBM.find({guid: {$in: allNodes}}))
                }),
                map((data) => (data as any as Array<Document>).map((q: Document) => q.toObject()))
            )

        const res = await firstValueFrom(executable);

        return res;
    }

    private relocateDevice(org: IOrganizationRoot, path: TransactionRequestModel['to'], device: string, isAdd: boolean){
        const firstGuid = path.building
        const secondGuid = path.unit
        const thirdGuid = path.shelf

        const firstKey: number = org.children.findIndex((b) => b.guid === firstGuid)!;

        const secondKey: number = org.children[firstKey].children.findIndex((u) => u.guid === secondGuid);

        const thirdKey: number = org.children[firstKey].children[secondKey].children.findIndex((s) => s.guid === thirdGuid);

        let target: string[];

        if(firstKey > -1){
            if(secondKey > -1 && thirdKey === -1){
                target = org.children[firstKey].children[secondKey].leafList
            }
            if (secondKey > -1 && thirdKey > -1){
                target = org.children[firstKey].children[secondKey].children[thirdKey].leafList
            }
        }

        if(isAdd){
            target!.push(device)
        } else {
            target!.splice(target!.indexOf(device), 1)
        }
    }

    @Post('enclave/open')
    @Security('jwt')
    public async openEnclave(@Request() rq: UserScope, @Body() dto: {deviceGuid: string, orgGuid: string, reason: ShelfState}){
        const executable = from(OrganizationDBM.findOne({guid: dto.orgGuid}))
            .pipe(
                switchMap((org) => {
                    const path = jp.nodes(org!.toObject(), `$..children[?((@.leafList).includes('${dto.deviceGuid}'))]`)[0]?.value;

                    if (path && path.type === 'shelf' && path.isSmartShelf){
                        // this._sse.sendEvent([])
                        return from(SmartShelfDBM.findOne({guid: path.guid}))
                    }

                    return throwError(() => 'Unable to locate device')
                }),
                switchMap((smartShelf) => {
                    smartShelf!.state = dto.reason;
                    smartShelf!.verifyDeviceGuid = dto.deviceGuid;

                    return from(smartShelf!.save())
                }),
                tap((shelf) => {
                    console.log(shelf.guid);
                    this._sse.sendEvent$([shelf.guid],'UP', SSEEventName.shelfStateChange)
                    // from(ProfileDBM.find({symlinkedWith: dto.orgGuid}))
                    //     .pipe(
                    //         tap((profileList) => {
                    //             this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.shelfStateChange)
                    //         }),
                    //         take(1)
                    //     )
                    //     .subscribe();
                })
            )

        const result = await firstValueFrom(executable);

        return void 0;
    }

    @Post('enclave/register')
    @Security('jwt')
    public async registerDeviceEnclave(@Request() rq: UserScope, @Body() dto: {deviceGuid: string, orgGuid: string}){
        const executable = from(OrganizationDBM.findOne({guid: dto.orgGuid}))
            .pipe(
                switchMap((org) => {
                    const path = jp.nodes(org!.toObject(), `$..children[?((@.leafList).includes('${dto.deviceGuid}'))]`)[0]?.value;

                    if (path && path.type === 'shelf' && path.isSmartShelf){
                        // this._sse.sendEvent([])
                        return from(SmartShelfDBM.findOne({guid: path.guid}))
                    }

                    return throwError(() => 'Unable to locate device')
                }),
                switchMap((smartShelf) => {
                    smartShelf!.state = ShelfState.beginAdding;
                    smartShelf!.verifyDeviceGuid = dto.deviceGuid;
                    smartShelf!.unverifiedDeviceList.push(dto.deviceGuid)

                    return from(smartShelf!.save())
                }),
                tap((shelf) => {
                    this._sse.sendEvent$([shelf.guid],'UP', SSEEventName.shelfStateChange)
                    // from(ProfileDBM.find({symlinkedWith: dto.orgGuid}))
                    //     .pipe(
                    //         tap((profileList) => {
                    //             this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.shelfStateChange)
                    //         }),
                    //         take(1)
                    //     )
                    //     .subscribe();
                })
            )

        const result = await firstValueFrom(executable);

        return void 0;
    }

    @Post('enclave/registerCancel')
    @Security('jwt')
    public async registerDeviceCancelEnclave(@Request() rq: UserScope, @Body() dto: {deviceGuid: string, orgGuid: string}){
        const executable = from(OrganizationDBM.findOne({guid: dto.orgGuid}))
            .pipe(
                switchMap((org) => {
                    const path = jp.nodes(org!.toObject(), `$..children[?((@.leafList).includes('${dto.deviceGuid}'))]`)[0]?.value;

                    if (path && path.type === 'shelf' && path.isSmartShelf){
                        // this._sse.sendEvent([])
                        return from(SmartShelfDBM.findOne({guid: path.guid}))
                    }

                    return throwError(() => 'Unable to locate device')
                }),
                switchMap((smartShelf) => {
                    console.log(smartShelf);

                    smartShelf!.state = ShelfState.closed;
                    smartShelf!.verifyDeviceGuid = undefined;

                    console.log(smartShelf);

                    return from(smartShelf!.save())
                }),
                tap((shelf) => {
                    this._sse.sendEvent$([shelf.guid],'UP', SSEEventName.shelfStateChange)
                    from(ProfileDBM.find({symlinkedWith: dto.orgGuid}))
                        .pipe(
                            tap((profileList) => {
                                this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.shelfStateChange)
                            }),
                            take(1)
                        )
                        .subscribe();
                })
            )

        const result = await firstValueFrom(executable);

        return void 0;
    }

    /**
     * Уведомить о том, что устройство подключено к ГУ верификации
     * @param {UserScope} rq
     * @param {{deviceGuid: string, orgGuid: string}} dto
     * @return {Promise<void>}
     */
    @Post('enclave/verify')
    @Security('jwt')
    public async verifyEnclave(@Request() rq: UserScope, @Body() dto: {deviceGuid: string, orgGuid: string}){
        const executable = from(OrganizationDBM.findOne({guid: dto.orgGuid}))
            .pipe(
                switchMap((org) => {
                    const path = jp.nodes(org!.toObject(), `$..children[?((@.leafList).includes('${dto.deviceGuid}'))]`)[0]?.value;

                    if (path && path.type === 'shelf' && path.isSmartShelf){
                        // this._sse.sendEvent([])
                        return from(SmartShelfDBM.findOne({guid: path.guid}))
                    }

                    return throwError(() => 'Unable to locate device')
                }),
                switchMap((smartShelf) => {
                    smartShelf!.state = ShelfState.openForVerify;
                    smartShelf!.verifyDeviceGuid = dto.deviceGuid;

                    return from(smartShelf!.save())
                }),
                tap((shelf) => {
                    this._sse.sendEvent$([shelf.guid],'UP', SSEEventName.shelfStateChange)
                    // from(ProfileDBM.find({symlinkedWith: dto.orgGuid}))
                    //     .pipe(
                    //         tap((profileList) => {
                    //             this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.shelfStateChange)
                    //         }),
                    //         take(1)
                    //     )
                    //     .subscribe();
                })
            )

        const result = await firstValueFrom(executable);

        return void 0;
    }

    @Get('shelf/state')
    @Security('api')
    public async getShelfState(@Request() rq: ShelfScope){
        const exec = from(SmartShelfDBM.findOne({guid: rq.user.guid}))
            .pipe(
                map((data) => data!.toObject())
            )

        const res = await firstValueFrom(exec);

        return res;
    }

    @Post('shelf/change')
    @Security('api')
    public async changeShelfState(@Request() rq: ShelfScope, @Body() dto: Omit<SmartShelfInterface, 'guid' | 'apiKey'>){
        console.log(rq);

        const executable = from(SmartShelfDBM.findOne({guid: rq.user.guid}))
            .pipe(
                switchMap((data) => {
                    console.log(data);

                    data!.state = dto.state;
                    data!.verifyDeviceGuid = dto.verifyDeviceGuid;

                    return from(data!.save())
                }),
                tap(() => {
                    from(ProfileDBM.find({symlinkedWith: rq.user.symlinkedTo}))
                        .pipe(
                            tap((profileList) => {
                                this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), 'UP', SSEEventName.shelfStateChange)
                            }),
                            take(1)
                        )
                        .subscribe();
                })
            )

        const res = await firstValueFrom(executable);

        return void 0;
    }

    @Post('shelf/verified')
    @Security('api')
    public async verifyDevice(@Request() rq: ShelfScope, @Body() dto: { deviceGuid: string }){
        const executable = from(SmartShelfDBM.findOne({guid: rq.user.guid}))
            .pipe(
                switchMap((data) => {
                    data!.state = ShelfState.verifyComplete;
                    data!.verifyDeviceGuid = undefined;
                    data!.unverifiedDeviceList.splice(data!.unverifiedDeviceList.indexOf(dto.deviceGuid), 1)
                    data!.deviceList.push(dto.deviceGuid)

                    return from(data!.save())
                }),
                tap(() => {
                    from(ProfileDBM.find({symlinkedWith: rq.user.symlinkedTo}))
                        .pipe(
                            tap((profileList) => {
                                this._sse.sendEvent((profileList as IProfile[]).map((q) => q.guid), '200', SSEEventName.deviceRegistered, dto.deviceGuid)
                            }),
                            take(1)
                        )
                        .subscribe();
                })
            )

        const res = await firstValueFrom(executable);

        return void 0;
    }
}
