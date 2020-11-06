import { Injectable } from '@angular/core';
import { BlockDetailsServicesModule } from './block-details-services.module';
import { BaseService } from 'src/app/shared/components/app-base/app-base.service';
import { Apollo } from 'apollo-angular';
import { BlockQueries } from '../../api/queries';
import { BaseFunctionsService } from 'src/app/shared/services';
import { Block, SimpleDataFilter, FilterSettings } from 'src/app/api';
import { appRouteMap } from '../../app-route-map';

@Injectable({
  providedIn: BlockDetailsServicesModule
})
export class BlockDetailsService extends BaseService<Block> {
  constructor(
    protected apollo: Apollo,
    public graphQueryService: BlockQueries,
    public baseFunctionsService: BaseFunctionsService
  ) {
    super(
      apollo,
      graphQueryService,
      baseFunctionsService,
      (data: Block) => new Block(data),
      appRouteMap.blocks,
      appRouteMap.block,
      () => {
        this._filterSettings = new FilterSettings({
          filterChain: false,
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
   * @param _id Id for query
   */
  public getVariablesForTransactions(params: SimpleDataFilter, _id: string): object {
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
        block_id: {eq: _id},
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
   * Get variables
   * @param params _seq_no seq_no of currently model
   * @param params _workchain_id workchain_id of currently model
   * @param params _shard shard of currently model
   */
  public getVariablesForBlockBySeqNo(_seq_no: number, _workchain_id: number, _shard?: string): object {
    return {
      filter: _shard != null
        ? {seq_no: {eq: _seq_no}, workchain_id: {eq: _workchain_id}, shard: {eq: _shard}}
        : {seq_no: {eq: _seq_no}, workchain_id: {eq: _workchain_id}},
      orderBy: [
        {path: 'gen_utime', direction: 'DESC'},
        {path: 'seq_no', direction: 'DESC'}
      ]
    };
  }

  /**
   * Get variables
   * @param _id Id for query
   */
  public getVariablesForPrevBlock(_id: string | number): object {
    return {filter: {id: {eq: _id}}};
  }
}
