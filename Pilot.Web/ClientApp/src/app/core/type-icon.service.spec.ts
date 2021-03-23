import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { Mock } from 'ts-mocks';
import { IObject, IType } from './data/data.classes';
import { NodeStyleService } from './node-style.service';
import { SourceFileService } from './source-file.service';
import { TypeIconProvider } from './type-icon.service';

describe('TypeIconProvider', () => {
  let provider: TypeIconProvider;
  let nodeStyleService: NodeStyleService;
  let sanitizer: DomSanitizer;
  let sourceFileServiceMock: Mock<SourceFileService>;
  let sourceFileService: SourceFileService;

  beforeEach(() => {
    sourceFileServiceMock = new Mock<SourceFileService>();
    sourceFileService = sourceFileServiceMock.Object;

    TestBed.configureTestingModule({
      providers: [{ provide: SourceFileService, useValue: sourceFileService }]
    });
    provider = TestBed.inject(TypeIconProvider);
    nodeStyleService = TestBed.inject(NodeStyleService);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('should be created', () => {
    expect(provider).toBeTruthy();
  });

  it('should get svg icon as safe url', () => {
    const actual = provider.getSvgIcon('FRdwa53');
    expect(JSON.stringify(actual)).toBe('{"changingThisBreaksApplicationSecurity":"data:image/svg+xml;charset=utf-8;base64,FRdwa53"}');
  });

  it('should get type icon as safe url', () => {
    // given
    const item = new Mock<IObject>();
    const type = new Mock<IType>();
    type.setup(t => t.icon).is('deadwdqwq');
    item.setup(i => i.type).is(type.Object);

    // when
    const actual = provider.getTypeIcon(item.Object);

    // then
    expect(JSON.stringify(actual)).toBe('{"changingThisBreaksApplicationSecurity":"data:image/svg+xml;charset=utf-8;base64,deadwdqwq"}');
  });

  it('should return null type icon', () => {
    // item = null
    const a = provider.getTypeIcon(null);
    expect(a).toBeNull();

    // type icon = undefined
    const item = new Mock<IObject>();
    const type = new Mock<IType>(); // no setup for icon
    item.setup(i => i.type).is(type.Object);

    const actual = provider.getTypeIcon(item.Object);
    expect(actual).toBeNull();

    // type icon = null
    const item2 = new Mock<IObject>();
    const type2 = new Mock<IType>();
    type2.setup(t => t.icon).is(null);
    item.setup(i => i.type).is(type.Object);

    const actual2 = provider.getTypeIcon(item.Object);
    expect(actual2).toBeNull();
  });
});
