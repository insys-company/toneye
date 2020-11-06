export type DataType = 'date' | 'time' | 'number' | 'string' | 'percent';

export class TabViewerData {
  id: string | number;
  url: string;
  titleLeft: string;
  subtitleLeft: DataConfig;
  titleRight: DataConfig;
  subtitleRight: DataConfig;

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
      titleLeft: this.titleLeft,
      subtitleLeft: this.subtitleLeft,
      titleRight: this.titleRight,
      subtitleRight: this.subtitleRight,
    };
  }
}

export class DataConfig {
  text: string;
  textColorClass: string;

  isIcon: boolean;
  iconClass?: string; // for icon

  isNumber?: boolean; // for number pipe
  isPercent?: boolean; // for percent
  isDate?: boolean; // for date pipe
  isTime?: boolean; // for time pipe
  isBoolean?: boolean; // for bool
  isFromTran?: boolean; // for messages
  isToTran?: boolean; // for messages
  fromTranClass: string;

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
      text: this.text,
      textColorClass: this.textColorClass,
      isIcon: this.isIcon,
      iconClass: this.iconClass,
      isNumber: this.isNumber,
      isPercent: this.isPercent,
      isDate: this.isDate,
      isTime: this.isTime,
      isBoolean: this.isBoolean,
      isFromTran: this.isFromTran,
      isToTran: this.isToTran,
      fromTranClass: this.fromTranClass,
    };
  }
}
