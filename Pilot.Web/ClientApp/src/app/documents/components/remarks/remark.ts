
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