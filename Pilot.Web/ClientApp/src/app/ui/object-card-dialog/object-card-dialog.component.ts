import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { AccessCalculator } from 'src/app/core/tools/access.calculator';
import { IObjectExtensions } from 'src/app/core/tools/iobject.extensions';
import { AccessLevel, IObject } from 'src/app/core/data/data.classes';
import { RepositoryService } from 'src/app/core/repository.service';
import { DocumentCardComponent } from '../document-card/document-card.component';
import { ObjectCardDialogService } from './object-card-dialog.service';

@Component({
    selector: 'app-object-card-dialog',
    templateUrl: './object-card-dialog.component.html',
    styleUrls: ['./object-card-dialog.component.css']
})
export class ObjectCardDialogComponent {

  @Input() object: IObject;
  @Output() onClose = new EventEmitter<any>();
  //@Output() onSave = new EventEmitter<string>();
  
  @ViewChild(DocumentCardComponent, { static: false })
  private cardComponent: DocumentCardComponent;
  
  constructor(
    private readonly repository: RepositoryService,
    private readonly accessCalculator: AccessCalculator,
    private readonly objectCardDialogService: ObjectCardDialogService) {

  }
    
  close() : void {
    this.onClose.emit();
  }

  isReadonly(): boolean {
    if (!this.object)
        return true;  
        
    const accessLevel = this.accessCalculator.calcAccess(this.object);
    const hasWriteAccess = IObjectExtensions.hasAccess(accessLevel, AccessLevel.Edit);
    return !hasWriteAccess;
  }

  save(): void {
    if (!this.object)
        return;   

    const modifier = this.repository.newModifier();
    var changed = this.cardComponent.changedAttributes;
    const builder = modifier.edit(this.object.id);

    changed.forEach((value: any, key: string) => {
      builder.setAttribute(key, value);
    });
    
    modifier.apply().subscribe(res => {
      this.objectCardDialogService.changeDocumentForCard(this.object.id);
      //this.onSave.emit(this.object.id);
    });
  }
}