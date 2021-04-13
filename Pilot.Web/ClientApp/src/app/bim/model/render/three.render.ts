import { IRender, IRenderLitener } from './render.interface';
import { IMeshProperties, ITessellation, IIfcNode } from '../../shared/bim-data.classes';
import * as THREE from 'three';

export class ThreeRender implements IRender {

    private scale = 100;
    private geometryCount = 0;

    updateObjects(tessellations: ITessellation[], ifcNodes: IIfcNode[], listener: IRenderLitener): void {
        if (!ifcNodes || !tessellations) {
          return;
        }

        const tessellationGeometries = this.getGeometry(tessellations);
        const box = new THREE.Box3();
        const materials = new Map<number, THREE.Material>();
        const objectGeometries = new Map<number, THREE.Geometry>();

        for (const ifcNode of ifcNodes) {
          if (!ifcNode.meshesProperties) {
            continue;
          }

          Object.keys(ifcNode.meshesProperties).forEach(key => {
            const meshProperties = ifcNode.meshesProperties[key];
            const tessellationGeometry = tessellationGeometries.get(key);
            if (!tessellationGeometry) {
              return;
            }

            for (const meshProperty of meshProperties) {
              const placement = new Array(meshProperty.meshPlacement.length);
              for (let i = 0; i < meshProperty.meshPlacement.length; i++) {
                const pl = meshProperty.meshPlacement[i];
                let value = pl;
                if (pl > 1 || pl < -1) {
                  value = pl / this.scale;
                }

                const index = Math.trunc(4 * (i % 4) + i / 4);
                placement[index] = value;
              }
              const positionMatrix = new THREE.Matrix4();
              positionMatrix.elements = placement;

              const material = this.getMaterial(materials, meshProperty);
              const objGeo = tessellationGeometry.clone();
              objGeo.applyMatrix4(positionMatrix);

              const objectGeometry = this.getObjectGeometry(objectGeometries, meshProperty.meshColor);
              objectGeometry.merge(objGeo);

              objGeo.dispose();
              // const edges = new THREE.EdgesGeometry(geometry);
              // const line = new THREE.LineSegments(edges, lineMaterial);
              // group.add(line);
              this.geometryCount++;
              console.log(this.geometryCount);
            }
          });
        }

        Object.keys(objectGeometries).forEach(key => {
          const objGeometry = objectGeometries[key];
          const bufferObjGeometry = new THREE.BufferGeometry().fromGeometry(objGeometry);
          const material = materials[key];
          const mesh = new THREE.Mesh(bufferObjGeometry, material);
          box.expandByObject(mesh);
          listener.addMesh(mesh);
          bufferObjGeometry.dispose();
        });

        listener.zoomToFit(box);
        tessellationGeometries.clear();
        materials.clear();
      }

    getGeometry(tessellations: ITessellation[]): Map<string, THREE.Geometry> {
        const geometries = new Map<string, THREE.Geometry>();
        for (const tessellation of tessellations) {
            const geometry = new THREE.Geometry();
            for (let i = 0; i < tessellation.modelMesh.vertices.length; i += 3) {
                const p1 = tessellation.modelMesh.vertices[i] / this.scale;
                const p2 = tessellation.modelMesh.vertices[i + 1] / this.scale;
                const p3 = tessellation.modelMesh.vertices[i + 2] / this.scale;
                const vector = new THREE.Vector3(p1, p2, p3);
                geometry.vertices.push(vector);
            }

            for (let j = 0; j < tessellation.modelMesh.indices.length; j += 3) {
                const a = tessellation.modelMesh.indices[j];
                const b = tessellation.modelMesh.indices[j + 1];
                const c = tessellation.modelMesh.indices[j + 2];

                const n1 = tessellation.modelMesh.normals[j];
                const n2 = tessellation.modelMesh.normals[j + 1];
                const n3 = tessellation.modelMesh.normals[j + 2];
                const normal = new THREE.Vector3(n1, n2, n3);
                const face = new THREE.Face3(a, b, c, normal);
                geometry.faces.push(face);
            }

            geometries.set(tessellation.id, geometry);
        }

        return geometries;
    }

    rgbaToHexA(r: any, g: any, b: any, a: any): string {
        if (r < 0) {
            r = 255 + r;
          }

          if (g < 0) {
            g = 255 + g;
          }

          if (b < 0) {
            b = 255 + b;
          }

          if (a < 0) {
            a = 255 + a;
          }

          r = r.toString(16);
          g = g.toString(16);
          b = b.toString(16);
          a = Math.round(a * 255).toString(16);

          if (r.length === 1) {
            r = '0' + r;
          }
          if (g.length === 1) {
            g = '0' + g;
          }
          if (b.length === 1) {
            b = '0' + b;
          }
          if (a.length === 1) {
            a = '0' + a;
          }

          return '#' + r + g + b;
    }

    getMaterial(materials: Map<number, THREE.Material>, meshProperty: IMeshProperties): THREE.Material {
        let material = materials.get(meshProperty.meshColor);
        if (!material) {

            const a = (meshProperty.meshColor & 0x000000FF);
            const b = (meshProperty.meshColor & 0x0000FF00) >> 8;
            const g = (meshProperty.meshColor & 0x00FF0000) >> 16;
            const r = (meshProperty.meshColor & 0xFF000000) >> 24;
            const color = this.rgbaToHexA(r, g, b, a);
            const opacity = a / 255;
            material = new THREE.MeshStandardMaterial({ color: color, flatShading: true, transparent: a < 255, opacity: opacity });
            materials[meshProperty.meshColor] = material;
        }
        return material;
    }

    getObjectGeometry(geometries: Map<number, THREE.Geometry>, group: number): THREE.Geometry {
        let geometry = geometries[group];
        if (!geometry) {
            geometry = new THREE.Geometry();
            geometries[group] = geometry;
        }
        return geometry;
    }
}
