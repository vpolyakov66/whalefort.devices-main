import { IAbstractNode } from './abstract-node.interface';

export interface IBuildingNode extends IAbstractNode{
    name: string
    administratorList: string[]
    address?: string
}
