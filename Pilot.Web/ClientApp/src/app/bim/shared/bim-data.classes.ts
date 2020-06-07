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


export interface IIfcNode {
  parentGuid : string;
  modelPartId: string;
  guid: string;
  name: string;
  type: string;
  attributes: string;
  objectState: any;
  meshesProperties: Map<string, IMeshProperties[]>;
}

export interface IMeshProperties {
  meshColor: number; //r, b, g, a
  meshPlacement: number[];
}
