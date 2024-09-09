import { SystemRole } from '../../system-types/systemRole/system-role.enum';

export interface UserScope{
    user: {
        guid: string,
        scopes: SystemRole[]
    }
}

export interface ShelfScope{
    user: {
        guid: string,
        symlinkedTo: string
    }
}
