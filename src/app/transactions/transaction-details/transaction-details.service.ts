import { Injectable } from '@angular/core';
import { TransactionDetailsServicesModule } from './transaction-details-services.module';
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
  providedIn: TransactionDetailsServicesModule
})
export class TransactionDetailsService extends DetailsService<Transaction> {
  constructor(
    protected apollo: Apollo,
    protected graphQueryService: TransactionQueries,
    public baseFunctionsService: BaseFunctionsService,
    private blockQueries: BlockQueries,
  ) {

    super(
      apollo,
      graphQueryService,
      baseFunctionsService,
      (data: Transaction) => new Transaction(data),
      appRouteMap.transactions
    );

  }

  /**
   * Get data
   * @param params _id block id for query
   */
  public getBlock(_id: string | number): Observable<Block[]> {

    const _variables = {
      filter: {id: {eq: _id}},
    }

    return this.apollo.watchQuery<Block[]>({
      query: this.blockQueries.getBlocks,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.blocks]))
  }
}
