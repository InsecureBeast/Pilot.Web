import { SafeUrl } from '@angular/platform-browser';
import { IObject, IChild, IAttribute } from '../../core/data/data.classes';

export interface INode {
  id: string;
  isDocument: boolean;
  source: IObject;
  isSource: boolean;
  isChecked: boolean;

  update(source: IObject) : void;
}

export interface IObjectNode extends INode {

  loadPreview(): void;
  children: IChild[];
  icon: SafeUrl;
  childrenCount: number;
  stateAttributes: IAttribute[];
}
