import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';
import { skipWhile } from 'rxjs/operators'

import { RepositoryService } from '../../core/repository.service';
import { BimFilesService } from './bim-files.service';
import { ITessellation, IIfcNode } from './bim-data.classes';
import { BimTypeNames } from './bim-type.names';
import { IObject, IType } from '../../core/data/data.classes';

@Injectable({providedIn: 'root'})
export class BimModelService {

  private modelPartType : IType;

  constructor(private repository: RepositoryService, private bimService: BimFilesService) {
    //repository.onInitialized$.subscribe(init => {
    //  if (init)
    //    this.modelPartType = this.repository.getTypeByName(BimTypeNames.bimModelPart);
    //});
  }

  getModelPartsAsync(modelId: string, cancel: Subject<any>): Promise<IObject[]> {
    return new Promise((resolve, reject) => {
      this.repository.getObjectAsync(modelId).then(model => {
        this.modelPartType = this.repository.getTypeByName(BimTypeNames.bimModelPart);
        var children = model.children
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
      for (let file of modelPart.actualFileSnapshot.files) {
        this.bimService.getModelPartTessellationsAsync(modelPart.id, file.body.id, file.body.size, cancel).then(t => {
          resolve(t);
        });
      }
    });
  }

  getModelPartIfcNodesAsync(modelPart: IObject, cancel: Subject<void>): Promise<IIfcNode[]> {
    return new Promise((resolve, reject) => {
      for (let file of modelPart.actualFileSnapshot.files) {
        this.bimService.getModelPartIfcNodesAsync(modelPart.id, file.body.id, file.body.size, cancel).then(t => {
          resolve(t);
        });
      }
    });
  }

  
}
