import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppSearchOverlayService {
  /**
   * Событие выбора элемента в overlay
   * @type {Subject<any>}
   */
  selectOption: Subject<any>;

  constructor() {
    this.selectOption = new Subject<any>();
  }
}
