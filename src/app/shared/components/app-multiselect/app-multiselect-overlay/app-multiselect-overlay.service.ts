import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ItemList, SimpleDataFilter } from 'src/app/api/contracts';
// import { ApiService, ApiEndpoints } from 'src/app/api';

@Injectable({
    providedIn: 'root'
})
export class AppMultiselectOverlayService {
    /**
     * Событие выбора элемента в overlay
     * @type {Subject<any>}
     */
    selectOption: Subject<any>;
    /**
     * Событие выбора элемента в overlay
     * @type {Subject<any[]>}
     */
    selectedOptions: Subject<any[]>;

    constructor(
        // private apiService: ApiService
    ) {
        this.selectOption = new Subject<any>();
        this.selectedOptions = new Subject<any[]>();
    }

  // /**
  //  * Запрос на получение коллекции
  //  * @param {ApiEndpoint} endpoint Адрес
  //  * @param {SimpleDataFilter} params Параметры
  //  *
  //  * @returns {Observable<ItemList<any>>} объект `Observable` на лист
  //  */
  // updateOptions(endpoint: string, params: SimpleDataFilter): Observable<ItemList<any>> {
  //   const url = ApiEndpoints[endpoint]().listUrl(params);
  //   return this.apiService.get<ItemList<any>>(url);
  // }
}
