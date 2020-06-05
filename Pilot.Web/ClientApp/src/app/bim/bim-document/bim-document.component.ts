import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterContentChecked, AfterViewInit } from '@angular/core';
import { ActivatedRoute, ParamMap, NavigationStart, Router } from '@angular/router';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Subscription, Subject } from 'rxjs';

import { BimModelService } from '../shared/bim-model.service';
import { ITessellation } from '../shared/bim-data.classes';

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

      this.bimModelService.getPartTessellationsAsync(id, this.ngUnsubscribe).then(tessellations => {
        this.generateGeometry(tessellations);

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
  }

  protected createCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 1, 1000);
    this.camera.position.set(400, 200, 0);
  }

  private createOrbitControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    //this.controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
    this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 100;
    this.controls.maxDistance = 500;
    this.controls.maxPolarAngle = Math.PI / 2;
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

  private generateGeometry(tessellations: ITessellation[]): void {

    var geometry = new THREE.CylinderBufferGeometry(0, 10, 30, 4, 1);
    var material = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true });

    for (var i = 0; i < 500; i++) {

      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = Math.random() * 1600 - 800;
      mesh.position.y = 0;
      mesh.position.z = Math.random() * 1600 - 800;
      mesh.updateMatrix();
      mesh.matrixAutoUpdate = false;
      this.scene.add( mesh );
    }

    var material1 = new THREE.MeshPhongMaterial({ color: 0x00ffff, flatShading: true });
    var geometry1 = this.getGeometry(tessellations);
    var mesh1 = new THREE.Mesh(geometry1, material1);
    this.scene.add(mesh1);
  }

  getGeometry(tessellations: ITessellation[]) {
    const geometry = new THREE.Geometry();
    const scale = 100;
    for (const tessellation of tessellations) {
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
    }

    return geometry;
  }

}
