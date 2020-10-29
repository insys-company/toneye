import { InMsg } from '..';

export class MsgData {
  fwd_fee: string;
  ihr_fee: string; //?
  in_msg: InMsg;
  msg_id: string; //?
  msg_type: number;
  msg_type_name: string;
  out_msg: InMsg; //?
  proof_created: string; //?
  proof_delivered: string; //?
  transaction_id: string;
  transit_fee: string; //?
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
      fwd_fee: this.fwd_fee,
      ihr_fee: this.ihr_fee,
      in_msg: this.in_msg,
      msg_id: this.msg_id,
      msg_type: this.msg_type,
      msg_type_name: this.msg_type_name,
      out_msg: this.out_msg,
      proof_created: this.proof_created,
      proof_delivered: this.proof_delivered,
      transaction_id: this.transaction_id,
      transit_fee: this.transit_fee,
      __typename: this.__typename,
    };
  }
}
