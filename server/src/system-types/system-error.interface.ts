import { SystemErrorCode } from './system-error-code.enum';

export interface ISystemError{
    error: SystemErrorCode,
    description: string
}
