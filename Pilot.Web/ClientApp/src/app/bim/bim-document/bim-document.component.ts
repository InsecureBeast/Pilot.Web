import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterContentChecked, AfterViewInit } from '@angular/core';
import { ActivatedRoute, ParamMap, NavigationStart, Router } from '@angular/router';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Subscription, Subject } from 'rxjs';

import { BimModelService } from '../shared/bim-model.service';
import { ITessellation, IIfcNode, IMeshProperties } from '../shared/bim-data.classes';

@Component({
    selector: 'app-bim-document',
    templateUrl: './bim-document.component.html',
    styleUrls: ['./bim-document.component.scss']
})
/** bim-document component*/
export class BimDocumentComponent implements OnInit, AfterContentChecked, AfterViewInit, OnDestroy  {
  private navigationSubscription: Subscription;
  private ngUnsubscribe = new Subject<void>();

  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;

  @ViewChild('container3d') containerElement: ElementRef;

  /** bim-document ctor */
  constructor(private activatedRoute: ActivatedRoute, private bimModelService: BimModelService) {
    
  }

  ngOnInit(): void {
    this.navigationSubscription = this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (!id)
        return;

      this.bimModelService.getModelPartsAsync(id, this.ngUnsubscribe).then(async modelParts => {
        for (var modelPart of modelParts) {
          const tessellations = await this.bimModelService.getModelPartTessellationsAsync(modelPart, this.ngUnsubscribe);
          const nodes = await this.bimModelService.getModelPartIfcNodesAsync(modelPart, this.ngUnsubscribe);
          this.generateGeometry(tessellations, nodes);
        }
      }); 
    });
  }

  ngAfterViewInit(): void {
    this.createScene();
    this.createRenderer();
    this.createCamera();
    this.createOrbitControls();
    this.createLight();
    this.animate();
  }

  ngAfterContentChecked(): void {
    this.updateRendererSize();
  }

  ngOnDestroy(): void {
    this.renderer.dispose();
    this.renderer = null;

    this.scene.dispose();

    if (this.navigationSubscription)
      this.navigationSubscription.unsubscribe();

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  protected createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcccccc);
    this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    const axesHelper = new THREE.AxesHelper(50);
    this.scene.add(axesHelper);
  }

  protected createCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 2000);
    this.camera.position.set(200, 200, 200);
    this.camera.up.set(0, 0, 1);
  }

  private createOrbitControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    //this.controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
    this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 100;
    this.controls.maxDistance = 2000;
    //this.controls.maxPolarAngle = Math.PI / 2;
    //this.controls.enableRotate = true;
  }

  protected createLight() {
    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    this.scene.add( light );

    const light1 = new THREE.DirectionalLight(0x002288);
    light1.position.set(- 1, - 1, - 1);
    this.scene.add( light1 );

    const light2 = new THREE.AmbientLight(0x222222);
    this.scene.add(light2);
  }

  private createRenderer() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.updateRendererSize();
    this.containerElement.nativeElement.appendChild(this.renderer.domElement);
  }

  private updateRendererSize() {
    if (this.renderer) {
      const width = this.containerElement.nativeElement.clientWidth - 0;
      const height = this.containerElement.nativeElement.clientHeight - 64;
      this.renderer.setSize(width, height);
    }
  }

  private animate() {
    if (this.renderer) {
      window.requestAnimationFrame(() => this.animate());
      this.renderer.render(this.scene, this.camera);
    }
  }

  private generateGeometry(tessellations: ITessellation[], ifcNodes: IIfcNode[]): void {

    const geometries = this.getGeometry(tessellations);
    for (let ifcNode of ifcNodes) {
      if (!ifcNode.meshesProperties)
        continue;
      Object.keys(ifcNode.meshesProperties).forEach(key => {
        const meshProperties = ifcNode.meshesProperties[key];
        const geometry = geometries.get(key);
        if (!geometry)
          return;

        for (let meshProperty of meshProperties) {
          const a = (meshProperty.meshColor & 0x000000FF);
          const b = (meshProperty.meshColor & 0x0000FF00) >> 8;
          const g = (meshProperty.meshColor & 0x00FF0000) >> 16;
          const r = (meshProperty.meshColor & 0xFF000000) >> 24;
          const color = this.rgbaToHexA(r, g, b, a);
          const material = new THREE.MeshPhongMaterial({ color: color, flatShading: true });
          const mesh = new THREE.Mesh(geometry, material);
          const placement = new Array(meshProperty.meshPlacement.length);
          for (let i = 0; i < meshProperty.meshPlacement.length; i++) {
            const pl = meshProperty.meshPlacement[i];
            let value = pl;
            if (pl > 1 || pl < -1)
              value = pl / 1000;

            const index = Math.trunc(4 * (i % 4) + i / 4);
            placement[index] = value;
          }
          
          const positionMatrix = new THREE.Matrix4();
          positionMatrix.elements = placement;
          mesh.applyMatrix4(positionMatrix);
          this.scene.add(mesh);
        }
      });
    }

    
  }

  getGeometry(tessellations: ITessellation[]): Map<string, THREE.Geometry> {
    let geometries = new Map<string, THREE.Geometry>();
    const scale = 1000;
    for (const tessellation of tessellations) {
      const geometry = new THREE.Geometry();
      for (let i = 0; i < tessellation.modelMesh.vertices.length; i += 3) {
        const p1 = tessellation.modelMesh.vertices[i] / scale;
        const p2 = tessellation.modelMesh.vertices[i + 1] / scale;
        const p3 = tessellation.modelMesh.vertices[i + 2] / scale;
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
}
