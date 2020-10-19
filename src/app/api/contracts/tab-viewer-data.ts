export type DataType = 'date' | 'time' | 'number' | 'string' | 'percent';

export class TabViewerData {
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
  icon: boolean;
  iconClass: string;
  textColorClass: string;
  type: DataType;

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
      icon: this.icon,
      iconClass: this.iconClass,
      type: this.type,
    };
  }
}
