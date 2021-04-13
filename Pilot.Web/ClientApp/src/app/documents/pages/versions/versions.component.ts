import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { RepositoryService } from 'src/app/core/repository.service';
import { IObject, IFileSnapshot } from 'src/app/core/data/data.classes';
import { DocumentsNavigationService } from '../../shared/documents-navigation.service';

@Component({
  selector: 'app-versions',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.css', '../../shared/toolbar.css']
})
export class VersionsComponent implements OnInit, OnDestroy {
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

  loadDocument(id: string) {
    this.repository.getObjectAsync(id)
      .then(source => {
        if (!source) {
          return;
        }

        this.document = source;
      });
  }

  onVersionSelected(snapshot: IFileSnapshot): void {
    if (this.document.actualFileSnapshot.created === snapshot.created) {
      this.navigationService.navigateToDocumentVersion(this.document.parentId, this.document.id);
      return;
    }
    this.navigationService.navigateToDocumentVersion(this.document.parentId, this.document.id, snapshot.created);
  }

  back(): void {
    this.navigationService.back();
  }
}
