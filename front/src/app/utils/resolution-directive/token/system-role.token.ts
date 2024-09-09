import { InjectionToken } from '@angular/core';
import { SystemUserRoleEnum } from '../enum/system-user-role.enum';
import { BehaviorSubject } from 'rxjs';

export const USER_SYSTEM_ROLE: InjectionToken<BehaviorSubject<SystemUserRoleEnum>> = new InjectionToken<BehaviorSubject<SystemUserRoleEnum>>('');
