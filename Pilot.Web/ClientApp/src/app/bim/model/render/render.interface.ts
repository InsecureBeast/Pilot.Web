import { ITessellation, IIfcNode, IMeshProperties } from '../../shared/bim-data.classes';

export interface IRenderLitener {
  zoomToFit(box: THREE.Box3): void;
  addMesh(mesh: THREE.Mesh): void;
}

export interface IRender {
  updateObjects(tessellations: ITessellation[], ifcNodes: IIfcNode[], listener: IRenderLitener): void;
  getGeometry(tessellations: ITessellation[]): Map<string, THREE.Geometry>;
  rgbaToHexA(r, g, b, a): string;
  getMaterial(materials: Map<number, THREE.Material>, meshProperty: IMeshProperties): THREE.Material;
  getObjectGeometry(geometries: Map<number, THREE.Geometry>, group: number): THREE.Geometry;
}
