import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppSearchOverlayService {
  /**
   * Событие выбора элемента в overlay
   */
  selectOption: Subject<{type: string, option: any}>;

  constructor() {
    this.selectOption = new Subject<{type: string, option: any}>();
  }
}
