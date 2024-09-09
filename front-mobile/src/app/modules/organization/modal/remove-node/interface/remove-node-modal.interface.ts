import { OrganizationNode } from '../../../enum/organization-node.enum';
import { IAbstractNode } from '../../../interfaces/abstract-node.interface';

export interface RemoveNodeModalInterface {
    organizationGuid: string,
    buildingGuid?: string,
    unitGuid?: string
    shelfGuid?: string,
    type: OrganizationNode,
    node: IAbstractNode,

}
