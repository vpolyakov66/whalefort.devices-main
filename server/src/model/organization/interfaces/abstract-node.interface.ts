import { NodeType } from '../enums/node-type.enum';

export interface IAbstractNode{
    type: NodeType;
    guid: string;
    parent: string | null
    children: IAbstractNode[]
    /**
     * Конечные устройства организации
     */
    leafList: string[],
    comment?: string
}
