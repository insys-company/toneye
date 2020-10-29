import { ValidatorSetList } from '..';

export class ValidatorSet {
  utime_since: number;
  utime_since_string: string;
  utime_until: number;
  utime_until_string: string;
  total: number;
  total_weight: string;
  
  list: Array<ValidatorSetList>;
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
      utime_since: this.utime_since,
      utime_since_string: this.utime_since_string,
      utime_until: this.utime_until,
      utime_until_string: this.utime_until_string,
      total: this.total,
      total_weight: this.total_weight,
      list: this.list,
      __typename: this.__typename,
    };
  }
}
