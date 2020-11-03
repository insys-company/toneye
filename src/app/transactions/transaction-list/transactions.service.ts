import { Injectable } from '@angular/core';
import { TransactionsServicesModule } from './transactions-services.module';
import { BaseService } from 'src/app/shared/components/app-base/app-base.service';
import { Apollo } from 'apollo-angular';
import { MessageQueries } from '../../api/queries';
import { BaseFunctionsService } from 'src/app/shared/services';
import { Transaction, FilterSettings, SimpleDataFilter } from 'src/app/api';
import { appRouteMap } from '../../app-route-map';

@Injectable({
  providedIn: TransactionsServicesModule
})
export class TransactionsService extends BaseService<Transaction> {
  constructor(
    protected apollo: Apollo,
    public graphQueryService: MessageQueries,
    public baseFunctionsService: BaseFunctionsService,
  ) {
    super(
      apollo,
      graphQueryService,
      baseFunctionsService,
      (data: Transaction) => new Transaction(data),
      appRouteMap.transactions,
      appRouteMap.transaction,
      () => {
        this._filterSettings = new FilterSettings({
          filterChain: true,
          filterExtInt: false,
          filterByShard: false,
          filterByTime: false,
          filterByAbort: true,
          filterByMinMax: true,
          filterByDate: true,
          filterByDirection: false,
        });
      }
    );
  }

  /**
   * Get variables
   * @param _ids Ids of Blocks
   */
  public getVariablesForFilterBlocks(_ids: Array<string>): object {
    return {filter: {id: {in: _ids}}};
  }

  /**
   * Variables for blocks
   * @param params Filter params
   * @pram isForAggregateData For agg data
   */
  public getVariablesForTransactions(params: SimpleDataFilter, isForAggregateData: boolean = false): object {
    params = params ? params : new SimpleDataFilter({});

    let _balance_delta = params.min != null || params.max != null
      ? {
        ge: params.min != null ? this.baseFunctionsService.decimalToHex(params.min) : undefined,
        le: params.max != null ? this.baseFunctionsService.decimalToHex(params.max) : undefined
      }
      : undefined;

    let _now = params.fromDate != null || params.toDate != null
      ? { ge: params.fromDate, le: params.toDate }
      : undefined;

    let _workchain_id = params.chain != null
      ? { eq:  Number(params.chain) }
      : undefined;

    let _aborted = params.aborted != null
      ? { eq:  Boolean(params.aborted) }
      : undefined;

    let _orderBy = !isForAggregateData
      ? [{path: 'now', direction: 'DESC'},{path: 'account_addr', direction: 'DESC'},{path: 'lt', direction: 'DESC'}]
      : undefined;

    return {
      filter: {
        aborted: _aborted,
        workchain_id: _workchain_id,
        balance_delta: _balance_delta,
        now: _now,
      },
      orderBy: _orderBy,
      limit: !isForAggregateData ? 50 : undefined
    };
  }
}
