import { Component, OnInit, OnChanges, OnDestroy, Input, SimpleChanges } from '@angular/core';
import { TaskNode } from '../../shared/task.node';
import { TranslateService } from '@ngx-translate/core';
import { TypeIconService } from 'src/app/core/type-icon.service';
import { RepositoryService } from 'src/app/core/repository.service';
import { Subject } from 'rxjs';
import { ObjectNode } from 'src/app/documents/shared/object.node';
import { RelationType, IObject } from 'src/app/core/data/data.classes';

@Component({
    selector: 'app-task-attachments',
    templateUrl: './task-attachments.component.html',
    styleUrls: ['./task-attachments.component.css']
})
/** task-attachments component*/
export class TaskAttachmentsComponent implements OnInit, OnChanges, OnDestroy {

  private ngUnsubscribe = new Subject<void>();

  @Input() taskNode: IObject;

  /** task-attachments ctor */
  constructor(private repository: RepositoryService,
    private typeIconService: TypeIconService,
    private translate: TranslateService) {

  }

  attachments: ObjectNode[];

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.attachments = new Array<ObjectNode>();

    if (!this.taskNode)
      return;

    const relations = this.taskNode.relations.filter(r => r.type === RelationType.TaskAttachments);
    if (relations.length === 0)
      return;

    this.repository.getObjectsAsync(relations.map(r => r.targetId)).then(objects => {
      for (let attachment of objects) {
        const node = new ObjectNode(attachment, null, this.typeIconService, this.ngUnsubscribe, this.translate);
        this.attachments.push(node);
      }
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  select(node: ObjectNode, event: MouseEvent): void {


  }
}
