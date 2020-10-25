import { Injectable } from '@angular/core';
import { SimpleDataFilter, Message, TabViewerData, DataConfig, Block, Transaction, Validator, Account, ValidatorSetList, MsgData } from 'src/app/api';
import { appRouteMap } from 'src/app/app-route-map';

@Injectable({
  providedIn: 'root'
})
export class BaseFunctionsService {

  /**
   * Get account format for common table
   * @param _item Item For maping
   * @param totalBalance For percent
   */
  public mapAccountForTable(_item: Account, totalBalance: number): TabViewerData {
    if (!_item) { return null; }

    _item.balance = _item.balance && _item.balance.match('x')
      ? String(parseInt(_item.balance, 16))
      : _item.balance;

    return new TabViewerData({
      id: _item.id,
      url: appRouteMap.account,
      titleLeft: _item.id,
      subtitleLeft: new DataConfig({
        text: _item.last_paid == 0 ? '' : `${_item.last_paid}`,
        type: _item.last_paid == 0 ? 'string' : 'date'
      }),
      titleRight: new DataConfig({
        text: _item.balance,
        icon: true,
        iconClass: 'icon-gem',
        type: 'number'
      }),
      subtitleRight: new DataConfig({
        text: Number(((Number(_item.balance)/totalBalance)*100).toFixed(2)),
        type: 'percent'
      })
    });
  }

  /**
   * Get block format for common table
   * @param _item Item For maping
   */
  public mapBlockForTable(_item: Block): TabViewerData {
    if (!_item) { return null; }

    return new TabViewerData({
      id: _item.id,
      url: appRouteMap.block,
      titleLeft: _item.seq_no,
      subtitleLeft: new DataConfig({
        text: `${_item.workchain_id}:${_item.shard ? _item.shard.substring(0, 3) : _item.shard}`,
        type: 'string'
      }),
      titleRight: new DataConfig({
        text: (_item.tr_count ? _item.tr_count : ''),
        icon: true,
        iconClass: 'icon-transactions',
        type: 'number'
      }),
      subtitleRight: new DataConfig({
        text: _item.gen_utime,
        type: 'date'
      })
    });
  }

  /**
   * Get contract format for common table
   * @param _item Item For maping
   */
  public mapContractForTable(_item: Account): TabViewerData {
    if (!_item) { return null; }

    return new TabViewerData({
      // TODO
    });
  }

  /**
   * Get message format for common table
   * @param _item Item For maping
   */
  public mapMessageForTable(_item: Message): TabViewerData {
    if (!_item) { return null; }

    _item.value = _item.value && _item.value.match('x')
      ? String(parseInt(_item.value, 16))
      : _item.value;

    return new TabViewerData({
      id: _item.id,
      url: appRouteMap.message,
      titleLeft: _item.id,
      subtitleLeft: new DataConfig({
        text: `${(!_item.src || _item.src == '') ? 'ext' : _item.src.substring(0, 6)} -> ${(!_item.dst || _item.dst == '') ? 'ext' : _item.dst.substring(0, 6)}`,
        type: 'string'
      }),
      titleRight: new DataConfig({
        text: _item.value,
        icon: true,
        iconClass: 'icon-gem',
        type: 'number'
      }),
      subtitleRight: new DataConfig({
        text: _item.created_at,
        type: 'date'
      })
    });
  }

  /**
   * Get in_out message format for common table
   * @param _item Item For maping
   */
  public mapInOutMsgsForTable(_item: MsgData): TabViewerData {
    if (!_item) { return null; }

    return new TabViewerData({
      id: _item.in_msg.msg_id,
      url: appRouteMap.message,
      titleLeft: _item.in_msg.msg_id,
      titleRight: new DataConfig({text: _item.msg_type_name}),
    });
  }

  /**
   * Get transaction format for common table
   * @param _item Item For maping
   */
  public mapTransactionForTable(_item: Transaction): TabViewerData {
    if (!_item) { return null; }

    _item.balance_delta = _item.balance_delta && _item.balance_delta.match('x')
      ? String(parseInt(_item.balance_delta, 16))
      : _item.balance_delta;

    const tr_type = _item.tr_type == 3
      ? 'Tock'
      : _item.tr_type == 2
        ? 'Tick'
        : _item.balance_delta

    return new TabViewerData({
      id: _item.id,
      url: appRouteMap.transaction,
      titleLeft: _item.id,
      subtitleLeft: new DataConfig({
        text: _item.account_addr ? _item.account_addr.substring(0, 6) : '',
        type: 'string'
      }),
      titleRight: new DataConfig({
        text: tr_type,
        icon: (_item.balance_delta && _item.balance_delta != '0') ? true : false,
        iconClass: 'icon-gem',
        textColorClass: (_item.balance_delta && _item.balance_delta != '0') ? '' : 'color-gray',
        type: (_item.balance_delta && _item.balance_delta != '0') ? 'number' : 'string'
      }),
      subtitleRight: new DataConfig({
        text: _item.now,
        type: 'date'
      })
    });
  }

  /**
   * Get validator format for common table
   * @param _item Item For maping
   */
  public mapValidatorForTable(_item: ValidatorSetList, totalWeight: string): TabViewerData {
    if (!_item) { return null; }

    _item.weight = _item.weight && _item.weight.match('x')
      ? String(parseInt(_item.weight, 16))
      : _item.weight;

    totalWeight = totalWeight && totalWeight.match('x')
      ? String(parseInt(totalWeight, 16))
      : totalWeight;

    return new TabViewerData({
      id: _item.public_key,
      url: appRouteMap.validator,
      titleLeft: _item.public_key,
      subtitleLeft: new DataConfig({
        text: _item.adnl_addr ? `adnl: ${_item.adnl_addr}` : ''
      }),
      titleRight: new DataConfig({
        text: _item.weight,
        icon: _item.weight ? true : false,
        iconClass: 'icon-gem',
        type: _item.weight ? 'number' : 'string'
      }),
      subtitleRight: new DataConfig({
        text: Number(((Number(_item.weight)/Number(totalWeight))*100).toFixed(2)),
        type: 'percent'
      })
    });
  }

  /**
   * Получение параметров фильтра из queryParams
   * @param queryParams Параметры из url
   * @param filter Параметры для фильтра
   */
  public getFilterParams(queryParams: Object, filter: SimpleDataFilter): SimpleDataFilter {

    // Сбрасываем все параметры которые пришли null
    for (const key in filter) {
      if (!queryParams[key] && queryParams[key] !== 0) {

        delete filter[key];
      }
    }

    for (const key in queryParams) {
      if (queryParams.hasOwnProperty(key)) {
        filter[key] = queryParams[key];
      }
    }
    return filter;
  }

  /**
   * Метод проверяет наличие элементов в массиве - его содержание
   * @param array Массив для проверки
   */
  public checkArray(array: any[]): boolean {
    return (array && array.length) ? true : false;
  }

  /**
   * Метод проверяет строку
   * @param str Строка для проверки
   */
  public checkString(str: string): boolean {
    return (str && str.length) ? true : false;
  }
}
