import { ITessellation, IIfcNode } from '../shared/bim-data.classes';

export interface IScene {
  updateObjects(tessellations: ITessellation[], ifcNodes: IIfcNode[]): void;
  updateRendererSize();
  dispose(): void;
}
