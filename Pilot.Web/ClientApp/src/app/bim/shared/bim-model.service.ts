import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { RepositoryService } from '../../core/repository.service';
import { BimFilesService } from './bim-files.service';
import { ITessellation } from './bim-data.classes';
import { BimTypeNames } from './bim-type.names';

@Injectable({providedIn: 'root'})
export class BimModelService {
  constructor(private repository: RepositoryService, private bimService: BimFilesService ) {

  }

  getPartTessellationsAsync(modelId: string, cancel: Subject<any>): Promise<ITessellation[]> {
    return new Promise((resolve, reject) => {
      this.repository.getObjectAsync(modelId).then(model => {
        var modelPartType = this.repository.getTypeByName(BimTypeNames.bimModelPart);
        var children = model.children
          .filter(c => c.typeId === modelPartType.id)
          .map(c => c.objectId);

        this.repository.getObjectsAsync(children).then(modelParts => {
          for (let part of modelParts) {
            for (let file of part.actualFileSnapshot.files) {
              this.bimService.getFileTessellationsAsync(part.id, file.body.id, file.body.size, cancel).then(t => {
                resolve(t);
              });
            }
          }
        });
      });
    });
  }
}
