import { ElementRef, HostListener } from '@angular/core';

import * as THREE from 'three';
import CameraControls from "camera-controls"
//import EdgesHelper from "three/"

import { ITessellation, IIfcNode, IMeshProperties } from '../shared/bim-data.classes';
import { IScene } from '../model/iscene.interface';

export class ThreeScene implements IScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private cameraControls: CameraControls;
  private scale = 100;
  private clock = new THREE.Clock();
  private isAnimated: boolean = true;
  private geometryCount = 0;

  constructor(private readonly containerElement: ElementRef) {
    this.clock.start();
    this.createScene();
    this.createRenderer();
    this.createCamera();
    this.createCameraControls();
    this.createLight();
    this.stopAnimate();
  }

  updateObjects(tessellations: ITessellation[], ifcNodes: IIfcNode[]): void {
    if (!ifcNodes || !tessellations)
      return;

    const tessellationGeometries = this.getGeometry(tessellations);
    const box = new THREE.Box3();
    const materials = new Map<number, THREE.Material>();
    const objectGeometries = new Map<number, THREE.Geometry>();

   
    for (let ifcNode of ifcNodes) {
      if (!ifcNode.meshesProperties)
        continue;

      Object.keys(ifcNode.meshesProperties).forEach(key => {
        const meshProperties = ifcNode.meshesProperties[key];
        const tessellationGeometry = tessellationGeometries.get(key);
        if (!tessellationGeometry)
          return;

        for (let meshProperty of meshProperties) {
          
          const placement = new Array(meshProperty.meshPlacement.length);
          for (let i = 0; i < meshProperty.meshPlacement.length; i++) {
            const pl = meshProperty.meshPlacement[i];
            let value = pl;
            if (pl > 1 || pl < -1)
              value = pl / this.scale;

            const index = Math.trunc(4 * (i % 4) + i / 4);
            placement[index] = value;
          }

          const positionMatrix = new THREE.Matrix4();
          positionMatrix.elements = placement;

          const material = this.getMaterial(materials, meshProperty);
          var objGeo = tessellationGeometry.clone();
          objGeo.applyMatrix4(positionMatrix);

          let objectGeometry = this.getObjectGeometry(objectGeometries, meshProperty.meshColor);
          objectGeometry.merge(objGeo);
          
          objGeo.dispose();
          //const edges = new THREE.EdgesGeometry(geometry);
          //const line = new THREE.LineSegments(edges, lineMaterial);
          //group.add(line);
          this.geometryCount++;
          console.log(this.geometryCount);

        }
      });
    }

    Object.keys(objectGeometries).forEach(key => {
      var objGeometry = objectGeometries[key];
      const bufferObjGeometry = new THREE.BufferGeometry().fromGeometry(objGeometry);
      const material = materials[key];
      const mesh = new THREE.Mesh(bufferObjGeometry, material);
      box.expandByObject(mesh);
      this.scene.add(mesh);
      bufferObjGeometry.dispose();
    });

    this.zoomToFit(box);
    tessellationGeometries.clear();
    materials.clear();
  }


  dispose(): void {
    this.renderer.dispose();
    this.renderer = null;
    this.scene.dispose();
    this.scene = null;
    this.cameraControls.dispose();
    this.cameraControls = null;
    this.clock.stop();
  }

  updateRendererSize() {
    const width = this.containerElement.nativeElement.offsetWidth - 2;
    const height = this.containerElement.nativeElement.offsetHeight - 2;

    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
    if (this.camera) {
      const aspect = width / height;
      this.camera.aspect = aspect;
      this.camera.updateProjectionMatrix();
    }
  }

  startAnimate() {
    this.isAnimated = true;
    this.startAnimationLoop();
  }

  stopAnimate() {
    this.isAnimated = false;
    this.renderer.render(this.scene, this.camera);
  }

  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    //this.scene.fog = new THREE.FogExp2(0xffffff, 0.002);

    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    const gridHelper = new THREE.GridHelper(100, 40, 0x0000ff, 0x808080);
    gridHelper.position.y = 0;
    gridHelper.position.x = 0;
    gridHelper.up.set(0, 0, 1);
    //this.scene.add(gridHelper);
  }

  private createCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 2000);
    this.camera.position.set(100, 100, 100);
    this.camera.up.set(0, 0, 1);
  }

  private createCameraControls() {
    CameraControls.install({ THREE: THREE });
    this.cameraControls = new CameraControls(this.camera, this.renderer.domElement);
    this.cameraControls.updateCameraUp();
    //this.controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
    //this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.cameraControls.dampingFactor = 0.05;
    this.cameraControls.minDistance = 1;
    this.cameraControls.maxDistance = 2000;
    //this.controls.maxPolarAngle = Math.PI / 2;
    //this.controls.enableRotate = true;

    this.cameraControls.addEventListener("controlstart", () => {
      this.startAnimate();
    });

    this.cameraControls.addEventListener("controlend", () => {
      this.stopAnimate();
    });
  }

  private createLight() {
    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    this.scene.add(light);

    //const light1 = new THREE.DirectionalLight(0x002288);
    //light1.position.set(- 1, - 1, - 1);
    //this.scene.add( light1 );

    const light2 = new THREE.AmbientLight(0x222222);
    this.scene.add(light2);
  }

  private createRenderer(): void {
    //this.renderer = new THREE.WebGLRenderer();
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.updateRendererSize();
    this.containerElement.nativeElement.appendChild(this.renderer.domElement);
  }

  private startAnimationLoop() {
    if (this.cameraControls) {
      const delta = this.clock.getDelta();
      this.cameraControls.update(delta);
    }

    if (this.renderer && this.isAnimated) {
      this.renderer.render(this.scene, this.camera);
      window.requestAnimationFrame(() => this.startAnimationLoop());
    }
  }

  private getGeometry(tessellations: ITessellation[]): Map<string, THREE.Geometry> {
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

  private rgbaToHexA(r, g, b, a) {

    if (r < 0)
      r = 255 + r;

    if (g < 0)
      g = 255 + g;

    if (b < 0)
      b = 255 + b;

    if (a < 0)
      a = 255 + a;

    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);
    a = Math.round(a * 255).toString(16);

    if (r.length === 1)
      r = "0" + r;
    if (g.length === 1)
      g = "0" + g;
    if (b.length === 1)
      b = "0" + b;
    if (a.length === 1)
      a = "0" + a;

    return "#" + r + g + b;
  }

  private zoomToFit(box: THREE.Box3): void {
    const fitOffset = 1.2;
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxSize = Math.max(size.x, size.y, size.z);
    const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * this.camera.fov / 360));
    const fitWidthDistance = fitHeightDistance / this.camera.aspect;
    const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);

    this.cameraControls.maxDistance = distance;// * 10;
    this.camera.far = distance * 10;
    this.camera.updateProjectionMatrix();

    this.cameraControls.setTarget(center.x, center.y, center.z);
    this.cameraControls.update(this.clock.getDelta());
  }

  private getMaterial(materials: Map<number, THREE.Material>, meshProperty: IMeshProperties): THREE.Material {
    let material = materials.get(meshProperty.meshColor);
    if (!material) {

      const a = (meshProperty.meshColor & 0x000000FF);
      const b = (meshProperty.meshColor & 0x0000FF00) >> 8;
      const g = (meshProperty.meshColor & 0x00FF0000) >> 16;
      const r = (meshProperty.meshColor & 0xFF000000) >> 24;
      const color = this.rgbaToHexA(r, g, b, a);
      const opacity = a / 255;
      material = new THREE.MeshBasicMaterial({ color: color, flatShading: true, transparent: a < 255, opacity: opacity });
      materials[meshProperty.meshColor] = material;
    }

    return material;
  }

  private getObjectGeometry(geometries: Map<number, THREE.Geometry>, group: number): THREE.Geometry {
    let geometry = geometries[group];
    if (!geometry) {
      geometry = new THREE.Geometry();
      geometries[group] = geometry;
    }
    return geometry;
  }
}
