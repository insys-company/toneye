import { Injectable } from '@angular/core';
import { SimpleDataFilter, ItemList } from 'src/app/api/contracts';
import { Apollo } from 'apollo-angular';
import { DocumentNode } from 'graphql';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseFunctionsService } from '../../services';

@Injectable({
  providedIn: 'root'
})
export class ExportDialogService {

  /**
   * For query
   */
    response: Subject<boolean> = new Subject<boolean>();

  constructor(
    protected apollo: Apollo,
    private baseFunctionsService: BaseFunctionsService,
  ) {
    // TODO
  }

  /**
   * Get data (list for list component)
   * @param _variables for query
   * @param _graphQ for query
   * @param arrayMapName Name of array in data
   */
  public getData(_variables: any, _graphQ: DocumentNode, arrayMapName: string = null): Observable<any[]> {
    return this.apollo.watchQuery<ItemList<any>>({
      query: _graphQ,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(map(res => arrayMapName != null ? res.data[arrayMapName] : res.data));
  }

  /**
   * Variables for blocks
   * @param params Filter params
   */
  public getVariablesForBlocks(params: SimpleDataFilter): object {
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
      limit: 50
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
      ? {
        ge: params.fromDate != null ? Number(params.fromDate) : undefined,
        le: params.toDate != null ? Number(params.toDate) : undefined
      }
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

  /**
   * Получение сообщений
   * @param params Параметры фильтра
   * @param _id Id аккаунта
   * @param srcTypeMess Только по источнику если true, только по получателю если false
   * все если null
   */
  public getVariablesForMessagesForAccount(params: SimpleDataFilter, _id: string, srcTypeMess: boolean = null): object {
    params = params ? params : new SimpleDataFilter({});

    let id = params.chain != null && !_id.match(`${params.chain}:`) ? {eq: null} : undefined;

    let _dst: object;

    let _src: object;

    // Только по src
    if (params.msg_direction == 'src' || srcTypeMess  + '' == 'true') {

      _src = id
        ? undefined
        : { eq: _id };

      _dst = id
        ? undefined 
        : params.ext_int == 'ext'
          ? { eq: '' }
          : undefined;

    }
    // Только по dst
    else if (params.msg_direction == 'dst' || srcTypeMess  + '' == 'false') {

      _dst = id
        ? undefined
        : { eq: _id };

        _src = id
        ? undefined 
        : params.ext_int == 'ext'
          ? { eq: '' }
          : undefined;
    }

    let _value = params.min != null || params.max != null
      ? {
        ge: params.min != null ? this.baseFunctionsService.decimalToHex(params.min) : undefined,
        le: params.max != null ? this.baseFunctionsService.decimalToHex(params.max) : undefined
      }
      : undefined;

    let _created_at = params.fromDate != null || params.toDate != null
      ? {
        ge: params.fromDate != null ? Number(params.fromDate) : undefined,
        le: params.toDate != null ? Number(params.toDate) : undefined
      }
      : undefined;

    let _msg_type = params.ext_int == 'int'
      ? { eq: 0 }
      : undefined;

    return {
      filter: {
        id: id,
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

  /**
   * Variables for blocks
   * @param params Filter params
   * @pram isForAggregateData For agg data
   */
  public getVariablesForTransactions(params: SimpleDataFilter, blockId: string | number = null, accountId: string | number = null): object {
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
        block_id: blockId != null ? { eq:  blockId } : undefined,
        account_addr: accountId != null ? { eq:  accountId } : undefined,
        aborted: _aborted,
        workchain_id: _workchain_id,
        balance_delta: _balance_delta,
        now: _now,
      },
      orderBy: [{path: 'now', direction: 'DESC'},{path: 'account_addr', direction: 'DESC'},{path: 'lt', direction: 'DESC'}],
      limit: 50
    };
  }

  /**
   * Variables for blocks
   * @param params Filter params
   */
  public getVariablesForAccounts(params: SimpleDataFilter, codeHash: string | number = null): object {
    params = params ? params : new SimpleDataFilter({});

    let _balance = params.min != null || params.max != null
      ? {
        ge: params.min != null ? this.baseFunctionsService.decimalToHex(params.min) : undefined,
        le: params.max != null ? this.baseFunctionsService.decimalToHex(params.max) : undefined
      }
      : undefined;

    let _workchain_id = params.chain != null
      ? { eq:  Number(params.chain) }
      : undefined;

    let _last_paid = params.fromDate != null || params.toDate != null
      ? {
        ge: params.fromDate != null ? Number(params.fromDate) : undefined,
        le: params.toDate != null ? Number(params.toDate) : undefined
      }
      : undefined;

    return {
      filter: {
        code_hash: codeHash != null ? { eq:  codeHash } : undefined,
        workchain_id: _workchain_id,
        balance: _balance,
        last_paid: _last_paid
      },
      orderBy: [{path: 'balance', direction: 'DESC'}],
      limit: 50
    };
  }

  /**
   * Get variables
   * @param node_id Id for query
   */
  public getVariablesForBlockSignatures(node_id: string | number): object {
    return {
      filter: {signatures: {any: {node_id: {eq: node_id}}}},
      orderBy: [{path: 'gen_utime', direction: 'DESC'}],
      limit: 50
    };
  }

  /**
   * Get variables
   * @param _ids Ids of Signatures Blocks
   */
  public getVariablesForFilterBlocks(_ids: Array<string>): object {
    return {filter: {id: {in: _ids}}};
  }
}
