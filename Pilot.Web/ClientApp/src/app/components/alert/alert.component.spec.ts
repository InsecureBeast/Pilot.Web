import { ComponentFixture, TestBed } from '@angular/core/testing';
import { instance, mock } from 'ts-mockito';
import { AlertComponent } from './alert.component';
import { ErrorHandlerService } from '../error/error-handler.service';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;
  let errorHandlerServiceMock: ErrorHandlerService;
  let errorHandlerService: ErrorHandlerService;

  beforeEach(async () => {
    errorHandlerServiceMock = mock(ErrorHandlerService);
    errorHandlerService = instance(errorHandlerServiceMock);

    await TestBed.configureTestingModule({
      declarations: [ AlertComponent ],
      providers: [
        { provide: ErrorHandlerService, useValue: errorHandlerService },
        ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
