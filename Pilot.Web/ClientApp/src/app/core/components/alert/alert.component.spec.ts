import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorHandlerService } from 'src/app/ui/error/error-handler.service';
import { instance, mock } from 'ts-mockito';
import { AlertComponent } from './alert.component';

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
