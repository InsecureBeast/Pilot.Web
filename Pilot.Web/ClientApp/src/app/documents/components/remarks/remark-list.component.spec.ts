import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';
import { RemarksService } from '../../shared/remarks.service';
import { Remark } from './remark';

import { RemarkListComponent } from './remark-list.component';

describe('RemarksComponent', () => {
  let component: RemarkListComponent;
  let fixture: ComponentFixture<RemarkListComponent>;

  let remarksServiceMock: RemarksService;
  let remarksService: RemarksService;
  
  beforeEach(async () => {
    remarksServiceMock = mock(RemarksService);
    remarksService = instance(remarksServiceMock);
    when(remarksServiceMock.remarks).thenReturn(new Subject<Remark[]>());
    
    await TestBed.configureTestingModule({
      declarations: [ RemarkListComponent ],
      providers: [
        { provide: RemarksService, useValue: remarksService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RemarkListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
