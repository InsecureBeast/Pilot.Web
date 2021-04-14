import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { RepositoryService } from '../../core/repository.service';
import { BimFilesService } from './bim-files.service';
import { ITessellation, IIfcNode } from './bim-data.classes';
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
    return new Promise((resolve, reject) => {
      for (const file of modelPart.actualFileSnapshot.files) {
        this.bimService.getModelPartTessellationsAsync(modelPart.id, file.body.id, file.body.size, cancel).then(t => {
          resolve(t);
        }, e => reject(e));
      }
    });
  }

  getModelPartIfcNodesAsync(modelPart: IObject, cancel: Subject<void>): Promise<IIfcNode[]> {
    return new Promise((resolve, reject) => {
      for (const file of modelPart.actualFileSnapshot.files) {
        this.bimService.getModelPartIfcNodesAsync(modelPart.id, file.body.id, file.body.size, cancel).then(t => {
          resolve(t);
        }, e => reject(e));
      }
    });
  }

  async getProjectTitle(coordinationModelId: string, cancel: Subject<void>): Promise<string> {
    const coordinationModel = await this.repository.getObjectAsync(coordinationModelId);
    const project = await await this.repository.getObjectAsync(coordinationModel.parentId);
    return project.title;
  }
}
