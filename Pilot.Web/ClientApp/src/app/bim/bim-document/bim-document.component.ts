import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterContentChecked, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Component({
    selector: 'app-bim-document',
    templateUrl: './bim-document.component.html',
    styleUrls: ['./bim-document.component.scss']
})
/** bim-document component*/
export class BimDocumentComponent implements OnInit, AfterContentChecked, AfterViewInit, OnDestroy  {
    
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;

  @ViewChild('container3d') containerElement: ElementRef;

  /** bim-document ctor */
  constructor() {
    
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.createScene();
    this.createRenderer();
    this.createCamera();
    this.createOrbitControls();
    this.generateGeometry();
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

  private generateGeometry(): void {
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
    var geometry1 = this.getGeometry();
    var mesh1 = new THREE.Mesh(geometry1, material1);
    this.scene.add(mesh1);
  }

  getGeometry() {
    var geometry = new THREE.Geometry();

    geometry.vertices.push(
      new THREE.Vector3(6.3, 16.5, 6.3),
      new THREE.Vector3(6.3, 15.3, 6.3),
      new THREE.Vector3(6.3, 15.3, 176.7),

      new THREE.Vector3(6.3, 16.5, 176.7),
      new THREE.Vector3(6.3, 15.3, 6.3),
      new THREE.Vector3(85.2, 15.3, 6.3),

      new THREE.Vector3(85.2, 15.3, 176.7),
      new THREE.Vector3(6.3, 15.3, 176.7),
      new THREE.Vector3(85.2, 15.3, 6.3),

      new THREE.Vector3(85.2, 16.5, 6.3),
      new THREE.Vector3(85.2, 16.5, 176.7),
      new THREE.Vector3(85.2, 15.3, 176.7),

      new THREE.Vector3(85.2, 16.5, 6.3),
      new THREE.Vector3(6.3, 16.5, 6.3),
      new THREE.Vector3(6.3, 16.5, 176.7),

      new THREE.Vector3(85.2, 16.5, 176.7),
      new THREE.Vector3(6.3, 16.5, 176.7),
      new THREE.Vector3(6.3, 15.3, 176.7),

      new THREE.Vector3(85.2, 15.3, 176.7),
      new THREE.Vector3(85.2, 16.5, 176.7),
      new THREE.Vector3(6.3, 16.5, 6.3),

      new THREE.Vector3(6.3, 15.3, 6.3),
      new THREE.Vector3(85.2, 15.3, 6.3),
      new THREE.Vector3(85.2, 16.5, 6.3),
    );

    geometry.faces.push(new THREE.Face3(0, 1, 2));
    geometry.faces.push(new THREE.Face3(0, 2, 3));
    geometry.faces.push(new THREE.Face3(4, 5, 6));
    geometry.faces.push(new THREE.Face3(4, 6, 7));
    geometry.faces.push(new THREE.Face3(8, 9, 10));
    geometry.faces.push(new THREE.Face3(8, 10, 11));
    geometry.faces.push(new THREE.Face3(12, 13, 14));
    geometry.faces.push(new THREE.Face3(12, 14, 15));
    geometry.faces.push(new THREE.Face3(16, 17, 18));
    geometry.faces.push(new THREE.Face3(16, 18, 19));
    geometry.faces.push(new THREE.Face3(22, 21, 20));
    geometry.faces.push(new THREE.Face3(23, 22, 20));
    //geometry.computeBoundingSphere();
    return geometry;
  }

}
