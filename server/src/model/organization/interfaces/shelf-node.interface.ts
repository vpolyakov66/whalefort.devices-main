import { IAbstractNode } from './abstract-node.interface';

export interface IShelfNode extends IAbstractNode{
    isSmartShelf: boolean,
    name: string
}
