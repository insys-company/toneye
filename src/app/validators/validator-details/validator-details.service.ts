import { Injectable } from '@angular/core';
import { ValidatorDetailsServicesModule } from './validator-details-services.module';
import { BaseService } from 'src/app/shared/components/app-base/app-base.service';
import { Apollo } from 'apollo-angular';
import { BlockQueries } from '../../api/queries';
import { BaseFunctionsService } from 'src/app/shared/services';
import { Block } from 'src/app/api';
import { appRouteMap } from '../../app-route-map';

const NODE_ID="4cded8178438ca7739b7429f7eabff5961023878a2ffaa2dbf03f040f87c4e04";
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
      appRouteMap.blocks
    );
  }

  /**
   * Get variables
   * @param node_id Id for query
   */
  public getVariablesForAggregateBlockSignaturesTotal(node_id: string | number = NODE_ID): object {
    return {filter: {signatures: {any: {node_id: {eq: node_id}}}}};
  }

  /**
   * Get variables
   * @param node_id Id for query
   */
  public getVariablesForAggregateBlockSignatures(node_id: string | number = NODE_ID): object {
    return {
      filter: {signatures: {any: {node_id: {eq: node_id}}}},
      orderBy: [{path: 'gen_utime', direction: 'DESC'}],
      limit: 50
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
