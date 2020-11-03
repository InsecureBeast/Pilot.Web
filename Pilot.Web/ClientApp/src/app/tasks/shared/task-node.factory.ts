import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { RepositoryService } from '../../core/repository.service';
import { IObject } from '../../core/data/data.classes';
import { TaskNode, TaskWorkflowNode, TaskStageNode } from './task.node';
import { TypeExtensions } from '../../core/tools/type.extensions';
import { TypeIconService } from 'src/app/core/type-icon.service';
import { UserStateColorService } from 'src/app/core/data/user.state';

@Injectable({ providedIn: 'root'})
export class TaskNodeFactory {

  constructor(
    private typeIconService: TypeIconService,
    private repository: RepositoryService,
    private translate: TranslateService,
    private userStateColorService: UserStateColorService) {

  }

  createNode(source: IObject): TaskNode {
    if (TypeExtensions.isTask(source.type))
      return new TaskNode(source, this.typeIconService, this.repository, this.translate, this.userStateColorService);

    if (TypeExtensions.isWorkflow(source.type))
      return new TaskWorkflowNode(source, this.typeIconService, this.repository, this.translate, this.userStateColorService);

    if (TypeExtensions.isStage(source.type))
      return new TaskStageNode(source, this.typeIconService, this.repository, this.translate, this.userStateColorService);

    return null;
  }
}
