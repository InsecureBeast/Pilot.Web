import { Injectable } from '@angular/core';
import { Tools } from './tools/tools';

@Injectable({providedIn: 'root'})
export class ScrollPositionService {

  private readonly scrollPositions: Map<string, number>;

  constructor() {
    this.scrollPositions = new Map<string, number>();
  }

  restoreScrollPosition(id: string): void {
    Tools.sleep(100).then(() => {
      const pos = this.getPosition(id);
      window.scrollTo(0, pos);
      // console.log(pos);
    });
  }

  saveScrollPosition(id: string): void {
    const pos = window.pageYOffset;
    this.savePosition(id, pos);
  }

  saveTasksScrollPosition(): void {
    const pos = window.pageYOffset;
    this.savePosition('tasks_position', pos);
  }

  restoreTasksScrollPosition(): void {
    const pos = this.getPosition('tasks_position');
    window.scrollTo(0, pos);
  }

  private savePosition(key: string, pos: number): void {
    this.scrollPositions.set(key, pos);
  }

  private getPosition(key: string): number {
    if (this.scrollPositions.has(key)) {
      const value = this.scrollPositions.get(key);
      this.scrollPositions.delete(key);
      return value;
    }

    return 0;
  }
}
