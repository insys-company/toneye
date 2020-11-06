import { Injectable } from '@angular/core';
import { SimpleDataFilter, Message, TabViewerData, DataConfig, Block, Transaction, Validator, Account, ValidatorSetList, MsgData, ItemList } from 'src/app/api';
import { appRouteMap } from 'src/app/app-route-map';

@Injectable({
  providedIn: 'root'
})
export class BaseFunctionsService {

  /**
   * Get average time
   * @param _list Array of items
   */
  public getAverageTime(_list: any[], fieldName: string): number {
    if (!_list || !_list.length) { return 0; }

    let averageTime = 0;

    _list.forEach((item: any, i: number) => {
      if (_list[i+1]) {
        averageTime += item[fieldName] - _list[i+1][fieldName];
      }
    });

    averageTime = averageTime/_list.length;

    return Number(averageTime.toFixed(1));
  }

  /**
   * Get base16
   * @param num Number
   */
  public decimalToHex(num: number | string): string {
    num = num != null && num != '' ?  Number(num) : 0;

    var hex = (num*1000000000).toString(16);

    return `0x${hex}`;
  }

  /**
   * Method for ngFor optimization (Skeleton list)
   * @param index Item index in ngFor
   * @param item Item in ngFor
   */
  public identifySkeleton(index: number, item: number): number { return item; }

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

  /**
   * Smart Contracts Mocks
   */
  public smartContracts(): ItemList<Account> {
    return new ItemList<Account>({
      page: 0,
      pageSize: 25,
      total: 7,
      data: new Array<Account>(
        new Account({
          id: 'e2b60b6b602c10ced7ea8ede4bdf96342c97570a3798066f3fb50a4b2b27a208',
          code_hash: 'e2b60b6b602c10ced7ea8ede4bdf96342c97570a3798066f3fb50a4b2b27a208',
          name: 'SetcodeMultisig'
        }),
        new Account({
          id: '80d6c47c4a25543c9b397b71716f3fae1e2c5d247174c52e2c19bd896442b105',
          code_hash: '80d6c47c4a25543c9b397b71716f3fae1e2c5d247174c52e2c19bd896442b105',
          name: 'SafeMultisig'
        }),
        new Account({
          id: '207dc560c5956de1a2c1479356f8f3ee70a59767db2bf4788b1d61ad42cdad82',
          code_hash: '207dc560c5956de1a2c1479356f8f3ee70a59767db2bf4788b1d61ad42cdad82',
          name: 'Surf'
        }),
        new Account({
          id: '5daea8b855140d110ab07d430883bfecdd4cba9bcded8968fae7fa6cdb5adfbd',
          code_hash: '5daea8b855140d110ab07d430883bfecdd4cba9bcded8968fae7fa6cdb5adfbd',
          name: 'Contests'
        }),
        new Account({
          id: 'a572fb7ff94747da29e4b423b20a808c1342f7b491d20a2d47ebcc3eea8bc06c',
          code_hash: 'a572fb7ff94747da29e4b423b20a808c1342f7b491d20a2d47ebcc3eea8bc06c',
          name: 'Ludi Debot'
        }),
        new Account({
          id: '3afa6b0ac7fe37b73b5010e190d6853578c852c86428091ebd514f7e17b12415',
          code_hash: '3afa6b0ac7fe37b73b5010e190d6853578c852c86428091ebd514f7e17b12415',
          name: 'Contests'
        }),
        new Account({
          id: '35ce39cebd781b7d1f51cd620a615ef44c8020037fa13c758fd63d30341b29cc',
          code_hash: '35ce39cebd781b7d1f51cd620a615ef44c8020037fa13c758fd63d30341b29cc',
          name: 'Contests'
        })
      )
    });
  }
}
