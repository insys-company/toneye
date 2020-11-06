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

  isFromTran?: boolean; // for messages
  isToTran?: boolean; // for messages

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
      msg_type: this.msg_type,
      ihr_fee: this.ihr_fee,
      fwd_fee: this.fwd_fee,
      bounce: this.bounce,
      bounced: this.bounced,
      boc: this.boc,
      __typename: this.__typename,

      isFromTran: this.isFromTran,
      isToTran: this.isToTran
    };
  }
}
