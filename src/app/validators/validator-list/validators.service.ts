import { Injectable } from '@angular/core';
import { ValidatorsServicesModule } from './validators-services.module';
import { Apollo } from 'apollo-angular';
import { BlockQueries, CommonQueries, MessageQueries, TransactionQueries } from '../../api/queries';
import { Observable, Subject } from 'rxjs';
import { Block, Message, Transaction, QueryOrderBy, ValidatorSetList } from '../../api';
import { map } from 'rxjs/operators';
// import 'rxjs/add/operator/map';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from '../../app-route-map';
import { ListService } from 'src/app/shared/components/app-list/app-list.service';
import { BaseFunctionsService } from 'src/app/shared/services';
import { FilterSettings } from 'src/app/shared/components/app-filter/filter-settings';

@Injectable({
  providedIn: ValidatorsServicesModule
})
export class ValidatorsService extends ListService<any> {

  constructor(
    protected apollo: Apollo,
    protected graphQueryService: BlockQueries,
    public baseFunctionsService: BaseFunctionsService,
    private transactionQueries: TransactionQueries,
  ) {

    super(
      apollo,
      graphQueryService,
      baseFunctionsService,
      appRouteMap.blocks,
      appRouteMap.block,
      () => {
        // this._filterSettings = new FilterSettings({
        //   filterVisible: true,
        //   filterByCountry: true,
        //   filterByStatus: true,
        //   filterBySearch: true,
        //   enableDefaultStatus: true,
        // });
      }
    );

  }

  // constructor(
  //   private apollo: Apollo,
  //   private blockQueries: BlockQueries,
  //   private commonQueries: CommonQueries,
  //   private messageQueries: MessageQueries,
  //   private transactionQueries: TransactionQueries,
  // ) {
  //   // TODO
  // }

  // ngUnsubscribe(): void {
  //   this._unsubscribe.next();
  //   this._unsubscribe.complete();
  // }

  // /**
  //  * Get master block for
  //  *
  //  * prev_key_block_seqno
  //  * seq_no and
  //  * master
  //  * 
  //  * return one block
  //  */
  // getMasterBlock(): Observable<Block[]> {
  //   return this.apollo.watchQuery<Block[]>({
  //     query: this.blockQueries.getMasterBlock,
  //     // static for master
  //     variables: {
  //       filter: {workchain_id: {eq: -1}},
  //       orderBy: [{path: "seq_no", direction: "DESC"}],
  //       limit: 1,
  //     },
  //     errorPolicy: 'all'
  //   })
  //   .valueChanges
  //   .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.blocks]))
  // }

  // /**
  //  * Get general information
  //  *
  //  * queries:
  //  * getAccountsCount
  //  * aggregateTransactions
  //  * getAccountsTotalBalance
  //  */
  // getGeneralData(): Observable<any>{
  //   return this.apollo.watchQuery<any>({
  //     query: this.commonQueries.getAggregateBlocks,
  //     variables: {
  //       filter: {gen_utime: {ge: 1602995420}},
  //     },
  //     errorPolicy: 'all'
  //   })
  //   .valueChanges
  //   .pipe(takeUntil(this._unsubscribe), map(res => res.data))
  // }

  // /**
  //  * Get block list
  //  * @param params Variables by filters for query
  //  */
  // getBlocks(params?: any): Observable<Block[]> {

  //   const _variables = {
  //     filter: {},
  //     orderBy: [{path: 'gen_utime', direction: 'DESC'}],
  //     limit: 50,
  //   }

  //   return this.apollo.watchQuery<Block[]>({
  //     query: this.blockQueries.getBlocks,
  //     variables: params ? params : _variables,
  //     errorPolicy: 'all'
  //   })
  //   .valueChanges
  //   .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.blocks]))
  // }
}
