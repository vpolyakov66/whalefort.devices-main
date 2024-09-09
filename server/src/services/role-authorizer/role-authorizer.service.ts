import { singleton } from 'tsyringe';
import { from, map, Observable, of, switchMap, tap } from 'rxjs';
import { RoleDBM } from '../../model/role/mongo-model/role.contract';
import { AccessType } from '../../model/role/enums/access-type.enum';
import { isDefined } from '../../utils/is-defined.util';
import { OrganizationDBM } from '../../model/organization/mongo-model/organization.contract';
import { NodeType } from '../../model/organization/enums/node-type.enum';
const jp = require('jsonpath');
@singleton()
export class RoleAuthorizerService{

    /**
     * Получить уровень доступа к девайсу
     * @param {string} userGuid
     * @param {string} subjectGuid
     * @return {Observable<AccessType>}
     */
    public resolveAccess(userGuid: string, subjectGuid: string): Observable<AccessType>{
        return from(RoleDBM.find({
            $or: [
                {userList: {$in: userGuid}},
                {adminList: {$in: userGuid}},
                {ownerList: {$in: userGuid}}
            ]
        }
        ))
            .pipe(
                tap((data) => console.log(data)),
                map(() => AccessType.reject)
            )
    }

    public resolveOrgAccess(orgGuid: string, nodeGuid: string, nodeType: NodeType, subjectGuid: string): Observable<AccessType>{
        return from(OrganizationDBM.findOne({guid: orgGuid}, 'guid type children administratorList'))
            .pipe(
                switchMap((org) => {
                    const res = jp.query((org!.toObject()), `$..children[?((@.administratorList).includes('${subjectGuid}'))]..children[?(@.type == '${nodeType}' && @.guid == '${nodeGuid}')]`)
                    res.push(...jp.query((org!.toObject()), `$..children[?((@.administratorList).includes('${subjectGuid}') && @.type == '${nodeType}' && @.guid == '${nodeGuid}')]`))

                    if(isDefined(res[0])){
                        return of(AccessType.write)
                    }

                    return of(AccessType.read);
                })
            )
    }

    /**
     * Получить уровень доступа к настройке роли
     * @param {string} userGuid
     * @param {string} roleId
     * @return {Observable<AccessType>}
     */
    public resolveManagment(userGuid: string, roleId: string): Observable<AccessType>{
        return from(RoleDBM.findOne({guid: roleId}))
            .pipe(
                tap((data) => console.log(data)),
                map((data) => {
                    if(!isDefined(data)){
                        return AccessType.reject;
                    }

                    if (data!.ownerList.includes(userGuid) || data!.adminList.includes(userGuid)){
                        return AccessType.write;
                    }

                    return AccessType.read;
                })
            )
    }

    /**
     * Получить уровень доступа к скоупу
     * @param {string} userGuid
     * @param {Array<{guid: string}>} scopeList
     * @return {Observable<boolean>}
     */
    public resolveOverScope(userGuid: string, scopeList: Array<{ guid: string }>): Observable<boolean>{
        return of(false);
    }
}
