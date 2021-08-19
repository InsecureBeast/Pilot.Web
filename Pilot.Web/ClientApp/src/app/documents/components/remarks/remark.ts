
export class Remark {
  person: string;
  id: string;
  text: string = '';
  created: string;
  type: string;
  data: string;
  position: Point;
  pageNumber: number = -1;
  pointer: string;
  isOpen: boolean;
  data2: any;

  constructor() {
    this.position = new Point(0, 0);    
  }

  clone(): Remark {
    const clone = new Remark();
    clone.person = this.person;
    clone.id = this.id;
    clone.text = this.id;
    clone.created = this.created;
    clone.type = this.type;
    clone.data = this.data;
    clone.position = this.position;
    clone.pageNumber = this.pageNumber;
    clone.pointer = this.pointer;
    clone.isOpen = this.isOpen;
    return clone;
  }
}

export class RemarkType {
  static RED_PENCIL_OLD = 'anb:RedPencil';
  static RED_PENCIL = 'RedPencil';
  static TEXT_NOTE_OLD = 'anb:TextNote';
  static TEXT_NOTE = 'TextNote';
  static STICKY_NOTE_OLD = 'anb:TextStickyNote';
  static STICKY_NOTE = 'TextStickyNote';

  static isRedPensil(kind: string): boolean {
    return kind === this.RED_PENCIL || kind === this.RED_PENCIL_OLD;
  }

  static isTextNote(kind: string): boolean {
    return kind === this.TEXT_NOTE || kind === this.RED_PENCIL_OLD;
  }

  static isStikyTextNote(kind: string): boolean {
    return kind === this.STICKY_NOTE || kind === this.STICKY_NOTE_OLD;
  }

  static isOldRemark(kind: string): boolean {
    return kind === this.RED_PENCIL_OLD || kind === this.STICKY_NOTE_OLD || kind === this.TEXT_NOTE_OLD;
  }
}

export class Point {
  
  constructor(left: number, top: number) {
    this.top = top;
    this.left = left;    
  }
  
  top: number;
  left: number;

}