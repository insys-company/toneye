export class Transaction {
  account_addr: string;
  balance_delta: string;
  block_id: string;
  id: string;
  in_message: {};
  in_msg: string;
  now: number;
  tr_type: number;
  prev_trans_hash: string;
  lt: string;
  outmsg_cnt: number;
  orig_status: number;
  end_status: number;
  old_hash: string;
  new_hash: string;
  aborted: number;
  boc: string;
  storage: Storage
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

export class Storage {
  status_change: number;
  storage_fees_collected: string;
  storage_fees_due: string;
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
      status_change: this.status_change,
      storage_fees_collected: this.storage_fees_collected,
      storage_fees_due: this.storage_fees_due,
      __typename: this.__typename,
    };
  }
}
