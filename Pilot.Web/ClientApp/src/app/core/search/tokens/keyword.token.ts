// import { TokenBase, IToken } from './base.token';
// import { TranslateService } from '@ngx-translate/core';
// import { SearchTokenAliases } from './search-token.aliases';

// export interface IKeywordToken {
//     alias: string;
//     hint: string;
//     serializationAlias: string;
//     isSuggestible: boolean;
// }

// export abstract class KeywordToken extends TokenBase implements IKeywordToken {

//     constructor(protected readonly translate: TranslateService) {
//         super();
//     }

//     abstract get alias(): string;
//     abstract get hint(): string;
//     abstract get serializationAlias(): string;
//     get isSuggestible(): boolean {
//         return true;
//     }
// }

// export abstract class WhitespaceTokenBase extends KeywordToken {
//     get alias(): string {
//         return SearchTokenAliases.whitespaceAlias;
//     }
//     get hint(): string {
//         return this.translate.instant('whitespace');
//     }
//     get serializationAlias(): string {
//         return this.alias;
//     }
// }

// export abstract class NonTerminalWhitespaceToken extends WhitespaceTokenBase  {
//     get isTerminal(): boolean {
//         return false;
//     }
// }
