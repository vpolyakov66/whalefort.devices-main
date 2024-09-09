import { HeaderButtonTypeEnum } from "../enums/header-button-type.enum";
import { IHeaderButtonOptions } from "../interfaces/header-button-options.interface";

export class HeaderButton {
    public get isShow(): boolean {
        return this._isShow;
    }

    public get buttonType(): HeaderButtonTypeEnum {
        return this._buttonType;
    }

    public get navigate(): string {
        return this._navigate;
    }

    private _isShow: boolean = false;
    private _navigate: string = '../'
    private _buttonType: HeaderButtonTypeEnum = HeaderButtonTypeEnum.back

    constructor(
        isShow: boolean,
        options?: IHeaderButtonOptions
    ) {
        if(!isShow) {
            return;
        }
        this._isShow = isShow;
        this._buttonType = options?.buttonType ?? HeaderButtonTypeEnum.back
        this._navigate = options?.navigate ?? '../'
    }
}
