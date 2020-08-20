import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { AccessCalculator } from 'src/app/core/tools/access.calculator';
import { INode } from 'src/app/documents/shared/node.interface';
import { IObjectExtensions } from 'src/app/core/tools/iobject.extensions';
import { AccessLevel } from 'src/app/core/data/data.classes';
import { RepositoryService } from 'src/app/core/repository.service';
import { DocumentCardComponent } from '../document-card/document-card.component';

@Component({
    selector: 'app-object-card-dialog',
    templateUrl: './object-card-dialog.component.html',
    styleUrls: ['./object-card-dialog.component.css']
})
export class ObjectCardDialogComponent {

  @Input() node : INode;
  @Output() onClose = new EventEmitter<any>();
  @Output() onSave = new EventEmitter<string>();
  
  @ViewChild(DocumentCardComponent, { static: false })
  private cardComponent: DocumentCardComponent;
  
  constructor(
    private readonly repository: RepositoryService,
    private readonly accessCalculator: AccessCalculator) {

  }
    
  close() : void {
    this.onClose.emit();
  }

  isReadonly(): boolean {
    if (!this.node)
        return true;  
        
    const accessLevel = this.accessCalculator.calcAccess(this.node.source);
    const hasWriteAccess = IObjectExtensions.hasAccess(accessLevel, AccessLevel.Edit);
    return !hasWriteAccess;
  }

  save(): void {
    if (!this.node)
        return;   

    const modifier = this.repository.newModifier();
    var changed = this.cardComponent.changedAttributes;
    const builder = modifier.edit(this.node.id);

    changed.forEach((value: any, key: string) => {
      builder.setAttribute(key, value);
    });
    
    modifier.apply().subscribe(res => {
      this.onSave.emit(this.node.id);
    });
  }
}