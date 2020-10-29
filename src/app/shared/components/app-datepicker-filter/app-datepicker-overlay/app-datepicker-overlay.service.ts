import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppDatepickerOverlayService {
  /**
   * Событие выбора элемента в overlay
   * @type {Subject<any>}
   */
  periodSelect: Subject<{from: string, to: string}>;

  constructor() {
    this.periodSelect = new Subject<any>();
  }
}
