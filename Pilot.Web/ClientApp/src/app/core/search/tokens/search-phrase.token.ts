import { ArgumentToken } from './argument.token';

export class SearchPhraseToken extends ArgumentToken {

    get alias(): string {
        throw new Error("Method not implemented.");
    }
    get hint(): string {
        throw new Error("Method not implemented.");
    }
    get serializationAlias(): string {
        throw new Error("Method not implemented.");
    }
    get nextTokens(): readonly import("./base.token").TokenBase[] {
        throw new Error("Method not implemented.");
    }

}