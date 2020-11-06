import { Component, ChangeDetectionStrategy, OnInit, AfterViewChecked, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { AccountsService } from './accounts.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { CommonQueries, MessageQueries, AccountQueries } from 'src/app/api/queries';
import { ViewerData, TabViewerData, ItemList, Account, SimpleDataFilter } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import _ from 'underscore';
import { LocaleText } from 'src/locale/locale';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountsComponent extends BaseComponent<Account> implements OnInit, AfterViewChecked, OnDestroy {
  /**
   * Details or list
   */
  protected listMode: boolean = true;
  /**
   * For skeleton animation
   */
  public skeletonArrayForGeneralViewer: Array<number> = new Array(2);
  /**
   * For skeleton animation
   */
  public skeletonArrayForFilter: Array<number> = new Array(3);

  /** Общие тексты для страниц */
  public locale = {
    title: LocaleText.accountsPage,
    date: LocaleText.transactionDateFilterPlaceholder,
    tons: LocaleText.tonCountFilterPlaceholder,
    loadMore: LocaleText.loadMore,
    autoupdate: LocaleText.autoupdate,
  };

  /**
   * Balance
   */
  public totalBalance: number; 

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected _service: AccountsService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected dialog: MatDialog,
    private commonQueries: CommonQueries,
    private accountQueries: AccountQueries,
  ) {
    super(
      changeDetection,
      _service,
      route,
      router,
      dialog
    );
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

    this.totalBalance = null;
  }

  /**
   * Load more data
   * @param index Index of selected tab
   */
  public onLoadMore(index: number): void {
    this.tableViewersLoading = true;
    this.detectChanges();

    let balance = this.data && this.data.data ? _.last(this.data.data).balance : null;

    let _p = this.params ?  _.clone(this.params) : new SimpleDataFilter();

    _p.max = balance ? balance : null;

    this._service.getData(
      this._service.getVariablesForAccounts(_p, false, 25),
      this.accountQueries.getAccounts
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Account[]) => {

        res = res ? res : [];

        // hide load more btn
        if (!res.length || res.length < 25) {
          this.isFooterVisible = false;
        }

        this.data.data = _.union(this.data.data, res);
        this.data.data = _.uniq(this.data.data, 'id');
        this.data.total = this.data.data.length;

        this.tableViewerData = [];

        this.tableViewerData = this._service.mapDataForTable(this.data.data, appRouteMap.accounts, null);

        this.tableViewersLoading = false;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * First intit
   */
  protected initMethod(): void {
    this.getAggregateData();
  }

  /**
   * Получение данных
   */
  protected refreshData(): void {
    this.getAccounts();
  }

  /**
   * Get aggregate messages count
   */
  private getAggregateData(): void {
    this._service.getAggregateData(
      this._service.getVariablesForAggregateData(),
      this.commonQueries.getGeneralAccountData
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((generalData: any) => {

        this.generalViewerData = [];

        const getAccountsCount = new ViewerData({
          title: LocaleText.accounts,
          value: generalData && generalData.getAccountsCount ? generalData.getAccountsCount : 0,
          isNumber: true
        });

        const getAccountsTotalBalance = new ViewerData({
          title: LocaleText.coins,
          value: generalData && generalData.getAccountsTotalBalance ? generalData.getAccountsTotalBalance : 0,
          isNumber: true
        });

        this.totalBalance = Number(generalData.getAccountsTotalBalance);

        this.generalViewerData = [];

        this.generalViewerData.push(getAccountsCount);
        this.generalViewerData.push(getAccountsTotalBalance);

        this.viewersLoading = false;

        this.detectChanges();

        this.getAccounts();

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Get account list
   */
  private getAccounts(): void {

    this.tableViewersLoading = true;
    this.detectChanges();

    this._service.getData(
      this._service.getVariablesForAccounts(this.params),
      this.accountQueries.getAccounts
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Account[]) => {

        res = res ? res : [];

        this.processData(res);

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Get general data
   * @param _data Accounts
   */
  private processData(_data: Account[]): void {

    // hide load more btn
    if (!_data.length || _data.length <= 25) {
      this.isFooterVisible = false;
    }

    /** Accounts */
    this.data = new ItemList({
      data: _data ? _data : [],
      page: 0,
      pageSize: 25,
      total: _data ? _data.length : 0
    });

    this.data.data = _.first(this.data.data, 25);

    this.tableViewerData = this._service.mapDataForTable(this.data.data, appRouteMap.accounts, 25, this.totalBalance);

    this.tableViewersLoading = false;

    this.filterLoading = false;

    this.initComplete = true;

    this.detectChanges();
  }
}
