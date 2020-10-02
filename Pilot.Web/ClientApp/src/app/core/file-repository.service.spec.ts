import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing"
import { HeadersProvider } from './headers.provider';
import { FilesRepositoryService } from './files-repository.service';

describe('FilesRepositoryService', () => {
  let service: FilesRepositoryService;
  let httpMock: HttpTestingController;
  let headersProvider: HeadersProvider;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: 'BASE_URL', useValue: 'http://localhost/' },
        FilesRepositoryService]
    });
    service = TestBed.inject(FilesRepositoryService);
    httpMock = TestBed.inject(HttpTestingController);
    headersProvider = TestBed.inject(HeadersProvider);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get document pages count', () => {
    // given
    const fileId = "8D39D207-687C-49BB-A481-0115AE18A4F8";
    service.getDocumentPagesCount(fileId, 456, 1).subscribe(count => {
        // then
        expect(count).toBe(10);
    });

    httpMock.expectOne({
      method: 'GET',
      url: 'http://localhost/api/Files/GetDocumentPagesCount?fileId=' + fileId + '&size=456&scale=1'
    })
    .flush(10);
  });

  it('should get document page content', () => {
    // given
    const fileId = "8D39D207-687C-49BB-A481-0115AE18A4F8";
    const expected = new ArrayBuffer(5);
    service.getDocumentPageContent(fileId, 2).subscribe(content => {
        // then
        expect(content).toBe(expected);
    });

    httpMock.expectOne({
      method: 'GET',
      url: 'http://localhost/api/Files/GetDocumentPageContent?fileId=' + fileId + '&page=2'
    })
    .flush(expected);
  });

  it('should get file content', () => {
    // given
    const fileId = "8D39D207-687C-49BB-A481-0115AE18A4F8";
    const expected = new ArrayBuffer(5);
    service.getFile(fileId, 564).subscribe(content => {
        // then
        expect(content).toBe(expected);
    });

    httpMock.expectOne({
      method: 'GET',
      url: 'http://localhost/api/Files/GetFile?fileId=' + fileId + '&size=564'
    })
    .flush(expected);
  });

  it('should get thumbnail content', () => {
    // given
    const fileId = "8D39D207-687C-49BB-A481-0115AE18A4F8";
    const expected = new ArrayBuffer(5);
    service.getThumbnail(fileId, 564).subscribe(content => {
        // then
        expect(content).toBe(expected);
    });

    httpMock.expectOne({
      method: 'GET',
      url: 'http://localhost/api/Files/GetThumbnail?fileId=' + fileId + '&size=564'
    })
    .flush(expected);
  });

  it('should get file archive', () => {
    // given
    const fileId = "8D39D207-687C-49BB-A481-0115AE18A4F8";
    const fileId2 = "94B71B7D-19E0-4198-B8E6-497BD70936BC";
    const ids = [ fileId, fileId2 ]; 
    const expected = new ArrayBuffer(5);
    service.getFileArchive(ids).then(content => {
        // then
        expect(content).toBe(expected);
    });

    const req = httpMock.expectOne({
      method: 'POST', 
      url: 'http://localhost/api/Files/GetFileArchive'
    });

    expect(req.request.body).toEqual(JSON.stringify(ids));
    req.flush(expected);
  });
});