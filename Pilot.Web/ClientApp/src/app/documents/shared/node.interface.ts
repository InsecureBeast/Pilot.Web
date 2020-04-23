import { Injectable } from '@angular/core';
import { IObject, IChild } from '../../core/data/data.classes';

export interface INode {

  id: string;
  isDocument: boolean;
  source: IObject;
  isSource: boolean;
  isChecked: boolean;
}

export interface IObjectNode extends INode {

  loadPreview(): void;
  children: IChild[];
}
