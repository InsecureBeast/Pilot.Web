import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Guid } from 'guid-typescript';
import { Subject, Subscription } from 'rxjs';
import { IFile, IObject, ISignature, IFileSnapshot } from 'src/app/core/data/data.classes';
import { RequestType } from 'src/app/core/headers.provider';
import { RepositoryService } from 'src/app/core/repository.service';
import { DateTools } from 'src/app/core/tools/date.tools';
import { FilesSelector } from 'src/app/core/tools/files.selector';
import { StringUtils } from 'src/app/core/tools/tools';
import { VersionsSelectorService } from '../document-versions/versions-selector.service';
import { SystemTaskAttributes, SystemAttributes } from 'src/app/core/data/system.types';
import { SystemStates } from 'src/app/core/data/system.states';
import { DigitalSignature } from './digital.signature';

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
  isSigningInProcess: boolean;
  showSignButton: boolean;
  isSignaturesLoading: boolean;

  /** digital-signatures ctor */
  constructor(
    private readonly repository: RepositoryService,
    private readonly translate: TranslateService,
    private readonly versionSelector: VersionsSelectorService) {

    this.signatures = new Array<DigitalSignature>();
    this.isSigningInProcess = false;
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
        await this.updateSignaturesAsync(newDocument, s);
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
  }

  ngOnDestroy(): void {
    this.cancelAllRequests(true);
    if (this.versionSubscription) {
      this.versionSubscription.unsubscribe();
    }
  }

  async sign(): Promise<void> {
    this.isSigningInProcess = true;
    try {
      const positionIds = this.signatures.filter(s => s.isChecked).map(s => s.position);
      const res = await this.repository.signDocumentAsync(this._document.id, positionIds, this.ngUnsubscribe);
      if (res) {
        const newDocument = await this.repository.getObjectAsync(this._document.id, RequestType.New);
        this._document = newDocument;
        await this.updateSignaturesAsync(this._document, this._document.actualFileSnapshot);
        this.showSignButton = true;
        this.isSigningInProcess = false;
      }
    } catch (error) {
      this.isSigningInProcess = false;
      this.error.emit(error);
    }
  }

  canUserSign(): boolean {
    const canUserSign = this.canSign();
    const isSomeSignatureChecked = this.signatures.some(sig => sig.isChecked);
    return !this.isSigningInProcess && canUserSign && isSomeSignatureChecked;
  }

  private async loadSignatures(document: IObject): Promise<void> {
    const snapshot = document.actualFileSnapshot;
    this.fillSignatures(snapshot.files);
    this.updateSignaturesAsync(document, snapshot);
  }

  private async fillSignatures(files: IFile[]): Promise<void> {
    const xpsFile = FilesSelector.getXpsFile(files);
    if (!xpsFile) {
      return;
    }

    for (const signature of xpsFile.signatures) {
      if (this.signatures.find(s => s.id === signature.id)) {
        continue;
      }
      const person = this.repository.getPersonOnOrganizationUnit(signature.positionId);
      const position = this.repository.getOrganizationUnit(signature.positionId);
      const digitalSignature = new DigitalSignature(signature.id);
      digitalSignature.setPersonTitle(person, position);
      digitalSignature.canUserSign = await this.canSignWithSpotId(signature.id);
      digitalSignature.isSigned = !StringUtils.isNullOrEmpty(signature.sign);
      digitalSignature.isChecked = digitalSignature.canUserSign;

      this.signatures.push(digitalSignature);
    }
  }

  private async updateSignaturesAsync(document: IObject, snapshot: IFileSnapshot): Promise<void> {
    if (this.signatures.length === 0) {
      this.isSignaturesLoading = true;
    }

    const isConnected = await this.repository.isXpsServiceConnected(this.ngUnsubscribe);
    if (!isConnected) {
      this.showSignButton = false;
      this.isSignaturesLoading = false;
      return;
    }

    const signatures = await this.repository.getDocumentSignaturesWithSnapshotAsync(document.id, snapshot.created, this.ngUnsubscribe);
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
      sc.canUserSign = await this.canSignWithSpotId(sig.id);
      sc.isSigned = sig.isSigned;
      sc.isChecked = sc.canUserSign && !sig.isSigned;
    }

    this.showSignButton = true;
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

  private async canSignWithSpotId(spotId: string): Promise<boolean> {
    if (!spotId) {
      return false;
    }

    const signature = this.getSignature(spotId);
    if (!signature || signature.databaseId !== this.repository.getDatabaseId()) {
      return false;
    }

    const isTaskStarted = await this.isRelatedTaskStartedAsync(signature.objectId);
    if (signature.objectId !== Guid.EMPTY && !isTaskStarted) {
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

  private async isRelatedTaskStartedAsync(taskId: string): Promise<boolean> {
    const taskObject = await this.repository.getObjectAsync(taskId);
    if (taskObject == null) {
      return false;
    }
    const stateValue = taskObject.attributes[SystemTaskAttributes.STATE];

    if (stateValue) {
      if (stateValue === SystemStates.TASK_REVOKED_STATE_ID) {
        return false;
      }

      if (stateValue !== SystemStates.NONE_STATE_ID || this.allowSigningNotStarted(taskObject)) {
        return true;
      }
    }

    return false;
  }

  private allowSigningNotStarted(taskObject: IObject): boolean {
    const attr = taskObject.type.attributes.find(x => x.name === SystemAttributes.ALLOW_SIGNING_AT_NONE_STATE_NAME);
    return attr && attr.configuration === '<True/>';
  }
}
