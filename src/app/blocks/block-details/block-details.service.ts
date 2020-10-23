import { Injectable } from '@angular/core';
import { BlockDetailsServicesModule } from './block-details-services.module';
import { Apollo } from 'apollo-angular';
import { BlockQueries, TransactionQueries } from '../../api/queries';
import { Observable } from 'rxjs';
import { Block, Transaction } from '../../api';
import { map } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from '../../app-route-map';
import { DetailsService } from 'src/app/shared/components/app-details/app-details.service';
import { BaseFunctionsService } from 'src/app/shared/services';

@Injectable({
  providedIn: BlockDetailsServicesModule
})
export class BlockDetailsService extends DetailsService<Block> {
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
      (data: Block) => new Block(data),
      appRouteMap.blocks
    );

  }

  /**
   * Get data
   * @param _id Id of model
   */
  public getTransactions(_id: string | number): Observable<Transaction[]> {

    const _variables = {
      filter: {block_id: { eq: _id}},
      orderBy: [
        {path: 'now', direction: 'DESC'},
        {path: 'account_addr', direction: 'DESC'},
        {path: 'lt', direction: 'DESC'}
      ],
      limit: 50
    }

    return this.apollo.watchQuery<Transaction[]>({
      query: this.transactionQueries.getTransactions,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.transactions]))
  }

  /**
   * Get data
   * @param params _seq_no seq_no of currently model
   * @param params _workchain_id workchain_id of currently model
   * @param params _shard shard of currently model
   */
  public getBlockBySeqNo(_seq_no: number, _workchain_id: number, _shard?: string): Observable<Block[]> {

    const _variables = {
      filter: _shard != null
        ? {seq_no: {eq: _seq_no}, workchain_id: {eq: _workchain_id}, shard: {eq: _shard}}
        : {seq_no: {eq: _seq_no}, workchain_id: {eq: _workchain_id}},
      orderBy: [
        {path: 'gen_utime', direction: 'DESC'},
        {path: "seq_no", direction: "DESC"}
      ]
    }

    return this.apollo.watchQuery<Block[]>({
      query: this.graphQueryService.getBlocks,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.blocks]))
  }

  /**
   * Get data
   * @param params _id Id of previos block
   */
  public getPreviosBlock(_id: string | number): Observable<Block[]> {

    const _variables = {
      filter: {id: {eq: _id}},
    }

    return this.apollo.watchQuery<Block[]>({
      query: this.graphQueryService.getBlocks,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.blocks]))
  }
}
