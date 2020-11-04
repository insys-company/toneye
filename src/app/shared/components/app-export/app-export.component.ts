import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { SimpleDataFilter, Block, Message, Transaction, Account } from 'src/app/api';
import { MatDialogRef } from '@angular/material/dialog';
import { ExportDialogService } from './app-export.service';
import { LocaleText } from 'src/locale/locale';
import { smoothDialogElementAnimation } from 'src/app/app-animations';
import { appRouteMap } from 'src/app/app-route-map';
import { BlockQueries, MessageQueries, TransactionQueries, AccountQueries } from 'src/app/api/queries';
import { takeUntil } from 'rxjs/operators';
import _ from 'underscore';

const TRANSACTION_CSV_HEADER = 'id,now,tr_type,block_id,account_addr,balance_delta,total_fees,lt,aborted,status,orig_status,end_status,compute / gas_limit,compute / gas_used,compute / gas_fees,compute / \n';
// const MESSAGE_CSV_HEADER = 'id,value,src,dst,created_at,msg_type,status,created_lt,ihr_fee,fwd_fee,bounce,bounced,__typename,parent_tr,child_tr \n';
const MESSAGE_CSV_HEADER = 'id,value,src,dst,created_at,msg_type,created_lt,ihr_fee,fwd_fee,bounce,bounced,__typename \n';
const BLOCK_CSV_HEADER = 'id,seq_no,workchain_id,shard,gen_utime,tr_count,status,global_id,want_split,after_merge,gen_catchain_seqno,prev_ref / end_lt,prev_ref / seq_no,prev_ref / root_hash,prev_ref / \n';
// const ACCOUNT_CSV_HEADER = 'id,balance,last_paid,acc_type,last_trans_lt,code_hash,data_hash,__typename,creator,name \n';
const ACCOUNT_CSV_HEADER = 'id,balance,last_paid,acc_type,last_trans_lt,code_hash,data_hash,__typename \n';
const VALIDATOR_CSV_HEADER = 'public_key,adnl_addr,weight,__typename \n';
const SMART_CONTRACT_CSV_HEADER = 'name,code_hash,totalBalances,contractsCount / total,contractsCount / active,contractsCount / recent,id,avatar \n';
const SIG_BLOCK_CSV_HEADER = 'msg_type,msg_type_name,in_msg / msg_id,in_msg / next_addr,in_msg / cur_addr,in_msg / fwd_fee_remaining,in_msg / __typename,fwd_fee,transaction_id,__typename \n';
@Component({
  selector: 'app-export',
  templateUrl: './app-export.component.html',
  styleUrls: ['./app-export.component.scss'],
  animations: [ smoothDialogElementAnimation ],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportDialogomponent implements OnInit, OnDestroy {
  /**
   * Для отписок на запросы
   */
  private unsubscribe: Subject<void>;

  /**
   * Для отписок на запросы
   */
  private serviceUnsubscribe: Subject<void>;

  /**
   * Array of links
   */
  private links: Array<string> = [
    appRouteMap.blocks,
    appRouteMap.transactions,
    appRouteMap.messages,
    appRouteMap.accounts,
    appRouteMap.contracts,
    appRouteMap.validators
  ];

  /**
   * Листы
   */
  private dataFromServer: any[];

  /** Общие тексты для страниц */
  public locale = {
    title: LocaleText.export,
    cancel: LocaleText.cancel,
    enough: LocaleText.enough,
    exported: LocaleText.exported,
    rows: LocaleText.rows,
    inputPlaceholder: LocaleText.exportPlaceholder,
    // abort: LocaleText.abortFilterPlaceholder,
    // direstion: LocaleText.directionFilterPlaceholder,
    // clearAll: LocaleText.clearAll
  };

  /**
   * Параметры фильтра
   */
  params: SimpleDataFilter;
  /**
   * Листы
   */
  data: any[];
  /**
   * Id of parent
   */
  parentId: string | number;
  /**
   * Id of account
   */
  accId: string;
  /**
   * Id of direction
   */
  // dirId: string | number;
  /**
   * Лист
   */
  listName: string;
  /**
   * Количество
   */
  total: string;
  /**
   * Загруженное количество
   */
  loadCount: string = '0';
  /**
   * Блокировка
   */
  disabled: boolean;

  /**
   * csv
   */
  csvContent: string;

  /**
   * Показать поле
   */
  isShowCountFiled: boolean;

  /**
   * Single request for messages by params
   */
  public get isSingleQuery(): boolean {
    return !this.params || (this.params.chain == null && this.params.ext_int != 'ext') ? true : false
  }

  /**
   * Single request for messages by params
   */
  public get isSingleQueryForAccount(): boolean {
    return this.params && this.params.msg_direction != null ? true : false
  }


  constructor(
    private dialogRef: MatDialogRef<ExportDialogomponent>,
    private service: ExportDialogService,
    private blockQueries: BlockQueries,
    private messageQueries: MessageQueries,
    private transactionQueries: TransactionQueries,
    private accountQueries: AccountQueries,
  ) {
    /** Для отписок */
    this.unsubscribe = new Subject<void>();
    this.serviceUnsubscribe = new Subject<void>();

    /** Блокировка полей */
    this.disabled = false;

    // Листы
    this.data = [];
    this.isShowCountFiled = true;
  }

  /** Инпут */
  @ViewChild('countInput', { static: false }) countInput?: ElementRef;

  /**
   * Отписываться не нужно, умирает с компонентом
   * Слушает нажатие esc и закрывает окно
   * @param {KeyboardEvent} event Событие
   *
   * @returns {void}
   */
  @HostListener('document:keyup.escape', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  /**
   * Инициализация компонента
   */
  public ngOnInit(): void {
    this.service.response
      .pipe(takeUntil(this.serviceUnsubscribe))
      .subscribe((response: boolean) => {

        if (response) { this.getData(); }

      });
  }

  /**
   * Уничтожение компонента
   */
  public ngOnDestroy(): void {
    /** Если запрос в процессе, а мы закрываем окно, то отписка */
    this.ngUnsubscribe();
    this.ngServiceUnsubscribe();
    this.links = null;
    this.locale = null;
    this.data = null;
    this.disabled = null;
    this.params = null;
    this.listName = null;
    this.total = null;
    this.csvContent = null;
    this.parentId = null;
    this.accId = null;
    // this.dirId = null;
  }

  /**
   * Отписка от запроса
   */
  public ngUnsubscribe(): void {
    if (this.unsubscribe) {
      this.unsubscribe.next();
      this.unsubscribe.complete();
      this.unsubscribe = null;
    }
  }

  /**
   * Отписка от запроса
   */
  public ngServiceUnsubscribe(): void {
    if (this.serviceUnsubscribe) {
      this.serviceUnsubscribe.next();
      this.serviceUnsubscribe.complete();
      this.serviceUnsubscribe = null;
    }
  }

  /**
   * Закрытие
   */
  public onCancel(): void {
    this.disabled = true;
    this.ngUnsubscribe();
    this.ngServiceUnsubscribe();
    this.dialogRef.close();
  }

  /**
   * Экспорт
   */
  public onExport(): void {

    if (this.disabled) { return; }

    this.isShowCountFiled = false;
    this.unsubscribe.next();
    this.unsubscribe.complete();

    this.service.response.next(true);
  }

  /**
   * Прерывание
   */
  public onEnough(): void {
    if (this.disabled) { return; }

    this.disabled = true;
    this.ngUnsubscribe();
    this.ngServiceUnsubscribe();

    this.data = this.data ? this.data : [];

    this.loadCount = this.data.length + '';

    this.loadCount === 0 + ''
      ? this.onCancel()
      : this.createFileAndDownload();
  }

  /**
   * Метод некой валидации, исправляет значение на валидное и недает пользователю ошибиться
   * @param count Введенное число
   */
  public numberValidator(count: string): void {
    if (count !== '' && count != null) {

      const val = Number(count);

      if (!(val >= 0)) {

        count = '0';

        this.total = count;

        if (this.countInput) {
          this.countInput.nativeElement.value = count;
        }

      }

    }
  }

  /**
   * Get data
   */
  private getData(): void {

    if (this.data.length === Number(this.total) && this.data.length != 1) { return; }

    if (this.listName === appRouteMap.blocks) {
      this.getBlocks();
    }
    else if (this.listName === appRouteMap.transactions) {
      this.getTransactions();
    }
    else if (this.listName === appRouteMap.messages) {
      this.accId ? this.getMessagesForAccount() : this.getMessages();
    }
    else if (this.listName === appRouteMap.accounts) {
      this.getAccounts();
    }
    else if (this.listName === appRouteMap.blocksSignatures) {
      this.getSignaturesBlocks();
    }
  }

  /**
   * Create and download
   */
  private createFileAndDownload(): void {
    if (!this.data || !this.data.length) { return; }

    this.csvContent = '';

    if (this.listName === appRouteMap.blocks || this.listName === appRouteMap.blocksSignatures) {
      this.csvContent = BLOCK_CSV_HEADER;
    }
    else if (this.listName === appRouteMap.transactions) {
      this.csvContent = TRANSACTION_CSV_HEADER;
    }
    else if (this.listName === appRouteMap.messages) {
      this.csvContent = MESSAGE_CSV_HEADER;
    }
    else if (this.listName === appRouteMap.accounts) {
      this.csvContent = ACCOUNT_CSV_HEADER;
    }

    let dataString = '';

    this.data.forEach((item: any, i: number) => {
      if (this.listName === appRouteMap.blocks) {
        dataString = this.getStringForBlock(item);
      }
      else if (this.listName === appRouteMap.transactions) {
        dataString = this.getStringForTransaction(item);
      }
      else if (this.listName === appRouteMap.messages) {
        dataString = this.getStringForMessage(item);
      }
      else if (this.listName === appRouteMap.accounts) {
        dataString = this.getStringForAccount(item);
      }
      else if (this.listName === appRouteMap.blocksSignatures) {
        dataString = this.getStringForSignaturesBlocks(item);
      }

      this.csvContent += i < this.data.length ? dataString + '\n' : dataString;
    });
 
    this.onDownload(this.listName, this.csvContent);
  }

  /**
   * Get string for csv file
   */
  private getStringForBlock(item: Block): string {
    return `${item.id},${item.seq_no},${item.workchain_id},`
      + `"${item.shard}",${item.gen_utime},${item.tr_count},`
      +`${item.status ? item.status : 0},${item.global_id ? item.global_id : 0},`
      +`${item.want_split ? 'TRUE' : 'FALSE'},`
      +`${item.after_merge ? 'TRUE' : 'FALSE'},`
      +`${item.gen_catchain_seqno ? item.gen_catchain_seqno : 0}`
      + (item.prev_ref ? ',prev_ref' : '')
      + (item.prev_ref ? ` / "${item.prev_ref.end_lt ? parseInt(item.prev_ref.end_lt, 16) : 0}"` : '')
      + (item.prev_ref ? ` / "${item.prev_ref.seq_no ? item.prev_ref.seq_no : 0}"` : '')
      + (item.prev_ref ? ` / "${item.prev_ref.root_hash ? item.prev_ref.root_hash : 0}"` : '');
  }

  /**
   * Get string for csv file
   */
  private getStringForMessage(item: Message): string {
    return `${item.id},"${item.value ? parseInt(item.value, 16) : 0}","${item.src ? item.src : 0}",`
      + `"${item.dst ? item.dst : 0}",${item.created_at},${item.msg_type ? item.msg_type : 0},`
      +`"${item.created_lt ? parseInt(item.created_lt, 16) : 0}","${item.ihr_fee ? parseInt(item.ihr_fee, 16) : 0}",`
      +`${item.fwd_fee ? parseInt(item.fwd_fee, 16) : 0},`
      +`${item.bounce ? 'TRUE' : 'FALSE'},`
      +`${item.bounced ? 'TRUE' : 'FALSE'},`
      +`${item.__typename}`;
  }

  /**
   * Get string for csv file
   */
  private getStringForTransaction(item: Transaction): string {
    return `${item.id},${item.now},${item.tr_type},`
      + `"${item.block_id}","${item.account_addr}","${item.balance_delta}",`
      +`"${item.total_fees ? item.total_fees : 0}","${item.lt ? parseInt(item.lt, 16) : 0}",`
      +`${item.aborted ? 'TRUE' : 'FALSE'},`
      +`${item.status ? item.status : 0},`
      +`${item.orig_status ? item.orig_status : 0},`
      +`${item.end_status ? item.end_status : 0}`
      + (item.compute ? ',compute' : '')
      + (item.compute ? ` / "${item.compute.gas_limit ? item.compute.gas_limit : 0}"` : '')
      + (item.compute ? ` / "${item.compute.gas_used ? item.compute.gas_used : 0}"` : '')
      + (item.compute ? ` / "${item.compute.gas_fees ? item.compute.gas_fees : 0}"` : '');
  }

  /**
   * Get string for csv file
   */
  private getStringForAccount(item: Account): string {
    return `${item.id},"${item.balance ? parseInt(item.balance, 16) : 0}",`
      +`${item.last_paid ? item.last_paid : 0},`
      + `${item.acc_type ? item.acc_type : 0},`
      +`"${item.last_trans_lt ? item.last_trans_lt : 0}","${item.code_hash ? item.code_hash : 0}",`
      +`"${item.data_hash ? item.data_hash : 0}",`
      +`"${item.__typename}"`;
  }

  /**
   * Get string for csv file
   */
  private getStringForSignaturesBlocks(item: Block): string {
    return `${item.id},${item.seq_no},${item.workchain_id},`
      + `"${item.shard}",${item.gen_utime},${item.tr_count},`
      +`${item.status ? item.status : 0},${item.global_id ? item.global_id : 0},`
      +`${item.want_split ? 'TRUE' : 'FALSE'},`
      +`${item.after_merge ? 'TRUE' : 'FALSE'},`
      +`${item.gen_catchain_seqno ? item.gen_catchain_seqno : 0}`
      + (item.prev_ref ? ',prev_ref' : '')
      + (item.prev_ref ? ` / "${item.prev_ref.end_lt ? parseInt(item.prev_ref.end_lt, 16) : 0}"` : '')
      + (item.prev_ref ? ` / "${item.prev_ref.seq_no ? item.prev_ref.seq_no : 0}"` : '')
      + (item.prev_ref ? ` / "${item.prev_ref.root_hash ? item.prev_ref.root_hash : 0}"` : '');
  }

  /**
   * Скачивание
   */
  private onDownload(fileName:string, csv: any): void {

    let csvContent = csv; //here we load our csv data 

    fileName = `${fileName}_${new Date().getDay()+1}-${new Date().getMonth()+1}-${new Date().getFullYear()}.csv`;

    let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    // проверка браузера
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      // для IE
      window.navigator.msSaveOrOpenBlob(blob, fileName);
    }
    else {
      // не для IE
      const a = document.createElement('a');
      if (a.download !== undefined) {
        const url = URL.createObjectURL(blob);
        a.setAttribute('href', url);
        a.setAttribute('download', fileName);
        a.style.visibility = 'hidden';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    }

    this.onCancel();
  }

  /**
   * Get list of
   */
  private getBlocks(): void {

    this.params.toDate = _.last(this.data, 1)[0].gen_utime;

    this.service.getData(
      this.service.getVariablesForBlocks(this.params),
      this.blockQueries.getListForExport,
      appRouteMap.blocks
    )
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((res: Block[]) => {

        this.processData(res ? res : []);

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Signatures Blocks for validator
   */
  private getSignaturesBlocks(): void {
    // Get signatures block list
    this.service.getData(
      this.service.getVariablesForBlockSignatures(this.parentId),
      this.blockQueries.getBlocksSignatures,
      appRouteMap.blocksSignatures
    )
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((sb: Block[]) => {

        sb = sb ? sb : [];

        let ids = [];

        sb.forEach((b: Block) => {
          ids.push(b.id);
        });

        // Get blocks with tr_count (filter by signatures blocks)
        this.service.getData(
          this.service.getVariablesForFilterBlocks(ids),
          this.blockQueries.getBlocks,
          appRouteMap.blocks
        )
          .pipe(takeUntil(this.unsubscribe))
          .subscribe((b: Block[]) => {

            b = b ? b : [];

            sb.forEach((block: Block) => {
              let _b = _.find(b, (item) => { return item.id === block.id});

              block.id = _b ? _b.id : '0';
              block.seq_no = _b ? _b.seq_no : 0;
              block.tr_count = _b ? _b.tr_count : 0;
              block.workchain_id = _b ? _b.workchain_id : 0;
              block.shard = _b ? _b.shard : '';

              block.gen_utime = _b ? _b.gen_utime : 0;
              block.status = _b ? _b.status : 0;
              block.global_id = _b ? _b.global_id : 0;
              block.want_split = _b.want_split;
              block.after_merge = _b.after_merge;
              block.gen_catchain_seqno = _b ? _b.gen_catchain_seqno : 0;
              block.prev_ref = _b ? _b.prev_ref : null;
            });

            this.processData(sb ? sb : []);

          }, (error: any) => {
            console.log(error);
          });

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Get list of
   */
  private getMessages(): void {

    this.params.toDate = _.last(this.data, 1)[0].created_at;

    // Одиночный вызов сообщений
    if (this.isSingleQuery) {

      this.service.getData(
        this.service.getVariablesForMessages(this.params),
        this.messageQueries.getMessages,
        appRouteMap.messages
      )
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((res: Block[]) => {
  
          this.processData(res ? res : []);
  
        }, (error: any) => {
          console.log(error);
        });
    }
    // Запросы на сообщения по источникам и получателям
    else {

      this.service.getData(
        this.service.getVariablesForMessages(this.params, true),
        this.messageQueries.getMessages,
        appRouteMap.messages
      )
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((srcData: Block[]) => {

          srcData = srcData ? srcData : [];
  
          this.service.getData(
            this.service.getVariablesForMessages(this.params, false),
            this.messageQueries.getMessages,
            appRouteMap.messages
          )
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((dstData: Block[]) => {

              dstData = dstData ? dstData : [];

              // Объединение двух массивов и сортировка
              let res = srcData.concat(dstData);

              res = (_.sortBy(res, 'created_at')).reverse();
      
              this.processData(res ? res : []);

            }, (error: any) => {
              console.log(error);
            });
  
        }, (error: any) => {
          console.log(error);
        });

    }

  }

  /**
   * Get list of
   */
  private getMessagesForAccount(): void {

    this.params.toDate = _.last(this.data, 1)[0].created_at;

    // Одиночный вызов сообщений
    if (this.isSingleQueryForAccount) {

      this.service.getData(
        this.service.getVariablesForMessagesForAccount(this.params, this.accId),
        this.messageQueries.getMessages,
        appRouteMap.messages
      )
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((res: Block[]) => {
  
          this.processData(res ? res : []);
  
        }, (error: any) => {
          console.log(error);
        });
    }
    // Запросы на сообщения по источникам и получателям
    else {

      this.service.getData(
        this.service.getVariablesForMessagesForAccount(this.params, this.accId, true),
        this.messageQueries.getMessages,
        appRouteMap.messages
      )
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((srcData: Block[]) => {

          srcData = srcData ? srcData : [];
  
          this.service.getData(
            this.service.getVariablesForMessagesForAccount(this.params, this.accId, false),
            this.messageQueries.getMessages,
            appRouteMap.messages
          )
            .pipe(takeUntil(this.unsubscribe))
            .subscribe((dstData: Block[]) => {

              dstData = dstData ? dstData : [];

              // Объединение двух массивов и сортировка
              let res = srcData.concat(dstData);

              res = (_.sortBy(res, 'created_at')).reverse();
      
              this.processData(res ? res : []);

            }, (error: any) => {
              console.log(error);
            });
  
        }, (error: any) => {
          console.log(error);
        });


    }

  }

  /**
   * Get list of
   */
  private getTransactions(): void {

    this.params.toDate = _.last(this.data, 1)[0].now;

    this.service.getData(
      this.service.getVariablesForTransactions(this.params, this.parentId, this.accId),
      this.transactionQueries.getListForExport,
      appRouteMap.transactions
    )
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((res: Block[]) => {

        this.processData(res ? res : []);

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Get list of
   */
  private getAccounts(): void {

    this.params.max = parseInt(_.last(this.data, 1)[0].balance, 16) + '';

    this.service.getData(
      this.service.getVariablesForAccounts(this.params, this.parentId),
      this.accountQueries.getListForExport,
      appRouteMap.accounts
    )
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((res: Block[]) => {

        this.processData(res ? res : []);

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Set list
   * @param _data any
   */
  private processData(_data: any[]): void {

    if (this.data && this.data.length === 1) { this.data = []; }

    this.data = this.data ? this.data : [];
    this.data = this.data.concat(_data ? _data : []);

    if (this.data.length >= Number(this.total)) {
      this.data = this.data.slice(0, Number(this.total));
    }

    this.loadCount = this.data.length + '';

    ((this.data.length < Number(this.total)) && _data.length >= 50)
      ? this.service.response.next(true)
      : this.createFileAndDownload();

  }
}
