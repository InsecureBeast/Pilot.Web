import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { RepositoryService } from 'src/app/core/repository.service';
import { SourceFileService } from 'src/app/core/source-file.service';
import { instance, mock, when } from 'ts-mockito';
import { RemarksService } from '../../shared/remarks.service';
import { Remark } from '../remarks/remark';

import { DocumentViewerComponent } from './document-viewer.component';
import { RemarksScrollPositionService } from './scroll.service';

describe('DocumentViewerComponent', () => {
  let component: DocumentViewerComponent;
  let fixture: ComponentFixture<DocumentViewerComponent>;

  let repositoryMock: RepositoryService;
  let repository: RepositoryService;
  let sourceFileServiceMock: SourceFileService;
  let sourceFileService: SourceFileService;
  let remarksServiceMock: RemarksService;
  let remarksService: RemarksService;

  beforeEach(async () => {
    repositoryMock = mock(RepositoryService);
    repository = instance(repositoryMock);
    sourceFileServiceMock = mock(SourceFileService);
    sourceFileService = instance(sourceFileServiceMock);
    remarksServiceMock = mock(RemarksService);
    remarksService = instance(remarksServiceMock);
    when(remarksServiceMock.selectedRemark).thenReturn(new Subject<Remark>());

    await TestBed.configureTestingModule({
      declarations: [ DocumentViewerComponent ],
      providers: [
        { provide: SourceFileService, useValue: sourceFileService },
        { provide: RepositoryService, useValue: repository },
        { provide: RemarksService, useValue: remarksService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
