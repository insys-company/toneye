import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { smoothDisplayAfterSkeletonAnimation } from 'src/app/app-animations';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { ContractDetailsService } from './contract-details.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { CommonQueries, AccountQueries } from 'src/app/api/queries';
import { Account, ItemList, SimpleDataFilter } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import { LocaleText } from 'src/locale/locale';
import { MatDialog } from '@angular/material/dialog';
import { ExportDialogomponent } from 'src/app/shared/components';
import _ from 'underscore';

@Component({
  selector: 'app-contract-details',
  templateUrl: './contract-details.component.html',
  styleUrls: ['./contract-details.component.scss'],
  animations: [ smoothDisplayAfterSkeletonAnimation ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractDetailsComponent extends BaseComponent<Account> implements OnInit, OnDestroy {
  /** Общие тексты для страниц */
  public locale = {
    title: LocaleText.contractPage,
    date: LocaleText.activeInPeriod,
    tons: LocaleText.tonCountFilterPlaceholder,
    loadMore: LocaleText.loadMore,
    autoupdate: LocaleText.autoupdate,
    moreDetails: LocaleText.moreDetails,
    accounts: LocaleText.accounts,
    surf: LocaleText.surf,
    total: LocaleText.totalBalances,
    codeHash: LocaleText.codeHash,
    contracts: LocaleText.contracts,
    deployed: LocaleText.deployed,
    active: LocaleText.activeInPeriod,
    new: LocaleText.newInPeriod,
  };

  /**
   * For skeleton animation
   */
  public skeletonArrayForGeneralViewer: Array<number> = new Array(3);
  /**
   * For skeleton animation
   */
  public skeletonArrayForFilter: Array<number> = new Array(3);
  /**
   * Account's balance
   */
  public totalBalance: number;
  /**
   * Deployed
   */
  public deployedContracts: number;
  /**
   * Active acc in period
   */
  public activeContracts: number;
  /**
   * New acc in period
   */
  public newContracts: number;

  /**
   * Account's name
   */
  public name: string;


  /**
   * Flag for filter open\hide
   */
  public isFilterOpen: boolean = true;

  /**
   * Flag for filter hide btn
   */
  public isFilterHideBtnVisible: boolean = false;

  /**
   * Flag for footer
   */
  public isFilterFooterVisible: boolean = false;

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected service: ContractDetailsService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected dialog: MatDialog,
    private commonQueries: CommonQueries,
    private accountQueries: AccountQueries,
  ) {
    super(
      changeDetection,
      service,
      route,
      router,
      dialog
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

        let contracts = this.service.baseFunctionsService.smartContracts();

        this.model = _.find(contracts.data, (item: Account) => { return item.id === this.modelId });

        this.initList();

      })
      .unsubscribe();
  }

  /**
   * Destruction of the component
   */
  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.totalBalance = null;
    this.deployedContracts = null;
    this.activeContracts = null;
    this.newContracts = null;
    this.isFilterOpen = null;
    this.isFilterHideBtnVisible = null;
    this.isFilterFooterVisible = null;
    this.name = null;
  }

  /**
   * Export method
   */
  public onExport(): void {

    if (!this.initComplete) { return; }

    const dialogRef = this.dialog.open(ExportDialogomponent, this.getCommonDialogOption());
    dialogRef.componentInstance.params = this.params ? _.clone(this.params) : new SimpleDataFilter();
    dialogRef.componentInstance.data = this.data.data ? _.first(this.data.data, 1) : [];
    dialogRef.componentInstance.parentId = this.modelId;
    dialogRef.componentInstance.listName = appRouteMap.accounts;
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

    _p.max = balance ? parseInt(balance, 16) + '' : null;

    this._service.getData(
      this.service.getVariablesForAggregateAccounts(_p, String(this.modelId), false, false, true, 25),
      this.accountQueries.getAccounts,
      appRouteMap.accounts
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

        this.tableViewerData = this._service.mapDataForTable(this.data.data, appRouteMap.accounts, null, this.totalBalance);

        this.tableViewersLoading = false;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });
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

    this.viewersLoading = true;
    this.tableViewersLoading = true;
    this.detectChanges();

    // get by balance
    this._service.getAggregateData(
      this.service.getVariablesForAggregateAccounts(this.params, String(this.modelId), true),
      this.commonQueries.getValidatorAggregateAccounts
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: any) => {

        this.totalBalance = res && res.aggregateAccounts[0] ? Number(res.aggregateAccounts[0]): 0;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });

    // Get by type
    this._service.getAggregateData(
      this.service.getVariablesForAggregateAccounts(this.params, String(this.modelId), false, true),
      this.commonQueries.getValidatorAggregateAccounts
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: any) => {

        this.deployedContracts = res && res.aggregateAccounts[0] ? Number(res.aggregateAccounts[0]): 0;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });

    // Get by hash only
    this._service.getAggregateData(
      this.service.getVariablesForAggregateAccounts(this.params, String(this.modelId)),
      this.commonQueries.getValidatorAggregateAccounts
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: any) => {

        this.activeContracts = res && res.aggregateAccounts[0] ? Number(res.aggregateAccounts[0]): 0;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });
  
    // Get message
    this._service.getAggregateData(
      this.service.getVariablesForAggregateMessages(this.params, String(this.modelId)),
      this.commonQueries.getAggregateMessages
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: any) => {

        this.newContracts = res && res.aggregateMessages[0] ? Number(res.aggregateMessages[0]): 0;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });

    /** Get accounts */
    this._service.getData(
      this.service.getVariablesForAggregateAccounts(this.params, String(this.modelId), false, false, true),
      this.accountQueries.getAccounts,
      appRouteMap.accounts
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
   * @param _data Account
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

    this.viewersLoading = false;

    this.detectChanges();

    this.tableViewerData =  this._service.mapDataForTable(this.data.data, appRouteMap.accounts, 25, this.totalBalance);
        
    this.detectChanges();

    this.tableViewersLoading = false;

    this.filterLoading = false;

    this.initComplete = true;

    this.detectChanges();
  }
}
