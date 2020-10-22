import { Injectable, Inject } from '@angular/core';
import { SimpleDataFilter, ItemList } from 'src/app/api';
import { Apollo } from 'apollo-angular';
import { IModel } from '../../interfaces/IModel';
import { Observable, Subject } from 'rxjs';
// import { DocumentNode, DocumentNode } from 'graphql';
import { map, takeUntil } from 'rxjs/operators';
import { GraphQueryService } from '../../services';

@Injectable({
  providedIn: 'root'
})
export class DetailsService<TModel extends IModel> {
  /**
   * For subscribers
   */
  protected _unsubscribe: Subject<void> = new Subject();

  constructor(
    protected apollo: Apollo,
    protected graphQueryService: GraphQueryService,
    @Inject(function () { }) public factoryFunc: (model?: TModel) => TModel,
    @Inject(String) public parentPageName?: string,
  ) {
    // TODO
  }

  /**
   * Initialization of the service
   */
  subscribeInit(): void {
    this._unsubscribe = new Subject<void>();
    // TODO
  }

  /**
   * Destruction of the service
   */
  destroy(): void {
    this.unsubscribe();
    this._unsubscribe = null;
  }

  /**
   * unsubscribe from qeries of the service
   */
  unsubscribe(): void {
    if (this._unsubscribe) {
      this._unsubscribe.next();
      this._unsubscribe.complete();
    }
  }

  /**
   * Получение данных
   */
  refreshData(): void {
    // TODO
  }

  /**
   * Get data
   * @param _id Id of model
   * @param _variables Variables for query
   */
  getModel(_id: string | number, _variables?: object): Observable<TModel[]> {

    const variables = _variables ? _variables : { filter: {id: {eq: _id} } };

    return this.apollo.watchQuery<ItemList<TModel>>({
      query: this.graphQueryService.getItem,
      variables: variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[this.parentPageName]));
  }

  /**
   * Получение параметров фильтра из queryParams
   * @param queryParams Параметры из url
   * @param filter Параметры для фильтра
   */
  getFilterParams(queryParams: Object, filter: SimpleDataFilter): SimpleDataFilter {

    // Сбрасываем все параметры которые пришли null
    for (const key in filter) {
      if (!queryParams[key] && queryParams[key] !== 0) {

        delete filter[key];
      }
    }

    for (const key in queryParams) {
      if (queryParams.hasOwnProperty(key)) {
        filter[key] = queryParams[key];
      }
    }
    return filter;
  }

  /**
   * Метод проверяет наличие элементов в массиве - его содержание
   * @param array Массив для проверки
   */
  checkArray(array: any[]): boolean {
    return (array && array.length) ? true : false;
  }

  /**
   * Метод проверяет строку
   * @param str Строка для проверки
   */
  checkString(str: string): boolean {
    return (str && str.length) ? true : false;
  }
}
