import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { RepositoryService } from '../../core/repository.service';
import { BimFilesService } from './bim-files.service';
import { ITessellation, IIfcNode, IIfcNodePropertySet } from './bim-data.classes';
import { BimTypeNames } from './bim-type.names';
import { IObject, IType } from '../../core/data/data.classes';

@Injectable({providedIn: 'root'})
export class BimModelService {

  private modelPartType: IType;

  constructor(private repository: RepositoryService, private bimService: BimFilesService) {
  }

  getModelPartsAsync(modelId: string, cancel: Subject<any>): Promise<IObject[]> {
    return new Promise((resolve, reject) => {
      this.repository.getObjectAsync(modelId).then(model => {
        this.modelPartType = this.repository.getTypeByName(BimTypeNames.bimModelPart);
        const children = model.children
          .filter(c => c.typeId === this.modelPartType.id)
          .map(c => c.objectId);

        this.repository.getObjectsAsync(children).then(modelParts => {
          resolve(modelParts);
        });
      });
    });
  }

  getModelPartTessellationsAsync(modelPart: IObject, cancel: Subject<any>): Promise<ITessellation[]> {
    return this.bimService.getModelPartTessellationsAsync(modelPart.id, cancel);
  }

  getModelPartIfcNodesAsync(modelPart: IObject, cancel: Subject<void>): Promise<IIfcNode[]> {
    return this.bimService.getModelPartIfcNodesAsync(modelPart.id, cancel);
  }

  async getProjectTitle(coordinationModelId: string, cancel: Subject<void>): Promise<string> {
    const coordinationModel = await this.repository.getObjectAsync(coordinationModelId);
    const project = await await this.repository.getObjectAsync(coordinationModel.parentId);
    return project.title;
  }

  getNodePropertiesAsync(node: IIfcNode, cancel: Subject<void>): Promise<IIfcNodePropertySet[]> {
    return this.bimService.getNodePropertiesAsync(node.modelPartInfo.id, node.guid, cancel);
  }
}
