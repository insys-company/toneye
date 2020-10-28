import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { smoothDisplayAfterSkeletonAnimation } from 'src/app/app-animations';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { AccountDetailsService } from './account-details.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MessageQueries, TransactionQueries } from 'src/app/api/queries';
import { Account, Message, ViewerData, Transaction } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import _ from 'underscore';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],
  animations: [ smoothDisplayAfterSkeletonAnimation ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountDetailsComponent extends BaseComponent<Account> implements OnInit, OnDestroy {
  /**
   * For skeleton animation
   */
  public skeletonArrayForFilter: Array<number> = new Array(3);
  /**
   * Account's transactions
   */
  public transactions: Array<Transaction>;
  /**
   * Account's in_msg_descr
   */
  public messages: Array<Message>;

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
    private messageQueries: MessageQueries,
    private transactionQueries: TransactionQueries,
  ) {
    super(
      changeDetection,
      service,
      route,
      router,
    );
  }

  /**
   * Initialization of the component
   * For details component
   */
  public initDatails(): void {
    this.route.params
      .pipe(takeUntil(this._unsubscribe))
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
      .pipe(takeUntil(this._unsubscribe))
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
    this.transactions = null;
    this.messages = null;
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
    this.tableViewerData = [];

    this.detectChanges();
  }

  /**
   * Export event
   */
  public onExport(): void {
    // TODO
  }

  /**
   * Change tab
   * @param index Index of selected tab
   */
  public onChangeTab(index: number): void {

    if (index == this.selectedTabIndex) { return; }

    this.selectedTabIndex = index;
    this.tableViewersLoading = true;
    this.tableViewerData = [];
    this.detectChanges();

    this.tableViewerData = index == 0
      ? this._service.mapDataForTable(this.transactions, appRouteMap.transactions)
      : this._service.mapDataForTable(this.messages, appRouteMap.messages);

    this.tableViewersLoading = false;
    this.detectChanges();
  }

  /**
   * Load more data
   * @param index Index of selected tab
   */
  public onLoadMore(index: number): void {
    // TODO
  }

  /**
   * First intit
   */
  protected initMethod(): void {
    this.getFirstData();
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

    this.tableViewersLoading = true;
    this.detectChanges();


    if (this.selectedTabIndex == 0) {
      // Get transactions
      this.service.getData(
        this.service.getVariablesForTransactions(this.params, String(this.modelId)),
        this.transactionQueries.getTransactions,
        appRouteMap.transactions
      )
        .pipe(takeUntil(this._unsubscribe))
        .subscribe((t: Transaction[]) => {

          this.transactions = t ? t : [];
          this.tableViewerData = this._service.mapDataForTable(this.transactions, appRouteMap.transactions);
          this.tableViewersLoading = false;
          this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });
    }
    else if (this.selectedTabIndex == 1) {


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
          this.tableViewerData = this._service.mapDataForTable(this.messages, appRouteMap.messages);
          this.tableViewersLoading = false;
          this.detectChanges();

        }, (error: any) => {
          console.log(error);
        });

      }
      else {

        this._service.getData(
          this.service.getVariablesForMessages(this.params, String(this.modelId), true),
          this.messageQueries.getMessages
        )
          .pipe(takeUntil(this._unsubscribe))
          .subscribe((srcData: Message[]) => {
    
            srcData = srcData ? srcData : [];
  
            this._service.getData(
              this.service.getVariablesForMessages(this.params, String(this.modelId), false),
              this.messageQueries.getMessages
            )
              .pipe(takeUntil(this._unsubscribe))
              .subscribe((dstData: Message[]) => {
  
                dstData = dstData ? dstData : [];
  
                // Объединение двух массивов и сортировка
                let _data = srcData.concat(dstData);
  
                _data = (_.sortBy(_data, 'created_at')).reverse();

                this.messages = _data ? _data : [];
                this.tableViewerData = this._service.mapDataForTable(this.messages, appRouteMap.messages);
                this.tableViewersLoading = false;
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
   * Data for model from other queries
   */
  protected getFirstData(): void {

    this.mapDataForViews(this.model);
    this.viewersLoading = false;

    this.detectChanges();

    // Get transactions
    this.service.getData(
      this.service.getVariablesForTransactions(this.params, String(this.modelId)),
      this.transactionQueries.getTransactions,
      appRouteMap.transactions
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((t: Transaction[]) => {

        this.transactions = t ? t : [];

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

            this.tableViewerData = this.selectedTabIndex == 0
              ? this._service.mapDataForTable(this.transactions, appRouteMap.transactions)
              : this._service.mapDataForTable(this.messages, appRouteMap.messages);

            this.tableViewersLoading = false;
            this.filterLoading = false;
            this.initComplete = true;
            this.detectChanges();
  
          }, (error: any) => {
            console.log(error);
          });
  
        }
        else {
  
          this._service.getData(
            this.service.getVariablesForMessages(this.params, String(this.modelId), true),
            this.messageQueries.getMessages
          )
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((srcData: Message[]) => {
      
              srcData = srcData ? srcData : [];
    
              this._service.getData(
                this.service.getVariablesForMessages(this.params, String(this.modelId), false),
                this.messageQueries.getMessages
              )
                .pipe(takeUntil(this._unsubscribe))
                .subscribe((dstData: Message[]) => {
    
                  dstData = dstData ? dstData : [];
    
                  // Объединение двух массивов и сортировка
                  let _data = srcData.concat(dstData);
    
                  _data = (_.sortBy(_data, 'created_at')).reverse();
  
                  this.messages = _data ? _data : [];

                  this.tableViewerData = this.selectedTabIndex == 0
                    ? this._service.mapDataForTable(this.transactions, appRouteMap.transactions)
                    : this._service.mapDataForTable(this.messages, appRouteMap.messages);

                  this.tableViewersLoading = false;
                  this.filterLoading = false;
                  this.initComplete = true;
                  this.detectChanges();
          
                }, (error: any) => {
                  console.log(error);
                });
      
            }, (error: any) => {
              console.log(error);
            });
  
        }


    }, (error: any) => {
      console.log(error);
    });

  }

  /**
   * Map for viewer
   * @param _model Model
   * @param _data Aditional data
   */
  protected mapDataForViews(_model: Account): void {
    // Details
    this.aditionalViewerData = [];
    this.aditionalViewerData.push(new ViewerData({title: 'Due payment', value: _model.due_payment}));
    this.aditionalViewerData.push(new ViewerData({title: 'Last transaction lt', value: Number(_model.last_trans_lt), isDate: true}));
    this.aditionalViewerData.push(new ViewerData({title: 'Code', value: _model.code}));
    this.aditionalViewerData.push(new ViewerData({title: 'Code hash', value: _model.code_hash}));
    this.aditionalViewerData.push(new ViewerData({title: 'Data', value: _model.data ? _model.data : ''}));
    this.aditionalViewerData.push(new ViewerData({title: 'Data hash', value: _model.data_hash ? _model.data_hash : ''}));
    this.aditionalViewerData.push(new ViewerData({title: 'Boc', value: _model.boc}));
  }
}
