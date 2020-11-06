import { Injectable, Inject } from '@angular/core';
import { IModel } from '../../interfaces';
import { Apollo } from 'apollo-angular';
import { GraphQueryService, BaseFunctionsService } from '../../services';
import { Subject, Observable } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { DocumentNode } from 'graphql';
import { ItemList, TabViewerData, FilterSettings, SimpleDataFilter } from 'src/app/api';
import { appRouteMap } from 'src/app/app-route-map';
import _ from 'underscore';

@Injectable({
  providedIn: 'root'
})
export class BaseService<TModel extends IModel> {
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
    public graphQueryService: GraphQueryService,
    public baseFunctionsService: BaseFunctionsService,
    @Inject(function () {}) public factoryFunc: (model?: TModel) => TModel,
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
  public init(): void {
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
   * Map data for table viewer
   * @param _list List of contracts
   * @param type Type of contract
   * @param arrayLength Length of mapped array
   * @param _data Aditional data
   */
  public mapDataForTable(_list: any[], type: string, arrayLength: number = null, _data?: any): TabViewerData[] {
    if (!_list || !_list.length) { return []; }

    let data = [];

    data = _list.map((item: any) => {
      if (type === appRouteMap.accounts) {
        return this.baseFunctionsService.mapAccountForTable(item, _data);
      }
      else if (type === appRouteMap.blocks) {
        return this.baseFunctionsService.mapBlockForTable(item);
      }
      else if (type === appRouteMap.contracts) {
        return this.baseFunctionsService.mapContractForTable(item);
      }
      else if (type === appRouteMap.messages) {
        return this.baseFunctionsService.mapMessageForTable(item, _data);
      }
      else if (type === appRouteMap.inOutMessages) {
        return this.baseFunctionsService.mapInOutMsgsForTable(item);
      }
      else if (type === appRouteMap.transactions) {
        return this.baseFunctionsService.mapTransactionForTable(item);
      }
      else if (type === appRouteMap.validators) {
        return this.baseFunctionsService.mapValidatorForTable(item, _data);
      }
      else {
        return null;
      }
    });

    data = _.without(data, null);

    data = arrayLength != null ? _.clone(_.first(data, arrayLength)) : _.clone(data);

    return data;
  }

  /**
   * Get variables (for master block)
   */
  public getVariablesForPrevBlockKey(): object {
    return {filter: {workchain_id: {eq: -1}}, orderBy: [{path: 'seq_no', direction: 'DESC'}], limit: 1};
  }

  /**
   * Get variables (for master block)
   * @param seq_no For query
   */
  public getVariablesForPrevBlockConfig(seq_no: number): object {
    return {filter: {seq_no: {eq: seq_no}, workchain_id: {eq: -1}}};
  }

  /**
   * Get variables
   * @param _id block id for query
   */
  public getVariablesForModel(_id: string | number): object {
    return {filter: {id: {eq: _id}}};
  }

  /**
   * Get variables
   * @param params Filter params for query
   * @param _data Aditional data for query
   */
  public getVariablesForAggregateData(params?: SimpleDataFilter, _data?: any): object {
    return {filter: {}};
  }

  /**
   * Get data (model for details component)
   * @param _id Id of model
   * @param _variables Variables for query
   * @param _graphQ for query
   */
  public getModel(_id: string | number, _variables?: object, _graphQ?: DocumentNode): Observable<TModel[]> {

    const variables = _variables ? _variables : this.getVariablesForModel(_id);

    return this.apollo.watchQuery<ItemList<TModel>>({
      query: _graphQ  ? _graphQ : this.graphQueryService.getItem,
      variables: variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[this.parentPageName]));
  }

  /**
   * Get data (list for list component)
   * @param _variables for query
   * @param _graphQ for query
   * @param arrayMapName Name of array in data
   */
  public getData(_variables: any, _graphQ: DocumentNode, arrayMapName: string = null): Observable<any[]> {
    return this.apollo.watchQuery<ItemList<any>>({
      query: _graphQ,
      variables: _variables,
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => arrayMapName != null ? res.data[arrayMapName] : res.data[this.parentPageName]));
  }

  /**
   * Get data
   * @param _variables for query
   * @param _graphQ for query
   * @param arrayMapName Name of array in data
   */
  public getGeneralData(_variables: any, _graphQ: DocumentNode, arrayMapName: string = null): Observable<any> {
    return this.apollo.watchQuery<ItemList<any>>({
      query: _graphQ,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => arrayMapName != null ?  res.data[arrayMapName] : res.data));
  }

  /**
   * Get data
   * @param _variables for query
   * @param _graphQ for query
   */
  public getAggregateData(_variables: any, _graphQ: DocumentNode): Observable<any> {
    return this.apollo.watchQuery<ItemList<any>>({
      query: _graphQ,
      variables: _variables,
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data));
  }
}
