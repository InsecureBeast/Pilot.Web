import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AccessCalculator } from 'src/app/core/tools/access.calculator';
import { INode } from 'src/app/documents/shared/node.interface';
import { IObjectExtensions } from 'src/app/core/tools/iobject.extensions';
import { AccessLevel } from 'src/app/core/data/data.classes';
import { RepositoryService } from 'src/app/core/repository.service';

@Component({
    selector: 'app-object-card-dialog',
    templateUrl: './object-card-dialog.component.html',
    styleUrls: ['./object-card-dialog.component.css']
})
export class ObjectCardDialogComponent {

  @Input() node : INode;
  @Output() onClose = new EventEmitter<any>();
  
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
    // modifier.edit(checkedNode.id)
    // .setAttribute($event.attrName, $event.transition.stateTo);
    // modifier.apply().subscribe(r => {
  }
}