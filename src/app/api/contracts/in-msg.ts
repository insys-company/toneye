export class InMsg {
  id: string;
  block_id: string;

  cur_addr: string;
  fwd_fee_remaining: string;
  msg_id: string;
  next_addr: string;
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

      cur_addr: this.cur_addr,
      fwd_fee_remaining: this.fwd_fee_remaining,
      msg_id: this.msg_id,
      next_addr: this.next_addr,
      __typename: this.__typename,
    };
  }
}
