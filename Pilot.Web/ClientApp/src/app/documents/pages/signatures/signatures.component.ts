import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { RepositoryService } from 'src/app/core/repository.service';
import { Subscription } from 'rxjs';
import { IObject } from 'src/app/core/data/data.classes';
import { DocumentsNavigationService } from '../../shared/documents-navigation.service';

@Component({
  selector: 'app-signatures',
  templateUrl: './signatures.component.html',
  styleUrls: ['./signatures.component.css', '../../shared/toolbar.css']
})
export class SignaturesComponent implements OnInit, OnDestroy {

  private navigationSubscription: Subscription;

  document: IObject;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly repository: RepositoryService,
    private readonly navigationService: DocumentsNavigationService) {
  }

  ngOnInit(): void {
    this.navigationSubscription = this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (!id) {
        return;
      }

      this.loadDocument(id);
    });
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  back(): void {
    this.navigationService.back();
  }

  private loadDocument(id: string) {
    this.repository.getObjectAsync(id)
      .then(source => {
        if (!source) {
          return;
        }

        this.document = source;
      });
  }
}
