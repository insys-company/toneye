import { Injectable } from '@angular/core';
import { ListItem } from 'src/app/api';

@Injectable({
  providedIn: 'root'
})
export class AppFilterService {

  getChains(): ListItem[] {
    return [
      { id: '-1', name: 'Materchain' },
      { id: '0', name: 'Workchain' }
    ];
  }

  getExtInt(): ListItem[] {
    return [
      { id: 'ext', name: 'Ext' },
      { id: 'int', name: 'Int' }
    ];
  }

}