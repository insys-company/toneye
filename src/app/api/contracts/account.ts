export class Account {
  acc_type: number;
  balance: string;
  balance_other: {}; //?
  boc: string;
  code: string;
  code_hash: string;
  data: string;
  data_hash: string;
  due_payment: string; //?
  id: string;
  last_paid: number;
  last_trans_lt: string;
  library: string; //?
  library_hash: string; //?
  proof: string; //?
  tick: string; //?
  tock: string; //?
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
      id: this.id,
      balance: this.balance,
      last_paid: this.last_paid,
      __typename: this.__typename
    };
  }
}