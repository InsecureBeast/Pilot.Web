import { IType } from '../data/data.classes';
import { SystemTypes } from '../data/system.types';

export class TypeExtensions {

  public static isProjectFileOrFolder(type: IType): boolean{
    return TypeExtensions.isProjectFile(type.name) || TypeExtensions.isProjectFolder(type.name);
  }

  public static isProjectFile(typeName: string): boolean {
    return typeName === SystemTypes.PROJECT_FILE;
  }

  public static isProjectFolder(typeName: string): boolean {
    return typeName === SystemTypes.PROJECT_FOLDER;
  }

  public static isFolder(type: IType): boolean {
    return TypeExtensions.isProjectFolder(type.name) || (type.children && type.children.length > 0);
  }

  public static isDocument(type: IType): boolean {
    return !TypeExtensions.isProjectFile(type.name) && type.hasFiles;
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
