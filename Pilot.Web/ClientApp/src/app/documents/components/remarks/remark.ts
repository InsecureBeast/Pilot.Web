
export class Remark {
  person: string;
  id: string;
  text: string = '';
  created: string;
  type: string;
  data: string;
  position: Point;
  pageNumber: number;

  constructor() {
    this.position = new Point();    
  }
}

export class RemarkType {
  public static RED_PENCIL = 'anb:RedPencil';
  public static TEXT_NOTE = 'anb:TextNote';
  public static STICKY_NOTE = 'anb:TextStickyNote';
}

export class Point {
  top: number;
  left: number;
}