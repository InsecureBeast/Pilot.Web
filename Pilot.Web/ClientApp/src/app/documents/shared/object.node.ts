import { SafeUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';

import { IObject, IType, IChild, IPerson, IUserState, IValue, AttributeType, IAttribute } from '../../core/data/data.classes';
import { EmptyObject } from '../../core/data/empty-data.classes';
import { TypeExtensions } from '../../core/tools/type.extensions';
import { TypeIconService } from '../../core/type-icon.service';
import { ImagesService } from '../../core/tools/images.service';
import { TranslateService } from '@ngx-translate/core';
import { Tools } from '../../core/tools/tools';
import { IObjectNode } from './node.interface';

export class ObjectNode implements IObjectNode {

  constructor(
    public source: IObject,
    isSource: boolean,
    private typeIconService: TypeIconService,
    private cancel: Subject<any>,
    private translate: TranslateService) {

    this.created = Tools.toUtcCsDateTime(source.created).toLocaleString();
    this.id = source.id;
    this.parentId = source.parentId;
    this.title = this.getTitle(source);
    this.type = source.type;
    this.children = source.children;
    this.creator = source.creator;
    this.isDocument = this.getIsDocument(source.type);
    this.stateAttributes = source.type.attributes.filter(at => at.type === AttributeType.UserState);

    if (this.isDocument)
      this.childrenCount = -1;
    else
      this.childrenCount = source.children.length;

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
  childrenCount: number;
  stateAttributes: IAttribute[];

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
    if (!TypeExtensions.isDocument(this.source.type))
      return;

    this.typeIconService.getPreview(this.source, this.cancel)
      .pipe(first())
      .subscribe(preview => {
          this.preview = preview;
        },
        err => this.preview = null);
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

export class EmptyObjectNode implements IObjectNode {

  constructor() {
    this.source = new EmptyObject();
    this.children = this.source.children;
    this.childrenCount = -1;
    this.stateAttributes = new Array<IAttribute>();
  }

  id: string;
  isDocument: boolean;
  source: IObject;
  isSource: boolean;
  isChecked: boolean;
  children: IChild[];
  title: string;
  icon: SafeUrl;
  childrenCount: number;
  stateAttributes: IAttribute[];

  loadPreview(): void {
    // do nothing
  }
}
