import { Injectable } from '@angular/core';
import { Store, set, get } from 'idb-keyval';

@Injectable({providedIn: 'root'})
export class IndexedStorageService {
  private customStore: Store;
  constructor() {
    this.customStore = new Store('images-db', 'thumbnails-store');
  }

  setImageFile(id: string, base64: string): void {
    set(id, base64, this.customStore);
  }

  async getImageFile(id: string): Promise<string> {
    return get(id, this.customStore);
  }
}
