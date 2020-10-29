export class BlockMasterShardFees {
  create: string;
  fees: string;
  shard: string;
  workchain_id: number;
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
      create: this.create,
      fees: this.fees,
      shard: this.shard,
      workchain_id: this.workchain_id,
      __typename: this.__typename,
    };
  }
}
