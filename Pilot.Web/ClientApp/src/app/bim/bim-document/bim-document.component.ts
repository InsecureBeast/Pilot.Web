import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterContentChecked, AfterViewInit } from '@angular/core';
import { ActivatedRoute, ParamMap, NavigationStart, Router } from '@angular/router';

import { Subscription, Subject } from 'rxjs';

import { BimModelService } from '../shared/bim-model.service';
import { SceneFactoryService } from '../shared/scene-factory.service';
import { IScene } from '../shared/scene';

@Component({
    selector: 'app-bim-document',
    templateUrl: './bim-document.component.html',
    styleUrls: ['./bim-document.component.scss']
})
/** bim-document component*/
export class BimDocumentComponent implements OnInit, AfterContentChecked, AfterViewInit, OnDestroy  {
  private navigationSubscription: Subscription;
  private ngUnsubscribe = new Subject<void>();
  private scene: IScene;

  @ViewChild('container3d') containerElement: ElementRef;

  /** bim-document ctor */
  constructor(private activatedRoute: ActivatedRoute, private bimModelService: BimModelService, private sceneFactory: SceneFactoryService) {
    
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    this.scene = this.sceneFactory.createScene(this.containerElement);
    this.navigationSubscription = this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (!id)
        return;

      this.bimModelService.getModelPartsAsync(id, this.ngUnsubscribe).then(async modelParts => {
        for (let modelPart of modelParts) {
          const tessellations = await this.bimModelService.getModelPartTessellationsAsync(modelPart, this.ngUnsubscribe);
          const nodes = await this.bimModelService.getModelPartIfcNodesAsync(modelPart, this.ngUnsubscribe);
          this.scene.updateObjects(tessellations, nodes);
        }
      });
    });
  }

  ngAfterContentChecked(): void {
    if (this.scene)
      this.scene.updateRendererSize();
  }

  ngOnDestroy(): void {
    if (this.scene)
      this.scene.dispose();

    if (this.navigationSubscription)
      this.navigationSubscription.unsubscribe();

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
