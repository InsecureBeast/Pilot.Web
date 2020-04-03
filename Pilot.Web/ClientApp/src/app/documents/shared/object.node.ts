import { SafeUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { IObject, IType, IChild, IPerson } from '../../core/data/data.classes';
import { TypeExtensions } from '../../core/tools/type.extensions';
import { TypeIconService } from '../../core/type-icon.service';
import { ImagesService } from '../../core/tools/images.service';
import { TranslateService } from '@ngx-translate/core';
import { Tools } from '../../core/tools/tools';
import { INode } from './node.interface';

export class ObjectNode implements INode {

  constructor(
    readonly source: IObject,
    isSource: boolean,
    private readonly typeIconService: TypeIconService,
    private readonly cancel: Subject<any>,
    private readonly translate: TranslateService) {

    this.source = source;
    this.created = Tools.toUtcCsDateTime(source.created).toLocaleString();
    this.id = source.id;
    this.parentId = source.parentId;
    this.title = this.getTitle(source);
    this.type = source.type;
    this.children = source.children;
    this.creator = source.creator;
    this.isDocument = this.getIsDocument(source.type);

    if (!isSource)
      this.isSource = TypeExtensions.isProjectFileOrFolder(source.type);
    else
      this.isSource = true;

    this.context = new Array<string>();
    if (source.context)
      this.context = source.context;

    this.loadTypeIcon();
    this.loadPreview();
  }

  id: string;
  parentId: string;
  title: string;
  type: IType;
  children: IChild[];
  creator: IPerson;
  created: string;
  icon: SafeUrl;
  preview: SafeUrl;
  isDocument: boolean;
  isSource: boolean;
  url: string;
  context: string[];

  isSelected: boolean;
  isChecked: boolean;

  select(): void {
    this.isSelected = !this.isSelected;
  }

  check(): void {
    this.isChecked = !this.isChecked;
  }

  loadTypeIcon(): void {
    const icon = this.typeIconService.getTypeIcon(this.source);
    if (icon === null)
      this.icon = ImagesService.emptyDocumentIcon;
    else 
      this.icon = icon;  
  }

  loadPreview(): void {
    this.typeIconService.getPreviewAsync(this.source, this.cancel)
      .then(preview => {
          this.preview = preview;
      })
      .catch(err => {
        this.preview = null;
      });
  }

  private getTitle(source: IObject): string {

    if (source.title === "Source files")
      return this.translate.instant("sourceFiles");

    return source.title;
  }

  private getIsDocument(type: IType): boolean {
    if (TypeExtensions.isProjectFile(type.name))
      return true;

    if (TypeExtensions.isProjectFolder(type.name))
      return false;

    return type.hasFiles;
  }
}
