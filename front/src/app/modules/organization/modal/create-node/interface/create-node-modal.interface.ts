import { OrganizationNode } from '../../../enum/organization-node.enum';

export interface CreateNodeModalInterface{
    type: OrganizationNode,
    root: string,
    building?: string,
    department?: string
}
