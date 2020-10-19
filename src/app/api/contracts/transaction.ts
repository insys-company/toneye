export class Transaction {
  account_addr: string;
  balance_delta: string;
  block_id: string;
  id: string;
  in_message: {};
  in_msg: string;
  now: number;
  tr_type: number;
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
      balance_delta: this.balance_delta,
      block_id: this.block_id,
      id: this.id,
      in_message: this.in_message,
      in_msg: this.in_msg,
      now: this.now,
      tr_type: this.tr_type,
      __typename: this.__typename,
    };
  }
}
