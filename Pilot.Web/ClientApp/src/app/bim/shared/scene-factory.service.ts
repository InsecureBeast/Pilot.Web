import { Injectable, ElementRef } from '@angular/core';

import { Scene, IScene } from './scene'


@Injectable({ providedIn: 'root'})
export class SceneFactoryService {

  createScene(containerElement: ElementRef): IScene {
    const scene = new Scene(containerElement);
    return scene;
  }
}
