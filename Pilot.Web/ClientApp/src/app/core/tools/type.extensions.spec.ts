import { TestBed } from '@angular/core/testing';
import { instance, mock, when } from 'ts-mockito';
import { IType } from '../data/data.classes';
import { TypeExtensions } from './type.extensions';

describe('FilesRepositoryService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: []
    });
  });

  it('should check type name is project file', () => {
    // given
    let typename = "File";
    // when
    let actual = TypeExtensions.isProjectFile(typename);
    // then
    expect(actual).toBeTrue();

    // given
    typename = "Type1";
    // when
    actual = TypeExtensions.isProjectFile(typename);
    // then
    expect(actual).toBeFalse();
  });

  it('should check type name is project folder', () => {
    // given
    let typename = "Project_folder";
    // when
    let actual = TypeExtensions.isProjectFolder(typename);
    // then
    expect(actual).toBeTrue();

    // given
    typename = "Type1";
    // when
    actual = TypeExtensions.isProjectFolder(typename);
    // then
    expect(actual).toBeFalse();
  });

  it('should check type is project folder or project file', () => {
    // given
    let typeMock = mock<IType>();
    const type: IType = instance(typeMock);
    
    // when
    when(typeMock.name).thenReturn("Project_folder");
    let actual = TypeExtensions.isProjectFileOrFolder(type);
    expect(actual).toBeTrue();

    // when
    when(typeMock.name).thenReturn("File");
    actual = TypeExtensions.isProjectFileOrFolder(type);
    expect(actual).toBeTrue();

    // when
    when(typeMock.name).thenReturn("project_folder");
    actual = TypeExtensions.isProjectFileOrFolder(type);
    expect(actual).toBeFalse();

    // when
    when(typeMock.name).thenReturn("file");
    actual = TypeExtensions.isProjectFileOrFolder(type);
    expect(actual).toBeFalse();

    // when
    when(typeMock.name).thenReturn("type");
    actual = TypeExtensions.isProjectFileOrFolder(type);
    expect(actual).toBeFalse();
  });

  it('should check type is folder', () => {
    // given
    let typeMock = mock<IType>();
    const type: IType = instance(typeMock);

    // when
    when(typeMock.name).thenReturn("Project_folder");
    let actual = TypeExtensions.isFolder(type);
    // then
    expect(actual).toBeTrue();

    // given
    when(typeMock.name).thenReturn("FolderType");
    when(typeMock.children).thenReturn([2,3]);
    // when
    actual = TypeExtensions.isFolder(type);
    // then
    expect(actual).toBeTrue();

    // given
    when(typeMock.name).thenReturn("NotFolderType");
    when(typeMock.children).thenReturn([]);
    // when
    actual = TypeExtensions.isFolder(type);
    // then
    expect(actual).toBeFalse();
  });

  it('should check type is document', () => {
    // given
    let typeMock = mock<IType>();
    const type: IType = instance(typeMock);

    // when
    when(typeMock.name).thenReturn("File");
    let actual = TypeExtensions.isDocument(type);
    // then
    expect(actual).toBeTrue();

    // given
    when(typeMock.name).thenReturn("DocumentType");
    when(typeMock.hasFiles).thenReturn(true);
    // when
    actual = TypeExtensions.isDocument(type);
    // then
    expect(actual).toBeTrue();

    // given
    when(typeMock.name).thenReturn("NotDocumentType");
    when(typeMock.hasFiles).thenReturn(false);
    // when
    actual = TypeExtensions.isDocument(type);
    // then
    expect(actual).toBeFalse();
  });

  it('should check type is workflow', () => {
    // given
    let typeMock = mock<IType>();
    const type: IType = instance(typeMock);

    // when
    when(typeMock.name).thenReturn("workflow_agreement");
    let actual = TypeExtensions.isWorkflow(type);
    expect(actual).toBeTrue();

    // when
    when(typeMock.name).thenReturn("workflowagreement");
    actual = TypeExtensions.isWorkflow(type);
    expect(actual).toBeFalse();

    // when
    when(typeMock.name).thenReturn("NotWorkflowType");
    actual = TypeExtensions.isWorkflow(type);
    expect(actual).toBeFalse();
  });

  it('should check type is task', () => {
    // given
    let typeMock = mock<IType>();
    const type: IType = instance(typeMock);

    // when
    when(typeMock.name).thenReturn("task_agreement");
    let actual = TypeExtensions.isTask(type);
    expect(actual).toBeTrue();

    // when
    when(typeMock.name).thenReturn("taskagreement");
    actual = TypeExtensions.isTask(type);
    expect(actual).toBeFalse();

    // when
    when(typeMock.name).thenReturn("NotTaskType");
    actual = TypeExtensions.isTask(type);
    expect(actual).toBeFalse();
  });

  it('should check type is stage', () => {
    // given
    let typeMock = mock<IType>();
    const type: IType = instance(typeMock);

    // when
    when(typeMock.name).thenReturn("stage_agreement");
    let actual = TypeExtensions.isStage(type);
    expect(actual).toBeTrue();

    // when
    when(typeMock.name).thenReturn("stageagreement");
    actual = TypeExtensions.isStage(type);
    expect(actual).toBeFalse();

    // when
    when(typeMock.name).thenReturn("NotStageType");
    actual = TypeExtensions.isStage(type);
    expect(actual).toBeFalse();
  });
});