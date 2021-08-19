
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
  public static RED_PENCIL_OLD = 'anb:RedPencil';
  public static RED_PENCIL = 'RedPencil';
  public static TEXT_NOTE_OLD = 'anb:TextNote';
  public static TEXT_NOTE = 'TextNote';
  public static STICKY_NOTE_OLD = 'anb:TextStickyNote';
  public static STICKY_NOTE = 'TextStickyNote';

  public static isRedPensil(kind: string): boolean {
    return kind == this.RED_PENCIL || kind === this.RED_PENCIL_OLD;
  }

  public static isTextNote(kind: string): boolean {
    return kind == this.TEXT_NOTE || kind === this.RED_PENCIL_OLD;
  }

  public static isStikyTextNote(kind: string): boolean {
    return kind == this.STICKY_NOTE || kind === this.STICKY_NOTE_OLD;
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