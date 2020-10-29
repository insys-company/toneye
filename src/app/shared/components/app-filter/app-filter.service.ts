import { Injectable } from '@angular/core';
import { ListItem, Block, ItemList } from 'src/app/api';
import { Apollo } from 'apollo-angular';
import { BlockQueries } from 'src/app/api/queries';
import { Observable, Subject } from 'rxjs';
import { appRouteMap } from 'src/app/app-route-map';
import { takeUntil, map } from 'rxjs/operators';
import { LocaleText } from 'src/locale/locale';

@Injectable({
  providedIn: 'root'
})
export class AppFilterService {
  /**
   * For subscribers
   */
  public _unsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private apollo: Apollo,
    private blockQueries: BlockQueries,
    // public baseFunctionsService: BaseFunctionsService,
  ) {

  }

  /**
   * Initialization of the service
   */
  public init(): void {
    this._unsubscribe = new Subject<void>();
  }

  /**
   * Destruction of the service
   */
  public destroy(): void {
    this.unsubscribe();
    this._unsubscribe = null;
  }

  /**
   * unsubscribe from qeries of the component
   */
  public unsubscribe(): void {
    if (this._unsubscribe) {
      this._unsubscribe.next();
      this._unsubscribe.complete();
    }
  }

  /**
   * List of chains
   */
  public getChains(): ListItem[] {
    return LocaleText.chainFilter;
  }

  /**
   * List of ExtInt
   */
  public getExtInt(): ListItem[] {
    return LocaleText.extintFilter;
  }

  /**
   * List of directions
   */
  public getDirections(): ListItem[] {
    return LocaleText.diractionFilter;
  }

  /**
   * List of aborted
   */
  public getAbortFilter(): ListItem[] {
    return LocaleText.abortFilter;
  }

  /**
   * Get general information
   *
   * queries:
   * getAccountsCount
   * getAccountsTotalBalance
   */
  public getShards(): Observable<Block[]> {
    if (!this._unsubscribe) {
      this._unsubscribe = new Subject<void>();
    }

    return this.apollo.watchQuery<ItemList<Block>>({
      query: this.blockQueries.getMasterBlockShard,
      variables: {filter: {workchain_id: {eq: -1}}, orderBy: [{path: 'seq_no', direction: 'DESC'}], limit: 1},
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.blocks]));
  }
}