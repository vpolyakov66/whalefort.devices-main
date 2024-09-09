import { IAbstractNode } from './abstract-node.interface';

export interface IOrganization extends IAbstractNode{
    ownerGuid: string
    name: string
}
