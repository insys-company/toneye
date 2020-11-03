import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { smoothDisplayAfterSkeletonAnimation } from 'src/app/app-animations';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { AccountDetailsService } from './account-details.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MessageQueries, TransactionQueries } from 'src/app/api/queries';
import { Account, Message, ViewerData, Transaction, FilterSettings, TabViewerData, SimpleDataFilter } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import _ from 'underscore';
import { LocaleText } from 'src/locale/locale';
import { MatDialog } from '@angular/material/dialog';
import { ExportDialogomponent } from 'src/app/shared/components';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],
  animations: [ smoothDisplayAfterSkeletonAnimation ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountDetailsComponent extends BaseComponent<Account> implements OnInit, OnDestroy {

  /** Общие тексты для страниц */
  public locale = {
    title: LocaleText.accountPage,
    date: LocaleText.timeFilterPlaceholder,
    tons: LocaleText.tonCountFilterPlaceholder,
    loadMore: LocaleText.loadMore,
    autoupdate: LocaleText.autoupdate,
    moreDetails: LocaleText.moreDetails,
    general: LocaleText.general,
    address: LocaleText.addressHex,
    status: LocaleText.status,
    balance: LocaleText.balance,
    transactions: LocaleText.transactions,
    messages: LocaleText.messages,
  };

  /**
   * For skeleton animation
   */
  public skeletonArrayForFilter: Array<number> = new Array(3);
  /**
   * For skeleton animation
   */
  public messSkeletonArrayForFilter: Array<number> = new Array(5);
  /**
   * Account's transactions
   */
  public transactions: Array<Transaction>;
  /**
   * Account's in_msg_descr
   */
  public messages: Array<Message>;

  /**
   * Filter settings
   */
  public messFilterSettings: FilterSettings = new FilterSettings({
    filterChain: true,
    filterExtInt: true,
    filterByShard: false,
    filterByTime: false,
    filterByAbort: false,
    filterByMinMax: true,
    filterByDate: true,
    filterByDirection: true,
   });

  /**
   * Flag for filter
   */
  public messFilterLoading: boolean;
  /**
   * Flag for loading data of Tabs Viewer
   */
  public messTableViewersLoading: boolean;

  /**
   * Data for view
   */
  public messNewDataAfterUpdate: Array<TabViewerData>;

  /**
   * Single request for messages by params
   */
  public get isSingleQuery(): boolean {
    return this.params && this.params.msg_direction != null ? true : false
  }

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected service: AccountDetailsService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected dialog: MatDialog,
    private messageQueries: MessageQueries,
    private transactionQueries: TransactionQueries,
  ) {
    super(
      changeDetection,
      service,
      route,
      router,
      dialog
    );

    this.messFilterLoading = true;
    this.messTableViewersLoading = true;
  }

  /**
   * Initialization of the component
   * For details component
   */
  public initDatails(): void {
    this.route.params
      .pipe(takeUntil(this._routeUnsubscribe))
      .subscribe((params: Params) => {
        this.modelId = params['id'] != null ? params['id'].trim() : null;

        this._service.getModel(this.modelId)
          .pipe(takeUntil(this._unsubscribe))
          .subscribe((_model: Account[]) => {

            if (!_model[0]) {
              this.router.navigate([`/${this._service.parentPageName}`]);
              this._unsubscribe.next();
              this._unsubscribe.complete();
              return;
            }
  
            this.model = this._service.factoryFunc(_model[0]);

            this.model.balance = this.model.balance && this.model.balance.match('x') ? String(parseInt(this.model.balance, 16)) : this.model.balance;
            this.model.last_trans_lt = this.model.last_trans_lt && this.model.last_trans_lt.match('x') ? String(parseInt(this.model.last_trans_lt, 16)) : this.model.last_trans_lt;

            // Get aditional data
            this.initList();

          }, (error: any) => {
            console.log(error);
          });

      })
      .unsubscribe();
  }

  /**
   * Initialization of the component
   * For list component
   */
  public initList(): void {
    this.route.queryParams
      .pipe(takeUntil(this._routeUnsubscribe))
      .subscribe((queryParams: Params) => {

        this.params = _.clone(this._service.baseFunctionsService.getFilterParams(queryParams, this.params));

        this.detectChanges();

        if (this.initComplete) {
          this.refreshData();
        }

      });

    this.initMethod();
  }

  /**
   * Destruction of the component
   */
  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.messSkeletonArrayForFilter = null;
    this.transactions = null;
    this.messages = null;
    this.messFilterSettings = null;

    this.messFilterLoading = null;
    this.messTableViewersLoading = null;
    this.messNewDataAfterUpdate = null;
  }

  /**
   * Destruction of the component
   */
  public clearData(): void {
    this.viewersLoading = true;
    this.disabled = false;
    this.generalViewerData = [];
    this.aditionalViewerData = [];
    this.model = null;
    this.modelId =  null;
    this.transactions = [];
    this.messages = [];

    this.tableViewersLoading = true;
    this.messTableViewersLoading = true;
    this.tableViewerData = [];
    this.aditionalViewerData = [];

    this.detectChanges();
  }

  /**
   * Export method
   */
  public onExport(): void {
    const dialogRef = this.dialog.open(ExportDialogomponent, this.getCommonDialogOption());
    dialogRef.componentInstance.params = this.params ? _.clone(this.params) : new SimpleDataFilter();
    dialogRef.componentInstance.accId = this.modelId + '';
    if (this.selectedTabIndex === 0) {
   
      dialogRef.componentInstance.data = this.transactions ? _.first(this.transactions, 1) : [];
      dialogRef.componentInstance.listName = appRouteMap.transactions;
    }
    else if (this.selectedTabIndex === 1) {

      dialogRef.componentInstance.data = this.messages ? _.first(this.messages, 1) : [];
      dialogRef.componentInstance.listName = appRouteMap.messages;
    }

  }

  /**
   * Load more data
   * @param index Index of selected tab
   */
  public onLoadMore(index: number): void {
    // TODO
  }

  /**
   * Change autoupdate checkbox
   * @param check Flag
   */
  public updateChange(check: boolean) {
    this.autoupdate = check;

    // this.detectChanges();

    // if (this.autoupdate) {
    //   this.subscribeData();
    // }
    // else {
    //   this.autoupdateSubscribe = false;
    //   this._unsubscribe.next();
    //   this._unsubscribe.complete();
    // }
  }

  /**
   * Subscribe
   */
  protected subscribeData(): void {
    this.getTransactions();
  }

  /**
   * First intit
   */
  protected initMethod(): void {
    this.mapDataForViews(this.model);
    this.viewersLoading = false;

    this.detectChanges();

    this.getTransactions();

    this.getMessages();
  }

  /**
   * Получение данных
   */
  protected refreshData(): void {
    this.getData();
  }

  /**
   * Data for model from other queries
   */
  protected getData(): void {

    this.selectedTabIndex == 0
      ? this.getTransactions()
      : this.getMessages();

  }

  /**
   * Get transactions
   */
  private getTransactions(): void {

    // if (!this.autoupdate) {
    //   this.tableViewersLoading = true;
    //   this.detectChanges();
    // }

    // if (this.autoupdate && this.autoupdateSubscribe) {
    //   return;
    // }

    // if (this.autoupdate) {
    //   this.autoupdateSubscribe = true;
    // }

    // Get transactions
    this.service.getData(
      this.service.getVariablesForTransactions(this.params, String(this.modelId)),
      // (!this.autoupdate ? this.transactionQueries.getTransactions : this.transactionQueries.getTransactionsSub),
      this.transactionQueries.getTransactions,
      appRouteMap.transactions
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((t: Transaction[]) => {

        // if (!this.autoupdate) {
          this.transactions = t ? t : [];
          this.tableViewerData = this._service.mapDataForTable(this.transactions, appRouteMap.transactions);
          this.tableViewersLoading = false;
          this.filterLoading = false;
          this.initComplete = true;
          this.detectChanges();
        // }
        // else {
        //   this.newDataAfterUpdate = this.newDataAfterUpdate.concat(this._service.mapDataForTable(t ? t : [], appRouteMap.transactions));
        //   this.detectChanges();
        // }

    }, (error: any) => {
      console.log(error);
    });
  }

  /**
   * Get messages
   */
  private getMessages(): void {

    this.messTableViewersLoading = true;
    this.detectChanges();

    if (this.isSingleQuery) {

      // Get messages
      this.service.getData(
        this.service.getVariablesForMessages(this.params, String(this.modelId)),
        this.messageQueries.getMessages,
        appRouteMap.messages
      )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((m: Message[]) => {
        
        this.messages = m ? m : [];
        this.aditionalTableViewerData = this._service.mapDataForTable(this.messages, appRouteMap.messages);
        this.messTableViewersLoading = false;
        this.messFilterLoading = false;
        this.initComplete = true;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });

    }
    else {

      this._service.getData(
        this.service.getVariablesForMessages(this.params, String(this.modelId), true),
        this.messageQueries.getMessages,
        appRouteMap.messages
      )
        .pipe(takeUntil(this._unsubscribe))
        .subscribe((srcData: Message[]) => {
  
          srcData = srcData ? srcData : [];

          this._service.getData(
            this.service.getVariablesForMessages(this.params, String(this.modelId), false),
            this.messageQueries.getMessages,
            appRouteMap.messages
          )
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((dstData: Message[]) => {

              dstData = dstData ? dstData : [];

              // Объединение двух массивов и сортировка
              let _data = srcData.concat(dstData);

              _data = (_.sortBy(_data, 'created_at')).reverse();

              this.messages = _data ? _data : [];
              console.log(_data);
              this.aditionalTableViewerData = this._service.mapDataForTable(this.messages, appRouteMap.messages);
              this.messTableViewersLoading = false;
              this.messFilterLoading = false;
              this.initComplete = true;
              this.detectChanges();
      
            }, (error: any) => {
              console.log(error);
            });
  
        }, (error: any) => {
          console.log(error);
        });

    }

  }

  /**
   * Map for viewer
   * @param _model Model
   * @param _data Aditional data
   */
  protected mapDataForViews(_model: Account): void {
    // Details
    this.aditionalViewerData = [];
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.duePayment, value: _model.due_payment != null ? _model.due_payment : '--'}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.lastTransactionLt, value: Number(_model.last_trans_lt)}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.code, value: _model.code != null ? _model.code : '--'}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.codeHash, value: _model.code_hash != null ? _model.code_hash : '--'}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.data, value: _model.data != null ? _model.data : '--'}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.dataHash, value: _model.data_hash != null ? _model.data_hash : '--'}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.boc, value: _model.boc != null ? _model.boc : '--'}));
  }
}
