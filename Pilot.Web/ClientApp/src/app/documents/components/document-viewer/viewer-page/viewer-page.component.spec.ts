import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { FilesRepositoryService } from 'src/app/core/files-repository.service';
import { RepositoryService } from 'src/app/core/repository.service';
import { SourceFileService } from 'src/app/core/source-file.service';
import { RemarksService } from 'src/app/documents/shared/remarks.service';
import { instance, mock, when } from 'ts-mockito';
import { Remark } from '../../remarks/remark';
import { RemarksScrollPositionService } from '../scroll.service';

import { ViewerPageComponent } from './viewer-page.component';

describe('ViewerPageComponent', () => {
  let component: ViewerPageComponent;
  let fixture: ComponentFixture<ViewerPageComponent>;
  
  let sanitizer: DomSanitizer;
  let repositoryMock: RepositoryService;
  let repository: RepositoryService;
  let fileRepoServiceMock: FilesRepositoryService;
  let fileRepoService: FilesRepositoryService;
  let remarksServiceMock: RemarksService;
  let remarksService: RemarksService;
  let remarksScrollMock: RemarksScrollPositionService;
  let remarksScroll: RemarksScrollPositionService;

  beforeEach(async () => {
    repositoryMock = mock(RepositoryService);
    repository = instance(repositoryMock);
    fileRepoServiceMock = mock(FilesRepositoryService);
    fileRepoService = instance(fileRepoServiceMock);
    
    remarksServiceMock = mock(RemarksService);
    remarksService = instance(remarksServiceMock);
    when(remarksServiceMock.remarksVisibility).thenReturn(new Subject<true>());
    when(remarksServiceMock.selectedRemark).thenReturn(new Subject<Remark>());
    
    remarksScrollMock = mock(RemarksScrollPositionService);
    remarksScroll = instance(remarksScrollMock);

    await TestBed.configureTestingModule({
      declarations: [ ViewerPageComponent ],
      providers: [
        { provide: FilesRepositoryService, useValue: fileRepoService },
        { provide: RepositoryService, useValue: repository },
        { provide: RemarksService, useValue: remarksService },
        { provide: RemarksScrollPositionService, useValue: remarksScroll }
      ]
    })
    .compileComponents();

    sanitizer = TestBed.inject(DomSanitizer);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
