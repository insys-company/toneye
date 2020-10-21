export class InMsg {
  id: string;
  block_id: string;
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
      block_id: this.block_id,
      __typename: this.__typename,
    };
  }
}
