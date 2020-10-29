import { Injectable } from '@angular/core';
import { ValidatorsServicesModule } from './validators-services.module';
import { BaseService } from 'src/app/shared/components/app-base/app-base.service';
import { Apollo } from 'apollo-angular';
import { BlockQueries } from '../../api/queries';
import { BaseFunctionsService } from 'src/app/shared/services';
import { FilterSettings } from 'src/app/api';
import { appRouteMap } from '../../app-route-map';

@Injectable({
  providedIn: ValidatorsServicesModule
})
export class ValidatorsService extends BaseService<any> {
  constructor(
    protected apollo: Apollo,
    public graphQueryService: BlockQueries,
    public baseFunctionsService: BaseFunctionsService,
  ) {
    super(
      apollo,
      graphQueryService,
      baseFunctionsService,
      (data: any) => data,
      appRouteMap.validators,
      appRouteMap.validator,
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
}
