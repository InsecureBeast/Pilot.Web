import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Guid } from 'guid-typescript';
import { Subject, Subscription } from 'rxjs';
import { IFile, IObject, IOrganizationUnit, IPerson, ISignature, IFileSnapshot } from 'src/app/core/data/data.classes';
import { RequestType } from 'src/app/core/headers.provider';
import { RepositoryService } from 'src/app/core/repository.service';
import { DateTools } from 'src/app/core/tools/date.tools';
import { FilesSelector } from 'src/app/core/tools/files.selector';
import { StringUtils } from 'src/app/core/tools/tools';
import { VersionsSelectorService } from '../document-versions/versions-selector.service';

class DigitalSignature {

  person: string;
  id: string;
  isValid = false;
  isCertificateValid = false;
  signDate: string;
  role: string;
  canUserSign = false;
  isSigned = false;
  isChecked = false;
  position: number;

  constructor(id: string) {
    this.id = id;
  }

  setPersonTitle (person: IPerson, position: IOrganizationUnit): void {
    const personNameFunc = (param1, param2) => `${param1} (${param2})`;
    let personName = '';
    let positionTitle = '';

    if (person) {
      personName = person.displayName;
    }

    if (position) {
      positionTitle = position.title;
    }

    this.person = personNameFunc(personName, positionTitle);
    this.position = position.id;
  }
}

@Component({
    selector: 'app-digital-signatures',
    templateUrl: './digital-signatures.component.html',
    styleUrls: ['./digital-signatures.component.css']
})
/** digital-signatures component*/
export class DigitalSignaturesComponent implements OnDestroy {
  private _document: IObject;
  private _isActual = true;
  private ngUnsubscribe = new Subject<void>();
  private versionSubscription: Subscription;

  @Input()
  get document(): IObject {
    return this._document;
  }
  set document(newValue: IObject) {
    this._document = newValue;
    if (newValue) {
      this.loadSignatures(newValue);
    }
  }

  @Output() error = new EventEmitter<HttpErrorResponse>();

  signatures: Array<DigitalSignature>;
  isSigninigInProcess: boolean;
  showSignButton: boolean;
  isSignaturesLoading: boolean;
  canUserSign: boolean;
  isSomeSignatureChecked: boolean;

  /** digital-signatures ctor */
  constructor(
    private readonly repository: RepositoryService,
    private readonly translate: TranslateService,
    private readonly versionSelector: VersionsSelectorService) {

    this.signatures = new Array<DigitalSignature>();
    this.isSigninigInProcess = false;
    this.showSignButton = false;

    this.versionSubscription = this.versionSelector.selectedSnapshot$.subscribe(async s => {
      if (!s) {
        return;
      }

      if (!this._document) {
        return;
      }

      try {
        this._isActual = this._document.actualFileSnapshot.created === s.created;
        const newDocument = await this.repository.getObjectAsync(this._document.id, RequestType.New);
        this._document = newDocument;
        this.signatures = new Array<DigitalSignature>();
        this.fillSignatures(s.files);
        this.updateSignaturesAsync(newDocument, s);
        this.canUserSign = this.canSign();
      } catch (error) {
        this.error.emit(error);
      }
    });
  }

  checkSignature(signature: DigitalSignature): void {
    if (!signature.canUserSign) {
      return;
    }

    signature.isChecked = !signature.isChecked;
    this.isSomeSignatureChecked = this.signatures.some(s => s.isChecked);
  }

  ngOnDestroy(): void {
    this.cancelAllRequests(true);
    if (this.versionSubscription) {
      this.versionSubscription.unsubscribe();
    }
  }

  async sign(): Promise<void> {
    this.isSigninigInProcess = true;
    try {
      const positionIds = this.signatures.filter(s => s.isChecked).map(s => s.position);
      const res = await this.repository.signDocumentAsync(this._document.id, positionIds, this.ngUnsubscribe);
      if (res) {
        const newDocument = await this.repository.getObjectAsync(this._document.id, RequestType.New);
        this._document = newDocument;
        this.updateSignaturesAsync(this._document, this._document.actualFileSnapshot);
        this.isSigninigInProcess = false;
      }
    } catch (error) {
      this.isSigninigInProcess = false;
      this.error.emit(error);
    }
  }

  private loadSignatures(document: IObject) {
    const snapshot = document.actualFileSnapshot;
    this.fillSignatures(snapshot.files);
    this.updateSignaturesAsync(document, snapshot);
  }

  private fillSignatures(files: IFile[]): void {
    const xpsFile = FilesSelector.getXpsFile(files);
    if (!xpsFile) {
      return;
    }

    for (const signature of xpsFile.signatures) {
      const person = this.repository.getPersonOnOrganizationUnit(signature.positionId);
      const position = this.repository.getOrganizationUnit(signature.positionId);
      const digitalSignature = new DigitalSignature(signature.id);
      digitalSignature.setPersonTitle(person, position);
      digitalSignature.canUserSign = this.canSignWithSpotId(signature.id);
      digitalSignature.isSigned = !StringUtils.isNullOrEmpty(signature.sign);
      digitalSignature.isChecked = digitalSignature.canUserSign;

      this.signatures.push(digitalSignature);
    }
  }

  private updateSignaturesAsync(document: IObject, snapshot: IFileSnapshot): void {
    if (this.signatures.length === 0) {
      this.isSignaturesLoading = true;
    }

    this.repository.getDocumentSignaturesWithSnapshotAsync(document.id, snapshot.created, this.ngUnsubscribe)
    .then(signatures => {
      this.isSignaturesLoading = false;
      for (const sig of signatures) {
        if (sig.isAdditional && !sig.isSigned) {
          continue;
        }

        let sc = this.signatures.find(s => s.id === sig.id);
        if (!sc) {
          sc = new DigitalSignature(sig.id);
          this.signatures.push(sc);
        }

        sc.person = sig.signer;
        sc.isValid = sig.isValid;
        sc.signDate = DateTools.dateToString(sig.signDate, this.translate.currentLang);
        sc.role = sig.role;
        sc.isCertificateValid = sig.isCertificateValid;
        sc.canUserSign = this.canSignWithSpotId(sig.id);
        sc.isSigned = sig.isSigned;
        sc.isChecked = sc.canUserSign && !sig.isSigned;

        if (sc.isChecked) {
          this.isSomeSignatureChecked = true;
        }
      }

      this.showSignButton = true;
      this.canUserSign = this.canSign();
    })
    .catch(e => {
      this.showSignButton = false;
      this.isSignaturesLoading = false;
      this.canUserSign = false;
      if (e.status === 500) {
        if (e.error.error === 'Command IXpsServiceApi_Pilot-XPS-Server handler is not registered') {
          return;
        }
        if (e.error.error === 'Command IXpsServiceApi_Pilot-XPS-Server handler is not responding') {
          return;
        }
      }

      this.error.emit(e);
    });
  }

  private cancelAllRequests(isCompleted: boolean): void {
    if (this.ngUnsubscribe) {
      // This aborts all HTTP requests.
      this.ngUnsubscribe.next();
      // This completes the subject properly.
      if (isCompleted) {
        this.ngUnsubscribe.complete();
      }
    }
  }

  private canSign(): boolean {
    const some = this.signatures.some(signature => signature.canUserSign && !signature.isSigned);
    return this._isActual && some;
  }

  private canSignWithSpotId(spotId: string): boolean {
    if (!spotId) {
      return false;
    }

    const signature = this.getSignature(spotId);
    if (!signature || signature.databaseId !== this.repository.getDatabaseId()) {
      return false;
    }

    if (signature.objectId !== Guid.EMPTY /*&& !IsRelatedTaskStarted(signature.ObjectId)*/) {
      return false;
    }

    const currentPerson = this.repository.getCurrentPerson();
    const include = currentPerson.positions.includes(signature.positionId);
    return include;
  }

  private getSignature(spotId: string): ISignature {
    const files = this._document.actualFileSnapshot.files;
    const ss = files.flatMap(f => f.signatures).find(x => x.id === spotId);
    return ss;
  }
}
