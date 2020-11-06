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
import { Subject, timer } from 'rxjs';

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
  public messNewDataAfterUpdateForView: Array<TabViewerData>;
  /**
   * Array of ...
   * After update data
   */
  public messNewDataAfterUpdate: Message[];
  /**
   * Array of ...
   * After update data
   */
  public newDataAfterUpdate: Transaction[];

  /**
   * show load more in message table
   */
  public isMessFooterVisible: boolean;

  /**
   * init message list
   */
  public messInitComplete: boolean;

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
    this.isMessFooterVisible = true;
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
    this.messNewDataAfterUpdateForView = null;
    this.messNewDataAfterUpdate = null;
    this.isMessFooterVisible = null;
    this.messInitComplete = null;
  }

  /**
   * Export method
   */
  public onExport(): void {

    if (this.selectedTabIndex === 0 && !this.initComplete) { return; }

    if (this.selectedTabIndex === 1 && !this.messInitComplete) { return; }
    
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
    this.tableViewersLoading = true;
    this.detectChanges();

    let date: number;

    let _p = this.params ?  _.clone(this.params) : new SimpleDataFilter();

    _p.toDate = date + '';

    if (this.selectedTabIndex === 0) {
      date = this.transactions && this.transactions.length ? _.last(this.transactions).now : null;
      _p.toDate = date + '';

      this.service.getData(
        this.service.getVariablesForTransactions(_p, String(this.modelId), 25),
        this.transactionQueries.getTransactions
      )
        .pipe(takeUntil(this._unsubscribe))
        .subscribe((res: Transaction[]) => {

          res = res ? res : [];

          // hide load more btn
          if (!res.length || res.length < 25) {
            this.isFooterVisible = false;
          }

          this.transactions = _.union(this.transactions, res);
          this.transactions = _.uniq(this.transactions, 'id');
  
          this.tableViewerData = this._service.mapDataForTable(this.transactions, appRouteMap.transactions);
  
          this.tableViewersLoading = false;
          this.detectChanges();
  
        }, (error: any) => {
          console.log(error);
        });

    }
    else {
      date = this.messages && this.messages.length ? _.last(this.messages).created_at : null;
      _p.toDate = date + '';

      if (this.isSingleQuery) {

        // Get messages
        this.service.getData(
          this.service.getVariablesForMessages(this.params, String(this.modelId), null, 25),
          this.messageQueries.getMessages,
          appRouteMap.messages
        )
        .pipe(takeUntil(this._unsubscribe))
        .subscribe((m: Message[]) => {

          m = m ? m : [];

          // hide load more btn
          if (!m.length || m.length < 25) {
            this.isMessFooterVisible = false;
          }

          this.messages = _.union(this.messages, m);
          this.messages = _.uniq(this.messages, 'id');
  
          this.aditionalTableViewerData = this._service.mapDataForTable(this.messages, appRouteMap.messages);
  
          this.messTableViewersLoading = false;
          this.detectChanges();

        }, (error: any) => {
          console.log(error);
        });
  
      }
      else {
  
        this._service.getData(
          this.service.getVariablesForMessages(this.params, String(this.modelId), true, 25),
          this.messageQueries.getMessages,
          appRouteMap.messages
        )
          .pipe(takeUntil(this._unsubscribe))
          .subscribe((srcData: Message[]) => {
    
            srcData = srcData ? srcData : [];
  
            this._service.getData(
              this.service.getVariablesForMessages(this.params, String(this.modelId), false, 25),
              this.messageQueries.getMessages,
              appRouteMap.messages
            )
              .pipe(takeUntil(this._unsubscribe))
              .subscribe((dstData: Message[]) => {
  
                dstData = dstData ? dstData : [];
  
                // Объединение двух массивов и сортировка
                let res = srcData.concat(dstData);

                res = (_.sortBy(res, 'created_at')).reverse();

                res= res ? res : [];

                // hide load more btn
                if (!res.length || res.length < 25) {
                  this.isMessFooterVisible = false;
                }
      
                this.messages = _.union(this.messages, res);
                this.messages = _.uniq(this.messages, 'id');
        
                this.aditionalTableViewerData = this._service.mapDataForTable(this.messages, appRouteMap.messages);
        
                this.messTableViewersLoading = false;
                this.detectChanges();
        
              }, (error: any) => {
                console.log(error);
              });
    
          }, (error: any) => {
            console.log(error);
          });
  
      }
  
    }
  }

  /**
   * Show new data
   */
  public onShowNewData(): void {

    if (this.selectedTabIndex === 0) {
      this.tableViewersLoading = true;
      this.detectChanges();
  
      this.newDataAfterUpdate = this.newDataAfterUpdate ? this.newDataAfterUpdate : [];
      this.newDataAfterUpdateForView = this.newDataAfterUpdateForView ? this.newDataAfterUpdateForView : [];
  
      this.transactions = this.transactions ? this.transactions : [];
      this.tableViewerData = this.tableViewerData ? this.tableViewerData : [];
  
      this.transactions = _.clone(this.newDataAfterUpdate.concat(this.transactions));

      if (this.transactions.length > 25) {this.isFooterVisible = true;}

      this.transactions = _.first(this.transactions, 25);

      this.tableViewerData = _.first(_.clone(this.newDataAfterUpdateForView.concat(this.tableViewerData)), 25);
      
      this.newDataAfterUpdate = [];
      this.newDataAfterUpdateForView = [];
  
      this.tableViewersLoading = false;
      this.detectChanges();
    }
    else {
      this.messTableViewersLoading = true;
      this.detectChanges();
  
      this.messNewDataAfterUpdate = this.messNewDataAfterUpdate ? this.messNewDataAfterUpdate : [];
      this.messNewDataAfterUpdateForView = this.messNewDataAfterUpdateForView ? this.messNewDataAfterUpdateForView : [];
  
      this.messages = this.messages ? this.messages : [];
      this.aditionalTableViewerData = this.aditionalTableViewerData ? this.aditionalTableViewerData : [];
  
      this.messages = _.clone(this.messNewDataAfterUpdate.concat(this.messages));

      if (this.messages.length > 25) {this.isMessFooterVisible = true;}

      this.messages = _.first(this.messages, 25);
  
      this.aditionalTableViewerData = _.first(_.clone(this.messNewDataAfterUpdateForView.concat(this.aditionalTableViewerData)), 25);
      
      this.messNewDataAfterUpdate = [];
      this.messNewDataAfterUpdateForView = [];
  
      this.messTableViewersLoading = false;
      this.detectChanges();
    }

  }

  /**
   * Show new data
   */
  public onShowAllNewData(): void {

    this.tableViewersLoading = true;
    this.messTableViewersLoading = true;
    this.detectChanges();

    this.newDataAfterUpdate = this.newDataAfterUpdate ? this.newDataAfterUpdate : [];
    this.newDataAfterUpdateForView = this.newDataAfterUpdateForView ? this.newDataAfterUpdateForView : [];

    this.messNewDataAfterUpdate = this.messNewDataAfterUpdate ? this.messNewDataAfterUpdate : [];
    this.messNewDataAfterUpdateForView = this.messNewDataAfterUpdateForView ? this.messNewDataAfterUpdateForView : [];

    this.transactions = this.transactions ? this.transactions : [];
    this.tableViewerData = this.tableViewerData ? this.tableViewerData : [];

    this.messages = this.messages ? this.messages : [];
    this.aditionalTableViewerData = this.aditionalTableViewerData ? this.aditionalTableViewerData : [];

    this.transactions = _.clone(this.newDataAfterUpdate.concat(this.transactions));

    if (this.transactions.length > 25) {this.isFooterVisible = true;}

    this.transactions = _.first(this.transactions, 25);

    this.messages= _.clone(this.messNewDataAfterUpdate.concat(this.messages));

    if (this.messages.length > 25) {this.isMessFooterVisible = true;}

    this.messages = _.first(this.messages, 25);

    this.tableViewerData = _.first(_.clone(this.newDataAfterUpdateForView.concat(this.tableViewerData)), 25);

    this.aditionalTableViewerData = _.first(_.clone(this.messNewDataAfterUpdateForView.concat(this.aditionalTableViewerData)), 25);
    
    this.newDataAfterUpdate = [];
    this.newDataAfterUpdateForView = [];

    this.messNewDataAfterUpdate = [];
    this.messNewDataAfterUpdateForView = [];

    this.tableViewersLoading = false;
    this.messTableViewersLoading = false;
    this.detectChanges();

  }

  /**
   * Change autoupdate checkbox
   * @param check Flag
   */
  public updateChange(check: boolean) {
    this.autoupdate = check;

    this.updateUnsubscribe();

    if (!this.autoupdate) {
      this.onShowAllNewData();
    }
    else {
      this.subscribeOnUpdate();
    }

    this.detectChanges();
  }

  /**
   * Subscribe
   */
  protected subscribeData(): void {
    this.getTransactions();

    this.getMessages();
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

    if (!this.autoupdate) {
      this.tableViewersLoading = true;
      this.detectChanges();
    }

    // Get transactions
    this.service.getData(
      this.service.getVariablesForTransactions(this.params, String(this.modelId), (this.initComplete ? 25 : 50)),
      this.transactionQueries.getTransactions,
      appRouteMap.transactions
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Transaction[]) => {

        res = res ? res : [];

        if (!this.autoupdate) {

          this.newDataAfterUpdate = [];
          this.newDataAfterUpdateForView = []; 
          
          // hide load more btn
          if (!res.length || res.length <= 25) {
            this.isFooterVisible = false;
          }

          this.transactions = _.first(res, 25);
  
          this.tableViewerData = this._service.mapDataForTable(this.transactions, appRouteMap.transactions, 25);
  
          this.tableViewersLoading = false;

          this.filterLoading = false;

          this.initComplete = true;

          this.detectChanges();
        }
        else {
          this.newDataAfterUpdate = this.newDataAfterUpdate ? this.newDataAfterUpdate : [];
          this.newDataAfterUpdateForView = this.newDataAfterUpdateForView ? this.newDataAfterUpdateForView : [];

          let uniqItems = [];

          res.forEach((item: Transaction) => {
            let filterItem = _.findWhere(this.transactions, {id: item.id});
            let filterNewItem = _.findWhere(this.newDataAfterUpdate, {id: item.id});
            if (!filterItem && !filterNewItem) { uniqItems.push(item); }
          });

          if (uniqItems.length) {
            this.newDataAfterUpdate = _.clone(uniqItems.concat(this.newDataAfterUpdate));
            this.newDataAfterUpdateForView = this._service.mapDataForTable(this.newDataAfterUpdate, appRouteMap.transactions);
          }

          uniqItems = null;

          this.detectChanges();
        }

    }, (error: any) => {
      console.log(error);
    });
  }

  /**
   * Get messages
   */
  private getMessages(): void {

    if (!this.autoupdate) {
      this.messTableViewersLoading = true;
      this.detectChanges();
    }

    if (this.isSingleQuery) {

      // Get messages
      this.service.getData(
        this.service.getVariablesForMessages(this.params, String(this.modelId), null, (this.messInitComplete ? 25 : 50)),
        this.messageQueries.getMessages,
        appRouteMap.messages
      )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Message[]) => {

        res = res ? res : [];

        if (!this.autoupdate) {

          this.newDataAfterUpdate = [];
          this.newDataAfterUpdateForView = []; 
          
          // hide load more btn
          if (!res.length || res.length <= 25) {
            this.isMessFooterVisible = false;
          }

          this.messages = _.first(res, 25);
  
          this.aditionalTableViewerData = this._service.mapDataForTable(this.messages, appRouteMap.messages, 25);
  
          this.messTableViewersLoading = false;
  
          this.messFilterLoading = false;

          this.messInitComplete = true;

          this.detectChanges();
        }
        else {
          this.newDataAfterUpdate = this.newDataAfterUpdate ? this.newDataAfterUpdate : [];
          this.newDataAfterUpdateForView = this.newDataAfterUpdateForView ? this.newDataAfterUpdateForView : [];

          let uniqItems = [];

          res.forEach((item: Message) => {
            let filterItem = _.findWhere(this.messages, {id: item.id});
            let filterNewItem = _.findWhere(this.messNewDataAfterUpdate, {id: item.id});
            if (!filterItem && !filterNewItem) { uniqItems.push(item); }
          });

          if (uniqItems.length) {
            this.messNewDataAfterUpdate = _.clone(uniqItems.concat(this.messNewDataAfterUpdate));
            this.messNewDataAfterUpdateForView = this._service.mapDataForTable(this.messNewDataAfterUpdate, appRouteMap.messages);
          }

          uniqItems = null;

          this.detectChanges();
        }

      }, (error: any) => {
        console.log(error);
      });

    }
    else {

      this._service.getData(
        this.service.getVariablesForMessages(this.params, String(this.modelId), true, (this.messInitComplete ? 25 : 50)),
        this.messageQueries.getMessages,
        appRouteMap.messages
      )
        .pipe(takeUntil(this._unsubscribe))
        .subscribe((srcData: Message[]) => {
  
          srcData = srcData ? srcData : [];

          this._service.getData(
            this.service.getVariablesForMessages(this.params, String(this.modelId), false, (this.messInitComplete ? 25 : 50)),
            this.messageQueries.getMessages,
            appRouteMap.messages
          )
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((dstData: Message[]) => {

              dstData = dstData ? dstData : [];

              // Объединение двух массивов и сортировка
              let res = srcData.concat(dstData);

              res = (_.sortBy(res, 'created_at')).reverse();

              if (!this.autoupdate) {
      
                this.newDataAfterUpdate = [];
                this.newDataAfterUpdateForView = []; 
                
                // hide load more btn
                if (!res.length || res.length <= 25) {
                  this.isMessFooterVisible = false;
                }
      
                this.messages = _.first(res, 25);
        
                this.aditionalTableViewerData = this._service.mapDataForTable(this.messages, appRouteMap.messages, 25);
        
                this.messTableViewersLoading = false;
        
                this.messFilterLoading = false;
      
                this.messInitComplete = true;
      
                this.detectChanges();
              }
              else {
                this.newDataAfterUpdate = this.newDataAfterUpdate ? this.newDataAfterUpdate : [];
                this.newDataAfterUpdateForView = this.newDataAfterUpdateForView ? this.newDataAfterUpdateForView : [];
      
                let uniqItems = [];
      
                res.forEach((item: Message) => {
                  let filterItem = _.findWhere(this.messages, {id: item.id});
                  let filterNewItem = _.findWhere(this.messNewDataAfterUpdate, {id: item.id});
                  if (!filterItem && !filterNewItem) { uniqItems.push(item); }
                });
      
                if (uniqItems.length) {
                  this.messNewDataAfterUpdate = _.clone(uniqItems.concat(this.messNewDataAfterUpdate));
                  this.messNewDataAfterUpdateForView = this._service.mapDataForTable(this.messNewDataAfterUpdate, appRouteMap.messages);
                }

                uniqItems = null;
      
                this.detectChanges();
              }
      
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

  /**
   *  For update
   */
  protected subscribeOnUpdate(): void {
    this._updateUnsubscribe = new Subject<void>();
    /**Отправляем на сервер каждын 2 секунда запрос  */
    const _timer = timer(Infinity, 2000);

    _timer
      .pipe(takeUntil(this._updateUnsubscribe))
      .subscribe(() => {

        this.refreshData();
        // this.subscribeData();

      }, error => {
        this.updateUnsubscribe();
      });
  }
}
