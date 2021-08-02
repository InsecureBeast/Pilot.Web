
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
    return clone;
  }
}

export class RemarkType {
  public static RED_PENCIL = 'anb:RedPencil';
  public static TEXT_NOTE = 'anb:TextNote';
  public static STICKY_NOTE = 'anb:TextStickyNote';
}

export class Point {
  
  /**
   *
   */
  constructor(left: number, top: number) {
    this.top = top;
    this.left = left;    
  }
  
  top: number;
  left: number;

}