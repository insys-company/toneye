import { Transaction } from '..';

export class AccountBlock {
  account_addr: boolean;
  new_hash: boolean;
  old_hash: boolean;
  tr_count: number;
  transactions: Array<Transaction>;
  __typename: string;

  constructor(data?: any) {
    if (data) {
      for (const i in data) {
        if (data.hasOwnProperty(i)) {
          this[i] = data[i];
        }
      }
    }
  }

  serialize() {
    return {
      account_addr: this.account_addr,
      new_hash: this.new_hash,
      old_hash: this.old_hash,
      tr_count: this.tr_count,
      transactions: this.transactions,
      __typename: this.__typename
    };
  }
}