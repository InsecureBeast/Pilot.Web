import { TestBed } from '@angular/core/testing';
import { SourceFileService } from './source-file.service';
import { FilesRepositoryService } from './files-repository.service';
import { instance, mock, when } from 'ts-mockito';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { IFile, IFileBody, IFileSnapshot } from './data/data.classes';
import { BehaviorSubject, Subject } from 'rxjs';

describe('RepositoryService', () => {
  let service: SourceFileService;
  let sanitizer: DomSanitizer;
  let filesRepositoryService: FilesRepositoryService;
  let filesRepositoryServiceMock: FilesRepositoryService;

  beforeEach(() => {
    filesRepositoryServiceMock = mock(FilesRepositoryService);
    filesRepositoryService = instance(filesRepositoryServiceMock);

    TestBed.configureTestingModule({
      imports: [],
      providers: [{ provide: FilesRepositoryService, useValue: filesRepositoryService }]
    });
    service = TestBed.inject(SourceFileService);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fill xps document pages async', async () => {
    // given
    const fileId = 'F90E1B56-F782-4A4A-B35A-0BD3C2356470';
    const fileMock = mock<IFile>();
    const bodyMock = mock<IFileBody>();
    const body: IFileBody = instance(bodyMock);
    const file: IFile = instance(fileMock);
    when(bodyMock.id).thenReturn(fileId);
    when(bodyMock.size).thenReturn(345);
    when(fileMock.body).thenReturn(body);
    const cancel = new Subject<any>();
    const images = new Array<SafeUrl>();
    const pageCount = new BehaviorSubject<number>(2);
    const pageBuffer1 = new Uint8Array([1, 2, 3]).buffer;
    const pageBuffer2 = new Uint8Array([1, 2, 3]).buffer;
    const page1 = new BehaviorSubject<ArrayBuffer>(pageBuffer1);
    const page2 = new BehaviorSubject<ArrayBuffer>(pageBuffer2);

    when(filesRepositoryServiceMock.getDocumentPageContent(fileId, 0)).thenReturn(page1);
    when(filesRepositoryServiceMock.getDocumentPageContent(fileId, 1)).thenReturn(page2);
    when(filesRepositoryServiceMock.getDocumentPagesCount(fileId, 345, 1)).thenReturn(pageCount);

    // when
    await service.fillXpsDocumentPagesAsync(file, 1, cancel, images);

    // then
    expect(images.length).toBe(2);
    expect(JSON.stringify(images[0])).toEqual('{"changingThisBreaksApplicationSecurity":"data:image/.png;base64,AQID"}');
    expect(JSON.stringify(images[1])).toEqual('{"changingThisBreaksApplicationSecurity":"data:image/.png;base64,AQID"}');
  });

  it('should get image file to show async', async () => {
    // given
    const fileId = 'F90E1B56-F782-4A4A-B35A-0BD3C2356470';
    const fileMock = mock<IFile>();
    const bodyMock = mock<IFileBody>();
    const body: IFileBody = instance(bodyMock);
    const file: IFile = instance(fileMock);
    when(bodyMock.id).thenReturn(fileId);
    when(bodyMock.size).thenReturn(345);
    when(fileMock.body).thenReturn(body);
    const cancel = new Subject<any>();
    const fileBuffer = new Uint8Array([3, 4, 5, 6, 7, 8, 9]).buffer;
    const fileObs = new BehaviorSubject<ArrayBuffer>(fileBuffer);
    when(filesRepositoryServiceMock.getFile(fileId, 345)).thenReturn(fileObs);

    // when
    when(fileMock.name).thenReturn('file.png');
    let image = await service.getImageFileToShowAsync(file, cancel);
    expect(JSON.stringify(image)).toEqual('{"changingThisBreaksApplicationSecurity":"data:image/.png;base64,AwQFBgcICQ=="}');

    // then
    when(fileMock.name).thenReturn('file.jpg');
    image = await service.getImageFileToShowAsync(file, cancel);
    expect(JSON.stringify(image)).toEqual('{"changingThisBreaksApplicationSecurity":"data:image/.jpg;base64,AwQFBgcICQ=="}');

    // when
    when(fileMock.name).thenReturn('file.jpeg');
    image = await service.getImageFileToShowAsync(file, cancel);
    expect(JSON.stringify(image)).toEqual('{"changingThisBreaksApplicationSecurity":"data:image/.jpeg;base64,AwQFBgcICQ=="}');

    // when
    when(fileMock.name).thenReturn('file.bmp');
    image = await service.getImageFileToShowAsync(file, cancel);
    expect(JSON.stringify(image)).toEqual('{"changingThisBreaksApplicationSecurity":"data:image/.bmp;base64,AwQFBgcICQ=="}');

    // when
    when(fileMock.name).thenReturn('file.gif');
    image = await service.getImageFileToShowAsync(file, cancel);
    expect(JSON.stringify(image)).toEqual('{"changingThisBreaksApplicationSecurity":"data:image/.gif;base64,AwQFBgcICQ=="}');

    // when
    when(fileMock.name).thenReturn('file.ico');
    image = await service.getImageFileToShowAsync(file, cancel);
    expect(JSON.stringify(image)).toEqual('{"changingThisBreaksApplicationSecurity":"data:image/.ico;base64,AwQFBgcICQ=="}');

    // when
    when(fileMock.name).thenReturn('file.svg');
    image = await service.getImageFileToShowAsync(file, cancel);
    expect(JSON.stringify(image))
    .toEqual('{"changingThisBreaksApplicationSecurity":"data:image/svg+xml;charset=utf-8;base64,AwQFBgcICQ=="}');
  });

  it('should not get image file to show async', async () => {
    // given
    const fileId = 'F90E1B56-F782-4A4A-B35A-0BD3C2356470';
    const fileMock = mock<IFile>();
    const bodyMock = mock<IFileBody>();
    const body: IFileBody = instance(bodyMock);
    const file: IFile = instance(fileMock);
    when(bodyMock.id).thenReturn(fileId);
    when(bodyMock.size).thenReturn(345);
    when(fileMock.body).thenReturn(body);
    const cancel = new Subject<any>();
    const fileBuffer = new Uint8Array([3, 4, 5, 6, 7, 8, 9]).buffer;
    const fileObs = new BehaviorSubject<ArrayBuffer>(fileBuffer);
    when(filesRepositoryServiceMock.getFile(fileId, 345)).thenReturn(fileObs);

    // when
    when(fileMock.name).thenReturn('file.doc');
    const image = await service.getImageFileToShowAsync(file, cancel);

    // then
    expect(image).toBeNull();
  });

  it('should get thumbnail file to show async', async () => {
    // given
    const fileId = 'F90E1B56-F782-4A4A-B35A-0BD3C2356470';
    const fileMock = mock<IFile>();
    const bodyMock = mock<IFileBody>();
    const body: IFileBody = instance(bodyMock);
    const file: IFile = instance(fileMock);
    when(bodyMock.id).thenReturn(fileId);
    when(bodyMock.size).thenReturn(345);
    when(fileMock.body).thenReturn(body);
    const cancel = new Subject<any>();
    const fileBuffer = new Uint8Array([3, 4, 5, 6, 7, 8, 9]).buffer;
    const fileObs = new BehaviorSubject<ArrayBuffer>(fileBuffer);
    when(filesRepositoryServiceMock.getFile(fileId, 345)).thenReturn(fileObs);

    // when
    when(fileMock.name).thenReturn('file.png');
    const image = await service.getThumbnailFileToShowAsync(file, cancel);

    // then
    expect(JSON.stringify(image)).toEqual('{"changingThisBreaksApplicationSecurity":"data:image/.png;base64,AwQFBgcICQ=="}');
  });

  it('should get xps thumbnail async', async () => {
    // given
    const fileId = 'F90E1B56-F782-4A4A-B35A-0BD3C2356470';
    const fileMock = mock<IFile>();
    const bodyMock = mock<IFileBody>();
    const body: IFileBody = instance(bodyMock);
    const file: IFile = instance(fileMock);
    when(bodyMock.id).thenReturn(fileId);
    when(bodyMock.size).thenReturn(345);
    when(fileMock.body).thenReturn(body);
    const cancel = new Subject<any>();
    const fileBuffer = new Uint8Array([3, 4, 5, 6, 7, 8, 9]).buffer;
    const fileObs = new BehaviorSubject<ArrayBuffer>(fileBuffer);
    when(filesRepositoryServiceMock.getThumbnail(fileId, 345)).thenReturn(fileObs);

    // when
    when(fileMock.name).thenReturn('file.png');
    const image = await service.getXpsThumbnailAsync(file, cancel);

    // then
    expect(JSON.stringify(image)).toEqual('{"changingThisBreaksApplicationSecurity":"data:image/.png;base64,AwQFBgcICQ=="}');
  });

  it('should check is image file', () => {
    // given
    const fileMock = mock<IFile>();
    const snapshotMock = mock<IFileSnapshot>();
    const file: IFile = instance(fileMock);
    const snapshot: IFileSnapshot = instance(snapshotMock);
    when(snapshotMock.files).thenReturn([ file ]);

    // when
    when(fileMock.name).thenReturn('file.png');
    let actual = service.isImageFile(snapshot);
    // then
    expect(actual).toBeTrue();

    // when
    when(fileMock.name).thenReturn('file.jpg');
    actual = service.isImageFile(snapshot);
    // then
    expect(actual).toBeTrue();

    // when
    when(fileMock.name).thenReturn('file.PilotThumbnail');
    actual = service.isImageFile(snapshot);
    // then
    expect(actual).toBeFalse();

    // when
    when(fileMock.name).thenReturn('file.doc');
    actual = service.isImageFile(snapshot);
    // then
    expect(actual).toBeFalse();
  });

  it('should check is svg file', () => {
    // given
    const fileMock = mock<IFile>();
    const snapshotMock = mock<IFileSnapshot>();
    const file: IFile = instance(fileMock);
    const snapshot: IFileSnapshot = instance(snapshotMock);
    when(snapshotMock.files).thenReturn([ file ]);

    // when
    when(fileMock.name).thenReturn('file.svg');
    let actual = service.isSvgFile(snapshot);
    // then
    expect(actual).toBeTrue();

    // when
    when(fileMock.name).thenReturn('file.jpg');
    actual = service.isSvgFile(snapshot);
    // then
    expect(actual).toBeFalse();

    // when
    when(fileMock.name).thenReturn('file.PilotThumbnail');
    actual = service.isSvgFile(snapshot);
    // then
    expect(actual).toBeFalse();

    // when
    when(fileMock.name).thenReturn('file.doc');
    actual = service.isSvgFile(snapshot);
    // then
    expect(actual).toBeFalse();
  });

  it('should check is xps file', () => {
    // given
    const fileMock = mock<IFile>();
    const snapshotMock = mock<IFileSnapshot>();
    const file: IFile = instance(fileMock);
    const snapshot: IFileSnapshot = instance(snapshotMock);
    when(snapshotMock.files).thenReturn([ file ]);

    // when
    when(fileMock.name).thenReturn('file.xps');
    let actual = service.isXpsFile(snapshot);
    // then
    expect(actual).toBeTrue();

    // when
    when(fileMock.name).thenReturn('file.jpg');
    actual = service.isXpsFile(snapshot);
    // then
    expect(actual).toBeFalse();

    // when
    when(fileMock.name).thenReturn('file.PilotThumbnail');
    actual = service.isXpsFile(snapshot);
    // then
    expect(actual).toBeFalse();

    // when
    when(fileMock.name).thenReturn('file.doc');
    actual = service.isXpsFile(snapshot);
    // then
    expect(actual).toBeFalse();
  });

  it('should check is known file', () => {
    // given
    const fileMock = mock<IFile>();
    const snapshotMock = mock<IFileSnapshot>();
    const file: IFile = instance(fileMock);
    const snapshot: IFileSnapshot = instance(snapshotMock);
    when(snapshotMock.files).thenReturn([ file ]);

    // when
    when(fileMock.name).thenReturn('file.pdf');
    let actual = service.isKnownFile(snapshot);
    // then
    expect(actual).toBeTrue();

    // when
    when(fileMock.name).thenReturn('file.doc');
    actual = service.isXpsFile(snapshot);
    // then
    expect(actual).toBeFalse();
  });
});
