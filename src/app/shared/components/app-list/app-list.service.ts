import { Injectable, Inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { GraphQueryService, BaseFunctionsService } from '../../services';
import { IModel } from '../../interfaces';
import { FilterSettings } from '../app-filter/filter-settings';
import { DocumentNode } from 'graphql';
import { takeUntil, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ListService<TModel extends IModel> {
  /**
   * For subscribers
   */
  protected _unsubscribe: Subject<void> = new Subject();
  /**
   * Filter settings
   */
  public _filterSettings: FilterSettings;

  constructor(
    protected apollo: Apollo,
    protected graphQueryService: GraphQueryService,
    public baseFunctionsService: BaseFunctionsService,
    @Inject(String) public parentPageName: string,
    @Inject(String) public detailsPageName?: string,
    /** Настройки для фильтров */
    @Inject(function() {}) protected _setFilterSettings?: () => void,
  ) {
    // TODO
  }

  /**
   * Initialization of the service
   */
  public subscribeInit(): void {
    this._unsubscribe = new Subject<void>();
    this.setFilterSettings();
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
   * Set Filters
   */
  public setFilterSettings(): void {
    if (this._setFilterSettings) {
      this._setFilterSettings();
    }
  }

  /**
   * Get data
   * @param _variables for query
   * @param _graphQ for query
   * @param arrayMapName Name of array in data
   */
  public getData(_variables: any, _graphQ: DocumentNode, arrayMapName: string = null): Observable<TModel[]> {
    return this.apollo.watchQuery<TModel[]>({
      query: _graphQ,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => arrayMapName == null ? res.data[this.parentPageName] : res.data[arrayMapName]));
  }

  /**
   * Get data
   * @param _variables for query
   * @param _graphQ for query
   */
  public getGeneralData(_variables: any, _graphQ: DocumentNode): Observable<any> {
    return this.apollo.watchQuery<any>({
      query: _graphQ,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data));
  }

  /**
   * Get data
   * @param _variables for query
   * @param _graphQ for query
   */
  public getAggregateData(_variables: any, _graphQ: DocumentNode): Observable<any> {
    return this.apollo.watchQuery<any>({
      query: _graphQ,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data));
  }
}
