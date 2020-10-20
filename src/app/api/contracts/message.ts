export class Message {
  created_at: number;
  created_lt: string;
  dst: string;
  id: string;
  src: string;
  value: string;
  msg_type: number;
  ihr_fee: string;
  fwd_fee: string;
  bounce: boolean;
  bounced: boolean;
  boc: string;
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
      created_at: this.created_at,
      created_lt: this.created_lt,
      dst: this.dst,
      id: this.id,
      src: this.src,
      value: this.value,
      __typename: this.__typename,
    };
  }
}
