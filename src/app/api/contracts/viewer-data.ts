export class ViewerData {
  title: string;
  value: string;
  link?: string;
  dinamic?: boolean;
  isHeader: boolean; // header
  isNumber?: boolean; // for number pipe
  isPercent?: boolean; // for percent
  isDate?: boolean; // for date pipe
  isTime?: boolean; // for time pipe
  iconClass?: string; // for icon

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
      title: this.title,
      value: this.value,
      link: this.link,
      dinamic: this.dinamic,
      isNumber: this.isNumber,
      isPercent: this.isPercent,
      isDate: this.isDate,
      isTime: this.isTime,
      iconClass: this.iconClass,
    };
  }
}
