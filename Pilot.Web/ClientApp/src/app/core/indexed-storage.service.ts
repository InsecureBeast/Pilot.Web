import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Injectable({providedIn: 'root'})
export class IndexedStorageService {
  constructor(private readonly dbService: NgxIndexedDBService) {
  }

  setImageFile(id: string, base64: string): void {
    this.getImageFile(id).then(value => {
      if (value)
        this.dbService.update('images', { key: id, value: base64 }).catch(er => console.log(er));
      else
        this.dbService.add('images', { key: id, value: base64 }).catch(er => console.log(er));
    });
  }

  async getImageFile(id: string): Promise<string> {
    const pair = await this.dbService.getByKey('images', id);
    if (pair)
      return pair.value;
    return null;
  }
}
