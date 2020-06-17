import { Injectable, ElementRef } from '@angular/core';

import { ThreeScene } from "./three.scene"
import { IScene } from "../model/iscene.interface"


@Injectable({ providedIn: 'root'})
export class SceneFactoryService {

  createScene(containerElement: ElementRef): IScene {
    const scene = new ThreeScene(containerElement);
    return scene;
  }
}
