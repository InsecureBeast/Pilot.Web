import { TestBed } from '@angular/core/testing';
import { instance, mock, when } from 'ts-mockito';
import { IFile } from '../data/data.classes';
import { FileNames } from '../data/file.names';
import { FilesSelector } from './files.selector';

describe('FilesRepositoryService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: []
    });
  });

  it('should get source file', () => {
    // given
    let fileMock = mock<IFile>();
    when(fileMock.name).thenReturn("file.doc");
    const file: IFile = instance(fileMock);
    let fileThumbnailMock = mock<IFile>();
    when(fileThumbnailMock.name).thenReturn(FileNames.THUMBNAIL_FILE_NAME_POSTFIX);
    const fileThumbnail: IFile = instance(fileThumbnailMock);

    // when
    let actual = FilesSelector.getSourceFile( [ file, fileThumbnail ]);
    // then
    expect(actual).toEqual(file);
  });

  it('should not get source file if not exists', () => {
    // given
    let fileThumbnailMock = mock<IFile>();
    when(fileThumbnailMock.name).thenReturn(FileNames.THUMBNAIL_FILE_NAME_POSTFIX);
    const fileThumbnail: IFile = instance(fileThumbnailMock);

    // when
    let actual = FilesSelector.getSourceFile( [ fileThumbnail ]);
    // then
    expect(actual).toBeNull();

    // when
    actual = FilesSelector.getSourceFile( []);
    // then
    expect(actual).toBeNull();
  });

  it('should get thumbnail file', () => {
    // given
    let fileMock = mock<IFile>();
    when(fileMock.name).thenReturn("file.doc");
    const file: IFile = instance(fileMock);
    let fileThumbnailMock = mock<IFile>();
    when(fileThumbnailMock.name).thenReturn(FileNames.THUMBNAIL_FILE_NAME_POSTFIX);
    const fileThumbnail: IFile = instance(fileThumbnailMock);

    // when
    let actual = FilesSelector.getSourceThumbnailFile( [ file, fileThumbnail ]);
    // then
    expect(actual).toEqual(fileThumbnail);
  });

  it('should return null if thumbnail file does not exists', () => {
    // given
    let fileDocMock = mock<IFile>();
    when(fileDocMock.name).thenReturn("file.doc");
    const fileDoc: IFile = instance(fileDocMock);
    let filePdfMock = mock<IFile>();
    when(filePdfMock.name).thenReturn("file.pdf");
    const filePdf: IFile = instance(filePdfMock);

    // when
    let actual = FilesSelector.getSourceThumbnailFile( [ fileDoc, filePdf ]);
    // then
    expect(actual).toBeNull();
  });

  it('should get xps file', () => {
    // given
    let fileMock = mock<IFile>();
    when(fileMock.name).thenReturn("file.xps");
    const file: IFile = instance(fileMock);
    let fileThumbnailMock = mock<IFile>();
    when(fileThumbnailMock.name).thenReturn(FileNames.THUMBNAIL_FILE_NAME_POSTFIX);
    const fileThumbnail: IFile = instance(fileThumbnailMock);

    // when
    let actual = FilesSelector.getXpsFile( [ file, fileThumbnail ]);
    // then
    expect(actual).toEqual(file);
  });

  it('should return null if xps file does not exists', () => {
    // given
    let fileMock = mock<IFile>();
    when(fileMock.name).thenReturn("file.pdf");
    const file: IFile = instance(fileMock);
    let fileThumbnailMock = mock<IFile>();
    when(fileThumbnailMock.name).thenReturn(FileNames.THUMBNAIL_FILE_NAME_POSTFIX);
    const fileThumbnail: IFile = instance(fileThumbnailMock);

    // when
    let actual = FilesSelector.getXpsFile( [ file, fileThumbnail ]);
    // then
    expect(actual).toBeNull();
  });

  it('should get pdf file', () => {
    // given
    let fileMock = mock<IFile>();
    when(fileMock.name).thenReturn("file.pdf");
    const file: IFile = instance(fileMock);
    let fileThumbnailMock = mock<IFile>();
    when(fileThumbnailMock.name).thenReturn(FileNames.THUMBNAIL_FILE_NAME_POSTFIX);
    const fileThumbnail: IFile = instance(fileThumbnailMock);

    // when
    let actual = FilesSelector.getPdfFile( [ file, fileThumbnail ]);
    // then
    expect(actual).toEqual(file);
  });

  it('should return null if pdf file does not exists', () => {
    // given
    let fileMock = mock<IFile>();
    when(fileMock.name).thenReturn("file.xps");
    const file: IFile = instance(fileMock);
    let fileThumbnailMock = mock<IFile>();
    when(fileThumbnailMock.name).thenReturn(FileNames.THUMBNAIL_FILE_NAME_POSTFIX);
    const fileThumbnail: IFile = instance(fileThumbnailMock);

    // when
    let actual = FilesSelector.getPdfFile( [ file, fileThumbnail ]);
    // then
    expect(actual).toBeNull();
  });

  it('should check is xps file', () => {
    // given
    let fileMock = mock<IFile>();
    const file: IFile = instance(fileMock);

    // when
    when(fileMock.name).thenReturn("file.xps");
    let actual = FilesSelector.isXpsFile(file);
    expect(actual).toBeTrue();

    // when
    when(fileMock.name).thenReturn("file.XPS");
    actual = FilesSelector.isXpsFile(file);
    expect(actual).toBeTrue();

    // when
    when(fileMock.name).thenReturn("file.pdf");
    actual = FilesSelector.isXpsFile(file);
    expect(actual).toBeFalse();
  });

  it('should check is pdf file', () => {
    // given
    let fileMock = mock<IFile>();
    const file: IFile = instance(fileMock);

    // when
    when(fileMock.name).thenReturn("file.pdf");
    let actual = FilesSelector.isPdfFile(file);
    expect(actual).toBeTrue();

    // when
    when(fileMock.name).thenReturn("file.PDF");
    actual = FilesSelector.isPdfFile(file);
    expect(actual).toBeTrue();

    // when
    when(fileMock.name).thenReturn("file.xps");
    actual = FilesSelector.isPdfFile(file);
    expect(actual).toBeFalse();
  });

  it('should check is thumbnail file', () => {
    // given
    let fileMock = mock<IFile>();
    const file: IFile = instance(fileMock);

    // when
    when(fileMock.name).thenReturn("file.PilotThumbnail");
    let actual = FilesSelector.isThumbnailFile(file);
    expect(actual).toBeTrue();

    // when
    when(fileMock.name).thenReturn("file.pilotthumbnail");
    actual = FilesSelector.isThumbnailFile(file);
    expect(actual).toBeFalse();

    // when
    when(fileMock.name).thenReturn("file.xps");
    actual = FilesSelector.isThumbnailFile(file);
    expect(actual).toBeFalse();
  });
});