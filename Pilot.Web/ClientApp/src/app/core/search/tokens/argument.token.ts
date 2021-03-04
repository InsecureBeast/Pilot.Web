import { TokenBase } from './base.token';

export abstract class ArgumentToken extends TokenBase {
    private _id: string;
    private _value: string;
    private _data: string;
    protected _isValid = true;

    get id(): string { return this._id; }
    get data(): string { return this._data; }
    get value(): string { return this._value; }
    get isValid(): boolean { return this._isValid; }
}
