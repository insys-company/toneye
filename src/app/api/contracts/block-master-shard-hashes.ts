import { BlockMasterShardHashesDescr } from '..';

export class BlockMasterShardHashes {
  descr: BlockMasterShardHashesDescr;
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
      descr: this.descr,
      shard: this.shard,
      workchain_id: this.workchain_id,
      __typename: this.__typename,
    };
  }
}
