import { Injectable } from '@angular/core';
import { BlocksServicesModule } from './blocks-services.module';
import { BaseService } from 'src/app/shared/components/app-base/app-base.service';
import { Apollo } from 'apollo-angular';
import { MessageQueries } from '../../api/queries';
import { BaseFunctionsService } from 'src/app/shared/services';
import { Block, FilterSettings, SimpleDataFilter } from 'src/app/api';
import { appRouteMap } from '../../app-route-map';

@Injectable({
  providedIn: BlocksServicesModule
})
export class BlocksService extends BaseService<Block> {
  constructor(
    protected apollo: Apollo,
    public graphQueryService: MessageQueries,
    public baseFunctionsService: BaseFunctionsService,
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
          filterChain: true,
          filterExtInt: false,
          filterByShard: true,
          filterByTime: false,
          filterByAbort: false,
          filterByMinMax: true,
          filterByDate: true,
          filterByDirection: false,
        });
      }
    );
  }

  /**
   * Get variables
   * @param node_id Id for query
   */
  public getVariablesForAggregateData(params: SimpleDataFilter, gen_utime: number): object {
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

    let _gen_utime = gen_utime != null || params.fromDate != null || params.toDate != null
      ? {
        ge: params.fromDate != null ? (Number(params.fromDate) >= Number(gen_utime)) ? Number(params.fromDate) : Number(gen_utime) : undefined,
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
      }
    };
  }

  /**
   * Variables for blocks
   * @param params Filter params
   */
  public getVariablesForBlocks(params: SimpleDataFilter, limit: number = 50): object {
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
      limit: limit
    };
  }
}
