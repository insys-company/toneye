import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppMinmaxOverlayService {
  /**
   * Событие выбора элемента в overlay
   * @type {Subject<any>}
   */
  periodSelect: Subject<{ min: string, max: string }>;

  constructor() {
    this.periodSelect = new Subject<any>();
  }
}
