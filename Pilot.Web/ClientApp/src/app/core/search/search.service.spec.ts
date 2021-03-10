import { SearchService } from './search.service';
import { SearchApi } from './search.api';
import { mock, instance, when, anything, verify } from 'ts-mockito';
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { ErrorHandlerService } from 'src/app/components/error/error-handler.service';
import { IObject } from '../data/data.classes';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('SearchService', () => {
    let service: SearchService;
    let searchApiMock: SearchApi;
    let searchApi: SearchApi;
    let errorServiceMock: ErrorHandlerService;
    let errorService: ErrorHandlerService;

    beforeEach(() => {
      searchApiMock = mock(SearchApi);
      searchApi = instance(searchApiMock);
      errorServiceMock = mock(ErrorHandlerService);
      errorService = instance(errorServiceMock);

      TestBed.configureTestingModule({
        // imports: [HttpClientTestingModule, TranslateModule.forRoot() ],
        providers: [
          { provide: SearchApi, useValue: searchApi },
          { provide: ErrorHandlerService, useValue: errorService },
          ]
      });
      service = TestBed.inject(SearchService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should notify search results', () => {
        // given
        const cancel = new Subject<any>();

        const f1 = mock<IObject>();
        const f2 = mock<IObject>();

        const found = [ f1, f2 ];
        when(searchApiMock.searchObjectsAsync('text', cancel)).thenResolve(found);

        service.searchResults$.subscribe(results => {
            // then
            expect(results.length).toBe(2);
        });

        // when
        service.searchObjects('text', cancel);
    });

    it('should notify search error', fakeAsync(() => {
        // given
        const cancel = new Subject<any>();
        const error = new HttpErrorResponse({error: 'no connection'});
        const f1 = mock<IObject>();
        const f2 = mock<IObject>();

        const found = [ f1, f2 ];
        when(searchApiMock.searchObjectsAsync('text', cancel)).thenReject(error);

        // when
        service.searchObjects('text', cancel);

        // then
        flush();
        verify(errorServiceMock.handleErrorMessage(error)).once();
        expect().nothing();
    }));
});
