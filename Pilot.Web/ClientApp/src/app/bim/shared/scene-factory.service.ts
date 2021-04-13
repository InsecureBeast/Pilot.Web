import { Injectable, ElementRef } from '@angular/core';

import { ThreeScene } from './three.scene';
import { IScene } from '../model/iscene.interface';
import { ThreeRender } from '../model/render/three.render';


@Injectable({ providedIn: 'root'})
export class SceneFactoryService {

  createScene(containerElement: ElementRef): IScene {
    const render = new ThreeRender();
    const scene = new ThreeScene(containerElement, render);
    return scene;
  }
}
