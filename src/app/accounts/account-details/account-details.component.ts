import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Account, GeneralViewer, Transaction, TabViewerData, DataConfig, Message } from '../../api';
import { smoothDisplayAfterSkeletonAnimation } from 'src/app/app-animations';
import { AccountDetailsService } from './account-details.service';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { AppDetailsComponent } from 'src/app/shared/components/app-details/app-details.component';
import { appRouteMap } from 'src/app/app-route-map';
import _ from 'underscore';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],
  animations: [ smoothDisplayAfterSkeletonAnimation ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountDetailsComponent extends AppDetailsComponent<Account> implements OnInit, OnDestroy {
  /**
   * Account's transactions
   */
  public transactions: Array<Transaction>;
  /**
   * Account's in_msg_descr
   */
  public messages: Array<Message>;

  /**
   * Data for view
   */
  public tableViewerData: Array<TabViewerData>;
  /**
   * Flag for loading data of Tabs Viewer
   */
  public tableViewerLoading: boolean;

  /**
   * Tab index
   * (For styles and queries in parent component)
   */
  public selectedTabIndex: number = 0;
  /**
   * Flag for main info
   */
  public isGeneralInfoOpen: boolean = true;

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected service: AccountDetailsService,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {

    super(
      changeDetection,
      service,
      route,
      router,
    );

  }

  /**
   * Destruction of the component
   */
  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.transactions = null;
    this.messages = null;
    this.tableViewerData = null;
    this.tableViewerLoading = null;
    this.selectedTabIndex = null;
    this.isGeneralInfoOpen = null;
  }

  /**
   * Destruction of the component
   */
  clearData(): void {
    this.viewersLoading = true;
    this.disabled = false;
    this.generalViewerData = [];
    this.aditionalViewerData = [];
    this.model = null;
    this.modelId =  null;
    this.transactions = [];
    this.messages = [];

    this.tableViewerLoading = true;
    this.tableViewerData = [];

    this.detectChanges();
  }

  /**
   * Show/Hide info about TON
   */
  onShowOrHide(): void {
    this.isGeneralInfoOpen = !this.isGeneralInfoOpen;
    this.detectChanges();
  }

  /**
   * Export event
   */
  onExport(): void {
    // TODO
  }

  /**
   * Change tab
   * @param index Index of selected tab
   */
  onSeeMore(index: number): void {
    // TODO
  }

  /**
   * Change tab
   * @param index Index of selected tab
   */
  onChangeTab(index: number): void {

    if (index == this.selectedTabIndex) { return; }

    this.selectedTabIndex = index;
    this.detectChanges();

    this.tableViewerLoading = true;
    this.tableViewerData = [];
    this.detectChanges();

    this.tableViewerData = index == 0 ? this.mapTransactions(this.transactions) : this.mapMessages(this.messages);

    this.tableViewerLoading = false;
    this.detectChanges();

  }

  /**
   * Data for model from other queries
   */
  protected getData(): void {

    this.model.balance = this.model.balance && this.model.balance.match('x') ? String(parseInt(this.model.balance, 16)) : this.model.balance;
    this.model.last_trans_lt = this.model.last_trans_lt && this.model.last_trans_lt.match('x') ? String(parseInt(this.model.last_trans_lt, 16)) : this.model.last_trans_lt;

    this.service.getTransactions(this.modelId)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((t: Transaction[]) => {

        this.service.getMessages(this.modelId)
        .pipe(takeUntil(this._unsubscribe))
        .subscribe((m: Message[]) => {
  
          this.transactions = t ? t : [];
          this.messages = m ? m : [];
  
          this.mapData(this.model);
          this.viewersLoading = false;

          this.detectChanges();
  
          this.tableViewerData = this.selectedTabIndex == 0
            ? this.mapTransactions(this.transactions)
            : this.mapMessages(this.messages);
  
          this.tableViewerLoading = false;
  
          this.detectChanges();
  
        }, (error: any) => {
          console.log(error);
        });

    }, (error: any) => {
      console.log(error);
    });
  }

  /**
   * Map for viewer
   * @param _model Model
   * @param _data Aditional data
   */
  protected mapData(_model: Account): void {

    // Details
    this.aditionalViewerData = [];
    this.aditionalViewerData.push(new GeneralViewer({title: 'Due payment', value: _model.due_payment}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Last transaction lt', value: Number(_model.last_trans_lt), isDate: true}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Code', value: _model.code}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Code hash', value: _model.code_hash}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Data', value: _model.data ? _model.data : ''}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Data hash', value: _model.data_hash ? _model.data_hash : ''}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Boc', value: _model.boc}));

  }

  /**
   * Map transactions for table
   * @param _list Array of transactions
   */
  protected mapTransactions(_list: Transaction[]): TabViewerData[] {
    if (!_list || !_list.length) { return []; }

    let data = [];
    data = _list.map((t: Transaction, i: number) => {

      t.balance_delta = t.balance_delta && t.balance_delta.match('x') ? String(parseInt(t.balance_delta, 16)) : t.balance_delta;

      return new TabViewerData({
        id: t.id,
        url: appRouteMap.transaction,
        titleLeft: t.id,
        subtitleLeft: new DataConfig({
          text: t.account_addr ? t.account_addr.substring(0, 6) : '',
          type: 'string'
        }),
        titleRight: new DataConfig({
          text: t.tr_type == 3 ? 'Tock' : t.tr_type == 2 ? 'Tick' : t.balance_delta,
          icon: (t.balance_delta && t.balance_delta != '0') ? true : false,
          iconClass: 'icon-gem',
          textColorClass: (t.balance_delta && t.balance_delta != '0') ? '' : 'color-gray',
          type: (t.balance_delta && t.balance_delta != '0') ? 'number' : 'string'
        }),
        subtitleRight: new DataConfig({text: t.now, type: 'date'})
      });
    });

    data = _.clone(_.first(data, 10))

    return data;
  }

  /**
   * Map messages for table
   * @param _list Array of messages
   */
  private mapMessages(_list: Message[]): TabViewerData[] {
    if (!_list || !_list.length) { return []; }

    let data = [];
    data = _list.map((m: Message, i: number) => {

      m.value = m.value && m.value.match('x') ? String(parseInt(m.value, 16)) : m.value;

      return new TabViewerData({
        id: m.id,
        url: appRouteMap.message,
        titleLeft: m.id,
        subtitleLeft: new DataConfig({
          text: `${(!m.src || m.src == '') ? 'ext' : m.src.substring(0, 6)} -> ${(!m.dst || m.dst == '') ? 'ext' : m.dst.substring(0, 6)}`,
          type: 'string'
        }),
        titleRight: new DataConfig({text: m.value, icon: true, iconClass: 'icon-gem', type: 'number'}),
        subtitleRight: new DataConfig({text: m.created_at, type: 'date'})
      });
    });

    data = _.clone(_.first(data, 10))

    return data;
  }
}
