import { TokenBase } from './base.token';
import { TranslateService } from '@ngx-translate/core';
import { SearchTokenAliases } from './search-token.aliases';
import { SearchPhraseToken } from './search-phrase.token';

 export interface IKeywordToken {
     alias: string;
     hint: string;
     serializationAlias: string;
 }

 export abstract class KeywordToken extends TokenBase implements IKeywordToken {

     constructor(protected readonly translate: TranslateService) {
         super(translate);
     }

     abstract get alias(): string;
     abstract get hint(): string;
     abstract get serializationAlias(): string;
 }

export abstract class WhitespaceTokenBase extends KeywordToken {
    get alias(): string {
        return SearchTokenAliases.whitespaceAlias;
    }
    get hint(): string {
        return this.translate.instant('whitespace');
    }
    get serializationAlias(): string {
        return this.alias;
    }
}

export abstract class NonTerminalWhitespaceToken extends WhitespaceTokenBase  {
    get isTerminal(): boolean {
        return false;
    }
}

export class WhitespaceToken extends WhitespaceTokenBase {

    static termOccure = 'TermOccur';

    get nextTokens(): readonly TokenBase[] {
        return [
            new WhitespaceToken(this.translate),
            new SearchPhraseToken(this.translate)
        ];
    }

}
// public class WhitespaceToken : WhitespaceTokenBase
//     {
//         public const string TERM_OCCUR = "TermOccur";

//         protected override List<Type> ValidNextTypes { get; } = new List<Type>
//         {
//             typeof(WhitespaceToken),
//             typeof(MustNotToken),
//             typeof(SearchPhraseToken),
//             typeof(StartQuotedSearchPhraseToken),
//             typeof(TypeToken),
//             typeof(AuthorToken),
//             typeof(SignatureAwaitingToken),
//             typeof(SignedToken),
//             typeof(CreatedKeywordToken),
//             typeof(AttributeToken),
//             typeof(SnapshotCreatedKeywordToken),
//             typeof(SnapshotReasonToken),
//             typeof(StateToken),
//             typeof(SearchContextToken)
//         };
//     }
