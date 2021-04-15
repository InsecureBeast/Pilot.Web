import { Injectable } from '@angular/core';

export interface ITessellation {
  id: string;
  modelMesh: IModelMesh;
}

export interface IModelMesh {
  vertices: number[];
  normals: number[];
  indices: number[];
  edgeIndices: number[];
  color: number;
}

export interface IModelPartInfo {
    id: string;
    modelPartName: string;
    isIfc: boolean;
}

export interface IIfcNode {
  guid: string;
  modelPartInfo: IModelPartInfo;
  objectState: any;
  revision: Date;
  attributes: any;
  meshesProperties: Map<string, IMeshProperties[]>;
  parentGuid: string;
  name: string;
  type: string;
  representationType: string;
  representationStatus: string;
}

export interface IMeshProperties {
  meshColor: number; //r, b, g, a
  meshPlacement: number[];
}

export interface IIfcNodeProperty {
  name: string;
  unit: number;
  value: any;
}

export interface IIfcNodePropertySet {
  name: string;
  properties: IIfcNodeProperty[];
  type: any;
}
