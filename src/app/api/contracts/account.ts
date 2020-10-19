export class Account {
  id: string;
  balance: string;
  last_paid: number;
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