import { Injectable } from '@angular/core';
import { ValidatorDetailsServicesModule } from './validator-details-services.module';
import { BaseService } from 'src/app/shared/components/app-base/app-base.service';
import { Apollo } from 'apollo-angular';
import { BlockQueries } from '../../api/queries';
import { BaseFunctionsService } from 'src/app/shared/services';
import { Block, FilterSettings } from 'src/app/api';
import { appRouteMap } from '../../app-route-map';

@Injectable({
  providedIn: ValidatorDetailsServicesModule
})
export class ValidatorDetailsService extends BaseService<any> {
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
          filterByAbort: false,
          filterByMinMax: false,
          filterByDate: false,
          filterByDirection: false,
        });
      }
    );
  }

  /**
   * Get variables
   * @param node_id Id for query
   */
  public getVariablesForAggregateBlockSignaturesTotal(node_id: string | number): object {
    return {filter: {signatures: {any: {node_id: {eq: node_id}}}}};
  }

  /**
   * Get variables
   * @param node_id Id for query
   */
  public getVariablesForAggregateBlockSignatures(node_id: string | number, data: string = null, limit: number = 50): object {

    let _gen_utime = data != null
      ? {
        le: data != null ? Number(data) : undefined
      }
      : undefined;

    return {
      filter: {
        gen_utime: _gen_utime,
        signatures: {any: {node_id: {eq: node_id}}}
      },
      orderBy: [{path: 'gen_utime', direction: 'DESC'}],
      limit: limit
    };
  }

  /**
   * Get variables
   * @param _id Id for query
   */
  public getVariablesForBlocks(_id: string | number): object {
    return {filter: {}, orderBy: [{path: 'gen_utime', direction: 'DESC'}], limit: 50};
  }

  /**
   * Get variables
   * @param _ids Ids of Signatures Blocks
   */
  public getVariablesForFilterBlocks(_ids: Array<string>): object {
    return {filter: {id: {in: _ids}}};
  }

  /**
   * Get variables
   * @param utime_until Time for query
   * @param utime_since Time for query
   */
  public getVariablesForAggregateBlocks(utime_until: number, utime_since: number): object {
    return {filter: {gen_utime: {le: utime_until, ge: utime_since}, workchain_id: {eq: -1}}};
  }
}
