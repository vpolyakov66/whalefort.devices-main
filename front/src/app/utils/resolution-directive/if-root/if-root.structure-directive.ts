import { Directive, Inject, OnChanges, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { USER_SYSTEM_ROLE } from '../token/system-role.token';
import { SystemUserRoleEnum } from '../enum/system-user-role.enum';
import { BehaviorSubject } from 'rxjs';

@Directive({
    selector: '[ifRoot]',
    standalone: true
})
export class IfRootStructureDirective implements OnChanges, OnInit{

    constructor(
        @Inject(USER_SYSTEM_ROLE)
        private _sysRole: BehaviorSubject<SystemUserRoleEnum>,
        private _view: ViewContainerRef,
        private template: TemplateRef<any>
    ) {
    }

    public ngOnInit() {
        switch (this._sysRole.value){
            case SystemUserRoleEnum.root:
                this._view.createEmbeddedView(this.template);
                break;
            case SystemUserRoleEnum.admin:
            case SystemUserRoleEnum.user:
                this._view.clear();
                break;

        }
    }

    public ngOnChanges() {
        switch (this._sysRole.value){
            case SystemUserRoleEnum.root:
                this._view.createEmbeddedView(this.template);
                break;
            case SystemUserRoleEnum.admin:
            case SystemUserRoleEnum.user:
                this._view.clear();
                break;

        }
    }

}
