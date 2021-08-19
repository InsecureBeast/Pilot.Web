import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { RepositoryService } from 'src/app/core/repository.service';
import { SourceFileService } from 'src/app/core/source-file.service';
import { instance, mock, when } from 'ts-mockito';
import { RemarksService } from '../../shared/remarks.service';

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
  let remarksScrollMock: RemarksScrollPositionService;
  let remarksScroll: RemarksScrollPositionService;

  beforeEach(async () => {
    repositoryMock = mock(RepositoryService);
    repository = instance(repositoryMock);
    sourceFileServiceMock = mock(SourceFileService);
    sourceFileService = instance(sourceFileServiceMock);
    remarksServiceMock = mock(RemarksService);
    remarksService = instance(remarksServiceMock);
    remarksScrollMock = mock(RemarksScrollPositionService);
    remarksScroll = instance(remarksScrollMock);
    when(remarksScrollMock.position).thenReturn(new Subject<number>());

    await TestBed.configureTestingModule({
      declarations: [ DocumentViewerComponent ],
      providers: [
        { provide: SourceFileService, useValue: sourceFileService },
        { provide: RepositoryService, useValue: repository },
        { provide: RemarksService, useValue: remarksService },
        { provide: RemarksScrollPositionService, useValue: remarksScroll }
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
