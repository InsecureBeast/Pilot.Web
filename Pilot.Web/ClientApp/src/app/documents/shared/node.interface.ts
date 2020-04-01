import { Injectable } from '@angular/core';
import { IObject } from '../../core/data/data.classes';

export interface INode {

  id: string;
  isDocument: boolean;
  source: IObject;
  isSource: boolean;
  isChecked: boolean;
}
