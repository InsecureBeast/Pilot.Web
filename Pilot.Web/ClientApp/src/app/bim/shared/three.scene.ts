import { ElementRef, HostListener } from '@angular/core';

import * as THREE from 'three';
import CameraControls from 'camera-controls';
//import EdgesHelper from "three";

import { ITessellation, IIfcNode, IMeshProperties } from '../shared/bim-data.classes';
import { IScene } from '../model/iscene.interface';
import { IRender, IRenderLitener } from '../model/render/render.interface';

export class ThreeScene implements IScene, IRenderLitener {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private cameraControls: CameraControls;
  private clock = new THREE.Clock();
  private isAnimated = true;
  directLight: THREE.DirectionalLight;

  constructor(private readonly containerElement: ElementRef, private readonly render: IRender) {
    this.clock.start();
    this.createScene();
    this.createRenderer();
    this.createCamera();
    this.createCameraControls();
    this.createLight();
    this.stopAnimate();
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

  updateObjects(tessellations: ITessellation[], ifcNodes: IIfcNode[]): void {
    this.render.updateObjects(tessellations, ifcNodes, this);
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
    this.scene.background = new THREE.Color(0xF5F6FC);
    // this.scene.fog = new THREE.FogExp2(0xffffff, 0.002);

    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    const gridHelper = new THREE.GridHelper(100, 40, 0x0000ff, 0x808080);
    gridHelper.position.y = 0;
    gridHelper.position.x = 0;
    gridHelper.up.set(0, 0, 1);
    // this.scene.add(gridHelper);
  }

  private createCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 3000);
    this.camera.position.set(100, 100, 100);
    this.camera.up.set(0, 0, 1);
  }

  private createCameraControls() {
    CameraControls.install({ THREE: THREE });
    this.cameraControls = new CameraControls(this.camera, this.renderer.domElement);
    this.cameraControls.updateCameraUp();
    // this.cameraControls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
    // this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.cameraControls.dampingFactor = 0.05;
    this.cameraControls.minDistance = 1;
    this.cameraControls.maxDistance = 4000;
    // this.controls.maxPolarAngle = Math.PI / 2;
    // this.controls.enableRotate = true;

    this.cameraControls.addEventListener('controlstart', () => {
      this.startAnimate();
    });

    this.cameraControls.addEventListener('controlend', () => {
      this.stopAnimate();
    });
  }

  private createLight() {
    this.directLight = new THREE.DirectionalLight(0xffffff);
    this.directLight.position.set(1, 1, 1);
    this.scene.add(this.directLight);

    // const light1 = new THREE.DirectionalLight(0x002288);
    // light1.position.set(- 1, - 1, - 1);
    // this.scene.add( light1 );

    const light2 = new THREE.AmbientLight(0x222222);
    this.scene.add(light2);
  }

  private createRenderer(): void {
    // this.renderer = new THREE.WebGLRenderer();
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
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
      this.directLight.position.copy( this.camera.position );
      this.renderer.render(this.scene, this.camera);
      window.requestAnimationFrame(() => this.startAnimationLoop());
    }
  }

  addMesh(mesh: THREE.Mesh<THREE.Geometry | THREE.BufferGeometry, THREE.Material | THREE.Material[]>): void {
    this.scene.add(mesh);
  }

  zoomToFit(box: THREE.Box3): void {
    const fitOffset = 1.2;
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxSize = Math.max(size.x, size.y, size.z);
    const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * this.camera.fov / 360));
    const fitWidthDistance = fitHeightDistance / this.camera.aspect;
    const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);

    this.cameraControls.maxDistance = distance; // * 10;
    this.camera.far = distance * 10;
    this.camera.updateProjectionMatrix();

    this.cameraControls.setTarget(center.x, center.y, center.z);
    this.cameraControls.update(this.clock.getDelta());
  }
}
