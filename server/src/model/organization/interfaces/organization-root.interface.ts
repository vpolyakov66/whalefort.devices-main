import { IAbstractNode } from './abstract-node.interface';

export interface IOrganizationRoot extends IAbstractNode{
    ownerGuid: string
    name: string
}
