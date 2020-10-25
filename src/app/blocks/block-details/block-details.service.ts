import { Injectable } from '@angular/core';
import { BlockDetailsServicesModule } from './block-details-services.module';
import { BaseService } from 'src/app/shared/components/app-base/app-base.service';
import { Apollo } from 'apollo-angular';
import { BlockQueries } from '../../api/queries';
import { BaseFunctionsService } from 'src/app/shared/services';
import { Block } from 'src/app/api';
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
      appRouteMap.blocks
    );
  }

  /**
   * Get variables
   * @param _id Id for query
   */
  public getVariablesForTransactions(_id: string | number): object {
    return {
      filter: {block_id: { eq: _id}},
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
