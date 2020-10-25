import { Injectable } from '@angular/core';
import { TransactionDetailsServicesModule } from './transaction-details-services.module';
import { BaseService } from 'src/app/shared/components/app-base/app-base.service';
import { Apollo } from 'apollo-angular';
import { TransactionQueries } from '../../api/queries';
import { BaseFunctionsService } from 'src/app/shared/services';
import { Transaction } from 'src/app/api';
import { appRouteMap } from '../../app-route-map';

@Injectable({
  providedIn: TransactionDetailsServicesModule
})
export class TransactionDetailsService extends BaseService<Transaction> {
  constructor(
    protected apollo: Apollo,
    public graphQueryService: TransactionQueries,
    public baseFunctionsService: BaseFunctionsService,
  ) {
    super(
      apollo,
      graphQueryService,
      baseFunctionsService,
      (data: Transaction) => new Transaction(data),
      appRouteMap.transactions
    );
  }
}
