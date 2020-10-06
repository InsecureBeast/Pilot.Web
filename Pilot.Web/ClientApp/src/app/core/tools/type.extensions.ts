import { IType } from '../data/data.classes';
import { SystemTypes } from '../data/system.types';

export class TypeExtensions {

  static isProjectFileOrFolder(type: IType): boolean{
    return TypeExtensions.isProjectFile(type.name) || TypeExtensions.isProjectFolder(type.name);
  }

  static isProjectFile(typeName: string): boolean {
    return typeName === SystemTypes.PROJECT_FILE;
  }

  static isProjectFolder(typeName: string): boolean {
    return typeName === SystemTypes.PROJECT_FOLDER;
  }

  static isFolder(type: IType): boolean {
    return TypeExtensions.isProjectFolder(type.name) || (type.children && type.children.length > 0);
  }

  static isDocument(type: IType): boolean {
    return TypeExtensions.isProjectFile(type.name) || type.hasFiles;
  }

  static isWorkflow(type: IType): boolean {
    return type.name.startsWith("workflow_");
  }

  static isTask(type: IType): boolean {
    return type.name.startsWith("task_");
  }

  static isStage(type: IType): boolean {
    return type.name.startsWith("stage_");
  }
}
