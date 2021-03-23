import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, Params } from '@angular/router';
import { RepositoryService } from 'src/app/core/repository.service';
import { anyString, instance, mock, verify, when, deepEqual } from 'ts-mockito';
import { AuthService } from '../auth.service';
import { AuthComponent } from './auth.component';
import { of, Subject, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { SystemIds } from 'src/app/core/data/system.ids';
import { ErrorHandlerService } from 'src/app/components/error/error-handler.service';

describe('auth component', () => {
    let component: AuthComponent;
    let fixture: ComponentFixture<AuthComponent>;

    let repositoryMock: RepositoryService;
    let repository: RepositoryService;
    let authServiceMock: AuthService;
    let authService: AuthService;
    let errorServiceMock: ErrorHandlerService;
    let errorService: ErrorHandlerService;
    let routerMock: Router;
    let router: Router;
    let activatedRouteMock: ActivatedRoute;
    let activatedRoute: ActivatedRoute;
    let snapshotMock: ActivatedRouteSnapshot;
    let snapshot: ActivatedRouteSnapshot;
    let error$: Subject<any>;
    const queryParams = new Array<Params>();

    beforeEach(() => {
        repositoryMock = mock(RepositoryService);
        repository = instance(repositoryMock);
        authServiceMock = mock(AuthService);
        authService = instance(authServiceMock);
        errorServiceMock = mock(ErrorHandlerService);
        errorService = instance(errorServiceMock);
        routerMock = mock(Router);
        router = instance(routerMock);
        activatedRouteMock = mock(ActivatedRoute);
        activatedRoute = instance(activatedRouteMock);

        // setup mocks
        error$ = new Subject<any>();
        when(authServiceMock.error).thenReturn(error$);
        when(authServiceMock.isLoggedIn).thenReturn(of(true));
        when(repositoryMock.initialize()).thenReturn(of(true));
        snapshotMock = mock(ActivatedRouteSnapshot);
        snapshot = instance(snapshotMock);
        when(snapshotMock.queryParams).thenReturn(queryParams);
        when(activatedRouteMock.snapshot).thenReturn(snapshot);

        TestBed.configureTestingModule({
            declarations: [ AuthComponent ],
            imports: [ BrowserModule, TranslateModule.forRoot(), FormsModule ],
            providers: [
                { provide: RepositoryService, useValue: repository },
                { provide: AuthService, useValue: authService },
                { provide: ErrorHandlerService, useValue: errorService },
                { provide: Router, useValue: router },
                { provide: ActivatedRoute, useValue: activatedRoute }
            ]
        });
        fixture = TestBed.createComponent(AuthComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should login', () => {
        // when
        component.username = 'name';
        component.password = 'pwd';
        component.login();

        // then
        expect(component.error).toBeNull();
        expect(component.isProcessing).toBeFalse();
        verify(authServiceMock.login('name', 'pwd')).once();
    });

    it('should login on enter', () => {
        // when
        component.username = 'name';
        component.password = 'pwd';
        component.onEnter();

        // then
        expect(component.error).toBeNull();
        expect(component.isProcessing).toBeFalse();
        verify(authServiceMock.login('name', 'pwd')).once();
    });

    it('should navigate to root on login', () => {
        // then
        queryParams['returnUrl'] = undefined;

        // when
        component.username = 'name';
        component.password = 'pwd';
        component.login();

        // then
        verify(routerMock.navigate(deepEqual(['/documents/' + SystemIds.rootId]))).once();
        expect().nothing();
    });

    it('should navigate to returnUrl on login', () => {
        // then
        queryParams['returnUrl'] = '/document/ad25cb46-d9a6-4b15-b03f-768433ed9879';

        // when
        component.username = 'name';
        component.password = 'pwd';
        component.login();

        // then
        verify(routerMock.navigateByUrl(deepEqual('/document/ad25cb46-d9a6-4b15-b03f-768433ed9879'))).once();
        expect().nothing();
    });

    // it('should navigate to search page on login', () => {
    //     // then
    //     queryParams['returnUrl'] = '%2Fdocuments%2Fad25cb46-d9a6-4b15-b03f-768433ed9879%2Fsearch%3Fq%3D%2520%25E2%2586%2592type:%2520%25D0%2594%25D0%25BE%25D0%25BA%25D1%2583%25D0%25BC%25D0%25B5%25D0%25BD%25D1%2582;';

    //     // when
    //     component.username = 'name';
    //     component.password = 'pwd';
    //     component.login();

    //     // then
    //     verify(routerMock.navigateByUrl(deepEqual('/document/ad25cb46-d9a6-4b15-b03f-768433ed9879/search?q= →type: Документ;'))).once();
    //     expect().nothing();
    // });

    it('should not login on enter', () => {
        // when
        component.username = null;
        component.password = 'pwd';
        component.onEnter();

        // then
        verify(authServiceMock.login(anyString(), anyString())).never();

        // when
        component.username = 'name';
        component.password = null;
        component.onEnter();

        // then
        verify(authServiceMock.login(anyString(), anyString())).never();

        // when
        component.username = null;
        component.password = null;
        component.onEnter();

        // then
        verify(authServiceMock.login(anyString(), anyString())).never();
        expect().nothing();
    });

    it('should show error', () => {
        // given
        const error = new HttpErrorResponse({error: 'Access denied'});
        when(repositoryMock.initialize()).thenReturn(throwError(error));
        when(errorServiceMock.handleErrorMessage(error)).thenReturn('Access denied');

        // when
        try {
            component.username = 'name';
            component.password = 'pwd';
            component.login();
        } catch (error) {
            // then
            expect(component.error).not.toBeNull();
            expect(component.error).toEqual('Access denied');
            verify(authServiceMock.login(anyString(), anyString())).never();
        }
        expect().nothing();
    });

    it('should not show error if 401', () => {
        // given
        const error = new HttpErrorResponse({error: 'Unauthorized', status: 401});
        when(repositoryMock.initialize()).thenReturn(throwError(error));
        when(errorServiceMock.handleErrorMessage(error)).thenReturn('Access denied');

        // when
        try {
            component.username = 'name';
            component.password = 'pwd';
            component.login();
        } catch (error) {
            // then
            expect(component.error).toBeNull();
            verify(authServiceMock.login(anyString(), anyString())).never();
        }
        expect().nothing();
    });

    it('should clear error on init component', fakeAsync(() => {
        // given
        component.error = 'Old error';

        // when
        error$.next(null);

        // then
        tick(1000);
        expect(component.error).toBeNull();
        expect(component.isProcessing).toBeFalse();
    }));

    it('should set error ', fakeAsync(() => {
        // given
        const error = new HttpErrorResponse({error: 'Access denied'});
        when(errorServiceMock.handleErrorMessage(error)).thenReturn('Access denied');
        component.error = null;

        // when
        error$.next(error);

        // then
        tick(1000);
        expect(component.error).not.toBeNull();
        expect(component.error).toEqual('Access denied');
        expect(component.isProcessing).toBeFalse();
    }));
});
