import { Injectable } from '@angular/core';
import { HomeServicesModule } from './home-services.module';
import { BaseService } from 'src/app/shared/components/app-base/app-base.service';
import { Apollo } from 'apollo-angular';
import { AccountQueries } from '../api/queries';
import { BaseFunctionsService } from 'src/app/shared/services';
import { Account, FilterSettings, SimpleDataFilter } from 'src/app/api';
import { appRouteMap } from '../app-route-map';

@Injectable({
  providedIn: HomeServicesModule
})
export class HomeService extends BaseService<any> {
  constructor(
    protected apollo: Apollo,
    public graphQueryService: AccountQueries,
    public baseFunctionsService: BaseFunctionsService,
  ) {
    super(
      apollo,
      graphQueryService,
      baseFunctionsService,
      (data: any) => data,
      appRouteMap.blocks,
      appRouteMap.block,
      () => {
        this._filterSettings = new FilterSettings({
          filterChain: true,
          filterExtInt: true,
          filterByShard: false,
          filterByTime: false,
          filterByAbort: false,
          filterByMinMax: true,
          filterByDate: true,
        });
      }
    );
  }

  /**
   * Get variables
   * @param _id Id for query
   */
  public getVariablesForTransactions(params: SimpleDataFilter): object {
    params = params ? params : new SimpleDataFilter({});

    let _balance_delta = params.min != null || params.max != null
      ? {
        ge: params.min != null ? this.baseFunctionsService.decimalToHex(params.min) : undefined,
        le: params.max != null ? this.baseFunctionsService.decimalToHex(params.max) : undefined
      }
      : undefined;

    let _now = params.fromDate != null || params.toDate != null
      ? {
        ge: params.fromDate != null ? Number(params.fromDate) : undefined,
        le: params.toDate != null ? Number(params.toDate) : undefined
      }
      : undefined;

    let _workchain_id = params.chain != null
      ? { eq:  Number(params.chain) }
      : undefined;

    let _aborted = params.aborted != null
      ? { eq:  Boolean(params.aborted) }
      : undefined;

    return {
      filter: {
        aborted: _aborted,
        workchain_id: _workchain_id,
        balance_delta: _balance_delta,
        now: _now,
      },
      orderBy: [
        {path: 'now', direction: 'DESC'},
        {path: 'account_addr', direction: 'DESC'},
        {path: 'lt', direction: 'DESC'}
      ],
      limit: 50
    };
  }

  /**
   * Variables for blocks
   * @param params Filter params
   */
  public getVariablesForBlocks(params: SimpleDataFilter): object {
    params = params ? params : new SimpleDataFilter({});

    let _tr_count = params.min != null || params.max != null
      ? {
        ge: params.min != null ? Number(params.min) : undefined,
        le: params.max != null ? Number(params.max) : undefined
      }
      : undefined;

    let _workchain_id = params.chain != null
      ? { eq:  Number(params.chain) }
      : undefined;

    let _gen_utime = params.fromDate != null || params.toDate != null
      ? {
        ge: params.fromDate != null ? Number(params.fromDate) : undefined,
        le: params.toDate != null ? Number(params.toDate) : undefined
      }
      : undefined;

    let _shard = params.shard != null
      ? { eq: params.shard }
      : undefined;

    return {
      filter: {
        workchain_id: _workchain_id,
        gen_utime: _gen_utime,
        shard: _shard,
        tr_count: _tr_count
      },
      orderBy: [{path: 'gen_utime', direction: 'DESC'}],
      limit: 50
    };
  }

  /**
   * Получение сообщений
   * @param params Параметры фильтра
   * @param srcTypeMess Только по источнику если true, только по получателю если false
   * все если null
   */
  public getVariablesForMessages(params: SimpleDataFilter, srcTypeMess: boolean = null): object {
    params = params ? params : new SimpleDataFilter({});

    let _dst: object;

    let _src: object;

    // Только по src
    if (srcTypeMess + '' == 'true') {

      _src = params.chain != null
        ? {ge: `${params.chain}:`, lt: `${params.chain}:z`}
        : params.ext_int == 'ext'
          ? { eq: '' }
          : undefined;

      _dst = params.chain != null && params.ext_int == 'ext'
        ? { eq: '' }
        : undefined;

    }
    // Только по dst
    else if (srcTypeMess + '' == 'false') {

      _dst = params.chain != null
        ? {ge: `${params.chain}:`, lt: `${params.chain}:z`}
        : params.ext_int == 'ext'
          ? { eq: '' }
          : undefined;

      _src = params.chain != null && params.ext_int == 'ext'
        ? { eq: '' }
        : undefined;

    }
    // Все
    else {

      _dst = undefined;
      _src = undefined;
    }

    let _value = params.min != null || params.max != null
      ? {
        ge: params.min != null ? this.baseFunctionsService.decimalToHex(params.min) : undefined,
        le: params.max != null ? this.baseFunctionsService.decimalToHex(params.max) : undefined
      }
      : undefined;

    let _created_at = params.fromDate != null || params.toDate != null
      ? {
        ge: params.fromDate != null ? Number(params.fromDate) : undefined,
        le: params.toDate != null ? Number(params.toDate) : undefined
      }
      : undefined;

    let _msg_type = params.ext_int == 'int'
      ? { eq: 0 }
      : undefined;

    return {
      filter: {
        dst: _dst,
        src: _src,
        msg_type: _msg_type,
        value: _value,
        created_at: _created_at,
      },
      orderBy: [
        {path: 'created_at', direction: 'DESC'}
      ],
      limit: 50
    };
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
  //     query: this.commonQueries.getGeneralData,
  //     variables: {},
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

  // /**
  //  * Get message list
  //  * @param params Variables by filters for query
  //  */
  // getMessages(params?: any): Observable<Message[]> {

  //   const _variables = {
  //     filter: {},
  //     orderBy: [{path: 'created_at', direction: 'DESC'}],
  //     limit: 50,
  //   }

  //   return this.apollo.watchQuery<Message[]>({
  //     query: this.messageQueries.getMessages,
  //     variables: params ? params : _variables,
  //     errorPolicy: 'all'
  //   })
  //   .valueChanges
  //   .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.messages]))
  // }

  // /**
  //  * Get transaction list
  //  * @param params Variables by filters for query
  //  */
  // getTransaction(params?: any): Observable<Transaction[]> {

  //   const _variables = {
  //     filter: {},
  //     orderBy:  [
  //       {path: 'now', direction: 'DESC'},
  //       {path: 'account_addr', direction: 'DESC'},
  //       {path: 'lt', direction: 'DESC'}
  //     ],
  //     limit: 50,
  //   }

  //   return this.apollo.watchQuery<Transaction[]>({
  //     query: this.transactionQueries.getTransaction,
  //     variables: params ? params : _variables,
  //     errorPolicy: 'all'
  //   })
  //   .valueChanges
  //   .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.transactions]))
  // }
}
