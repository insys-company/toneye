import { Injectable, Inject } from '@angular/core';
import { ItemList } from 'src/app/api';
import { Apollo } from 'apollo-angular';
import { IModel } from '../../interfaces';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { GraphQueryService, BaseFunctionsService } from '../../services';

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
    public baseFunctionsService: BaseFunctionsService,
    @Inject(function () { }) public factoryFunc: (model?: TModel) => TModel,
    @Inject(String) public parentPageName?: string,
  ) {
    // TODO
  }

  /**
   * Initialization of the service
   */
  public subscribeInit(): void {
    this._unsubscribe = new Subject<void>();
    // TODO
  }

  /**
   * Destruction of the service
   */
  public destroy(): void {
    this.unsubscribe();
    this._unsubscribe = null;
  }

  /**
   * unsubscribe from qeries of the service
   */
  public unsubscribe(): void {
    if (this._unsubscribe) {
      this._unsubscribe.next();
      this._unsubscribe.complete();
    }
  }

  /**
   * Получение данных
   */
  public refreshData(): void {
    // TODO
  }

  /**
   * Get data
   * @param _id Id of model
   * @param _variables Variables for query
   */
  public getModel(_id: string | number, _variables?: object): Observable<TModel[]> {

    const variables = _variables ? _variables : { filter: {id: {eq: _id} } };

    return this.apollo.watchQuery<ItemList<TModel>>({
      query: this.graphQueryService.getItem,
      variables: variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[this.parentPageName]));
  }
}
