import { Injectable } from '@angular/core';
import { MessagesServicesModule } from './messages-services.module';
import { BaseService } from 'src/app/shared/components/app-base/app-base.service';
import { Apollo } from 'apollo-angular';
import { MessageQueries } from '../../api/queries';
import { BaseFunctionsService } from 'src/app/shared/services';
import { Message, FilterSettings, SimpleDataFilter } from 'src/app/api';
import { appRouteMap } from '../../app-route-map';

@Injectable({
  providedIn: MessagesServicesModule
})
export class MessagesService extends BaseService<Message> {
  constructor(
    protected apollo: Apollo,
    public graphQueryService: MessageQueries,
    public baseFunctionsService: BaseFunctionsService,
  ) {
    super(
      apollo,
      graphQueryService,
      baseFunctionsService,
      (data: Message) => new Message(data),
      appRouteMap.messages,
      appRouteMap.message,
      () => {
        this._filterSettings = new FilterSettings({
          filterChain: true,
          filterExtInt: true,
          filterByShard: false,
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
  public getVariablesForAggregateData(params: SimpleDataFilter): object {
    params = params ? params : new SimpleDataFilter({});

    let _value = params.min != null || params.max != null
      ? {
        ge: params.min != null ? this.baseFunctionsService.decimalToHex(params.min) : undefined,
        le: params.max != null ? this.baseFunctionsService.decimalToHex(params.max) : undefined
      }
      : undefined;

    let _created_at = params.fromDate != null || params.toDate != null
      ? { ge: params.fromDate, le: params.toDate }
      : undefined;

    return {
      filter: {
        value: _value,
        created_at: _created_at
      }
    };
  }

  /**
   * Получение сообщений
   * @param params Параметры фильтра
   * @param srcTypeMess Только по источнику если true, только по получателю если false
   * все если null
   */
  public getVariablesForMessages(params: SimpleDataFilter, srcTypeMess: boolean = null): object {
    params = params ? params : new SimpleDataFilter({});

    let _dst: object;

    let _src: object;

    // Только по src
    if (srcTypeMess + '' == 'true') {

      _src = params.chain != null
        ? {ge: `${params.chain}:`, lt: `${params.chain}:z`}
        : params.ext_int == 'ext'
          ? { eq: '' }
          : undefined;

      _dst = params.chain != null && params.ext_int == 'ext'
        ? { eq: '' }
        : undefined;

    }
    // Только по dst
    else if (srcTypeMess + '' == 'false') {

      _dst = params.chain != null
        ? {ge: `${params.chain}:`, lt: `${params.chain}:z`}
        : params.ext_int == 'ext'
          ? { eq: '' }
          : undefined;

      _src = params.chain != null && params.ext_int == 'ext'
        ? { eq: '' }
        : undefined;

    }
    // Все
    else {

      _dst = undefined;
      _src = undefined;
    }

    let _value = params.min != null || params.max != null
      ? {
        ge: params.min != null ? this.baseFunctionsService.decimalToHex(params.min) : undefined,
        le: params.max != null ? this.baseFunctionsService.decimalToHex(params.max) : undefined
      }
      : undefined;

    let _created_at = params.fromDate != null || params.toDate != null
      ? { ge: params.fromDate, le: params.toDate }
      : undefined;

    let _msg_type = params.ext_int == 'int'
      ? { eq: 0 }
      : undefined;

    return {
      filter: {
        dst: _dst,
        src: _src,
        msg_type: _msg_type,
        value: _value,
        created_at: _created_at,
      },
      orderBy: [
        {path: 'created_at', direction: 'DESC'}
      ],
      limit: 50
    };
  }
}
