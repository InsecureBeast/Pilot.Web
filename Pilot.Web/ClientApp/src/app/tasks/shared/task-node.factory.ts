import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { TranslateService } from '@ngx-translate/core';

import { RepositoryService } from '../../core/repository.service';
import { IObject } from '../../core/data/data.classes';
import { TaskNode, TaskWorkflowNode, TaskStageNode } from './task.node';
import { TypeExtensions } from '../../core/tools/type.extensions';

@Injectable({ providedIn: 'root'})
export class TaskNodeFactory {

  constructor(private sanitizer: DomSanitizer,
    private repository: RepositoryService,
    private translate: TranslateService) {

  }

  createNode(source: IObject): TaskNode {
    if (TypeExtensions.isTask(source.type))
      return new TaskNode(source, this.sanitizer, this.repository, this.translate);

    if (TypeExtensions.isWorkflow(source.type))
      return new TaskWorkflowNode(source, this.sanitizer, this.repository, this.translate);

    if (TypeExtensions.isStage(source.type))
      return new TaskStageNode(source, this.sanitizer, this.repository, this.translate);

    return null;
  }
}
