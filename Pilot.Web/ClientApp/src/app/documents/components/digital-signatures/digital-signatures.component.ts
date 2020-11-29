import { Component, Input, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { IObject, IOrganizationUnit, IPerson, ISignature } from 'src/app/core/data/data.classes';
import { RepositoryService } from 'src/app/core/repository.service';
import { DateTools } from 'src/app/core/tools/date.tools';
import { FilesSelector } from 'src/app/core/tools/files.selector';
import { ErrorHandlerService } from 'src/app/ui/error/error-handler.service';

class DigitalSignature {

  person: string;
  id: string;
  isValid = false;
  isCertificateValid = false;
  signDate: string;
  role: string;

  constructor(id: string) {
    this.id = id;
  }

  setPersonTitle (person: IPerson, position: IOrganizationUnit): void {
    const personName = (param1, param2) => `${param1} (${param2})`;
    this.person = personName(person.displayName, position.title);
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
  private ngUnsubscribe = new Subject<void>();

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

  signatures: Array<DigitalSignature>;
  isSigninigInProcess: boolean;
  showSignButton: boolean;
  isSignaturesLoading: boolean;

  /** digital-signatures ctor */
  constructor(
    private readonly repository: RepositoryService,
    private readonly translate: TranslateService,
    private readonly errorService: ErrorHandlerService) {

    this.signatures = new Array<DigitalSignature>();
    this.isSigninigInProcess = false;
    this.showSignButton = false;
  }

  ngOnDestroy(): void {
    this.cancelAllRequests(true);
  }

  sign(): void {
    this.isSigninigInProcess = true;
    this.repository.signDocumentAsync(this._document.id, this.ngUnsubscribe)
    .then(r => {
      if (r) {
        this.updateSignatures(this._document);
      }

      this.isSigninigInProcess = false;
    })
    .catch(e => {
      this.isSigninigInProcess = false;
    });
  }

  private loadSignatures(document: IObject) {

    const xpsFile = FilesSelector.getXpsFile(document.actualFileSnapshot.files);
    if (!xpsFile) {
      return;
    }

    for (const signature of xpsFile.signatures) {
      const person = this.repository.getPersonOnOrganizationUnit(signature.positionId);
      const position = this.repository.getOrganizationUnit(signature.positionId);
      const digitalSignature = new DigitalSignature(signature.id);
      digitalSignature.setPersonTitle(person, position);
      this.signatures.push(digitalSignature);
    }

    this.updateSignatures(document);
  }

  private updateSignatures(document: IObject): void {
    if (this.signatures.length === 0) {
      this.isSignaturesLoading = true;
    }

    this.repository.getDocumentSignaturesAsync(document.id, this.ngUnsubscribe)
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
      }

      this.showSignButton = true;
    })
    .catch(e => {
      this.errorService.handleErrorMessage(e);
      this.showSignButton = false;
      this.isSignaturesLoading = false;
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
}
