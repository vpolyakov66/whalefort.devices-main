import { OrganizationNode } from '../enum/organization-node.enum';

export interface IAbstractNode{
    type: OrganizationNode;
    guid: string;
    parent: string | null
    children: IAbstractNode[]
    /**
     * Конечные устройства организации
     */
    leafList: string[],
    comment?: string
}
