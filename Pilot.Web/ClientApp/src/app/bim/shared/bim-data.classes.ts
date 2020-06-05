import { Injectable } from '@angular/core';

export interface ITessellation {
  id:string;
  modelMesh: IModelMesh;
}

export interface IModelMesh {
  vertices: number[];
  normals: number[];
  indices: number[];
  edgeIndices: number[];
  color: number;
}
