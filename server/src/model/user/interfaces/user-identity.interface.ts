import { SystemRole } from '../../../system-types/systemRole/system-role.enum';

export interface UserIdentityInterface{
     username: string;
     password: string;
     guid?: string;
     scopeList?: SystemRole[]
}
