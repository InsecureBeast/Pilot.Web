import { IOrganizationUnit, IPerson } from 'src/app/core/data/data.classes';

export class DigitalSignature {

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

  setPersonTitle(person: IPerson, position: IOrganizationUnit): void {
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
