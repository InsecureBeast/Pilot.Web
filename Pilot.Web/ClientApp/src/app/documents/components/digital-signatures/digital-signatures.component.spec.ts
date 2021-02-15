import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { IXpsDigitalSignature } from 'src/app/core/data/data.classes';
import { RepositoryService } from 'src/app/core/repository.service';
import { ErrorHandlerService } from 'src/app/ui/error/error-handler.service';
import { instance, mock, when } from 'ts-mockito';
import { DigitalSignaturesComponent } from './digital-signatures.component';

let component: DigitalSignaturesComponent;
let fixture: ComponentFixture<DigitalSignaturesComponent>;

describe('digital-signatures component', () => {
    let repositoryMock: RepositoryService;
    let repository: RepositoryService;
    let translate: TranslateService;
    let errorHandlerServiceMock : ErrorHandlerService;
    let errorHandlerService : ErrorHandlerService;

    beforeEach(async(() => {
        repositoryMock = mock(RepositoryService);
        repository = instance(repositoryMock);

        errorHandlerServiceMock = mock(ErrorHandlerService);
        errorHandlerService = instance(errorHandlerServiceMock);


        const objectId = '151512b6-6d83-4512-8e81-adfd79394e3d';
        const cancel = new Subject<any>();
        when(repositoryMock.getDocumentSignaturesAsync(objectId, cancel)).thenResolve(new Array<IXpsDigitalSignature>());

        TestBed.configureTestingModule({
            declarations: [ DigitalSignaturesComponent ],
            imports: [ BrowserModule, TranslateModule.forRoot() ],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true },
                { provide: RepositoryService, useValue: repository },
                { provide: ErrorHandlerService, useValue: errorHandlerService }
            ]
        });
        fixture = TestBed.createComponent(DigitalSignaturesComponent);
        translate = TestBed.inject(TranslateService);
        component = fixture.componentInstance;
    }));

    it('should be created', () => {
        expect(component).toBeTruthy();
      });
});
