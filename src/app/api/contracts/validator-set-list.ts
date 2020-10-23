export class ValidatorSetList {
  adnl_addr: string;
  public_key: string;
  weight: string;
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
      adnl_addr: this.adnl_addr,
      public_key: this.public_key,
      weight: this.weight,
      __typename: this.__typename,
    };
  }
}
