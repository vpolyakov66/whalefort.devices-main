import { IAbstractNode } from './abstract-node.interface';

export interface IUnitNode extends IAbstractNode{
    name: string
    administratorList: string[]
}
