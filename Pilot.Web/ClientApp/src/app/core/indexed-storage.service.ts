import { Injectable } from '@angular/core';

import { Store, set, get, keys } from 'idb-keyval';
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

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

@Injectable({ providedIn: 'root' })
export class IndexedGeometryStorageService {
  private readonly geometryStore: Store;
  private readonly materialStore: Store;
  constructor() {
    this.geometryStore = new Store('bim-db', 'geometry-store');
    this.materialStore = new Store('bim-db', 'material-store');
  }

  saveGeometry(id: number, geometry: THREE.Geometry): void {
    //const data = JSON.stringify(geometry);
    const bufferObjGeometry = new THREE.BufferGeometry().fromGeometry(geometry);
    set(id, bufferObjGeometry.toJSON(), this.geometryStore);
  }

  async getGeometry(id: number): Promise<THREE.Geometry> {
    return keys(this.geometryStore).then(ks => {
      if (ks.indexOf(id) === -1)
        return null;
      return get<string>(id, this.geometryStore).then(data => {
        const loader = new THREE.BufferGeometryLoader();
        const buffGeometry = loader.parse(data);
        const geometry = new THREE.Geometry();
        return geometry.fromBufferGeometry(buffGeometry);
      });
    });
  }
}
