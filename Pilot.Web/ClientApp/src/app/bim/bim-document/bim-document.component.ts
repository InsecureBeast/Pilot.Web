import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterContentChecked, AfterViewInit } from '@angular/core';
import { ActivatedRoute, ParamMap, NavigationStart, Router } from '@angular/router';
import { Location } from '@angular/common';

import { Subscription, Subject } from 'rxjs';

import { BimModelService } from '../shared/bim-model.service';
import { SceneFactoryService } from '../shared/scene-factory.service';
import { IScene } from "../model/iscene.interface";

@Component({
    selector: 'app-bim-document',
    templateUrl: './bim-document.component.html',
  styleUrls: ['./bim-document.component.scss', '../../ui/toolbar.css']
})
/** bim-document component*/
export class BimDocumentComponent implements OnInit, AfterContentChecked, AfterViewInit, OnDestroy  {
  private navigationSubscription: Subscription;
  private ngUnsubscribe = new Subject<void>();
  private scene: IScene;

  @ViewChild('container3d') containerElement: ElementRef;
  isLoading: boolean;
  progress: number;

  /** bim-document ctor */
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly location: Location,
    private readonly bimModelService: BimModelService,
    private readonly sceneFactory: SceneFactoryService) {
    
  }

  ngOnInit(): void {
    this.isLoading = false;
  }

  ngAfterViewInit(): void {
    this.scene = this.sceneFactory.createScene(this.containerElement);
    this.navigationSubscription = this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (!id)
        return;

      this.isLoading = true;
      this.progress = 0;
      this.bimModelService.getModelPartsAsync(id, this.ngUnsubscribe).then(async modelParts => {
        this.scene.stopAnimate();
        let part = 100 / modelParts.length / 4;
        for (let modelPart of modelParts) {
          this.progress = this.progress + part;
          const tessellations = await this.bimModelService.getModelPartTessellationsAsync(modelPart, this.ngUnsubscribe);
          this.progress = this.progress + part;
          const nodes = await this.bimModelService.getModelPartIfcNodesAsync(modelPart, this.ngUnsubscribe);
          this.progress = this.progress + part;
          this.scene.updateObjects(tessellations, nodes);
          this.progress = this.progress + part;
        }

        this.isLoading = false;
        this.progress = 100;
        this.scene.startAnimate();
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

  close($event): void {
    this.location.back();
  }
}
