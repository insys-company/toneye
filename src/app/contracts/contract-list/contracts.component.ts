import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Account, ViewerData, TabViewerData, DataConfig, QueryOrderBy } from '../../api';
import { ContractsService } from './contracts.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'underscore';
import { appRouteMap } from 'src/app/app-route-map';

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractsComponent implements OnInit, OnDestroy {
  /**
   * Для отписок на запросы
   */
  public unsubscribe: Subject<void> = new Subject();
  /**
   * Data for view
   */
  public generalViewerData: Array<ViewerData>;
  /**
   * Data for view
   */
  public tableViewerData: Array<TabViewerData>;
  /**
   * For skeleton animation
   */
  public skeletonArray: Array<number> = new Array(2);
  /**
   * Flag for loading data of General Viewer
   */
  public generalViewerLoading: boolean;
  /**
   * Flag for loading data of Tabs Viewer
   */
  public tableViewerLoading: boolean;

  /** Array of ... */
  public data: Account[] = [];

  /**
   * Balance
   */
  public totalBalance: number; 

  constructor(
    private changeDetection: ChangeDetectorRef,
    private contractsService: ContractsService,
    private router: Router,
  ) {
    /** Disable change detection for application optimization */
    this.changeDetection.detach();

    /** Loading animation in children */
    this.generalViewerLoading = true;
    this.tableViewerLoading = true;
  }

  /**
   * Initialization of the component
   */
  ngOnInit(): void {
    this.detectChanges();
    // this.init();
  }

  /**
   * Destruction of the component
   */
  ngOnDestroy(): void {
    // TODO
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

    // this.tableViewerLoading = true;

    // this.detectChanges();

    let balance = this.data[this.data.length - 1].balance;

    balance = balance && balance.match('x') ? String(parseInt(balance, 16)) : balance;

    const _variables = {
      filter: {balance: {le: balance}},
      orderBy: [{path: 'balance', direction: 'DESC'}],
      limit: 25,
    }

    // Get accounts
    this.contractsService.getAccounts(_variables)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((res: Account[]) => {

        let newData = this.mapData(res);
        this.tableViewerData = _.clone(this.tableViewerData.concat(newData));
        // this.tableViewerLoading = false;

        this.detectChanges();

        // Scroll to bottom
        // window.scrollTo(0, document.body.scrollHeight);
      
      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Init method
   */
  private init(): void {

    this.contractsService.getGeneralData()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((generalData: any) => {

        const getAccountsCount = new ViewerData({
          title: 'Accounts',
          value: generalData.getAccountsCount ? generalData.getAccountsCount : 0,
          isNumber: true
        });

        const getAccountsTotalBalance = new ViewerData({
          title: 'Coins',
          value: generalData.getAccountsTotalBalance ? generalData.getAccountsTotalBalance : 0,
          isNumber: true
        });

        this.totalBalance = Number(generalData.getAccountsTotalBalance);

        this.generalViewerData = [];

        this.generalViewerData.push(getAccountsCount);
        this.generalViewerData.push(getAccountsTotalBalance);

        this.generalViewerLoading = false;

        this.detectChanges();


        // Get accounts
        this.contractsService.getAccounts()
          .pipe(takeUntil(this.unsubscribe))
          .subscribe((res: Account[]) => {

            this.data = res ? res : [];

            this.tableViewerData = this.mapData(this.data);

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
   * Map list for table
   * @param _list Array of account
   */
  private mapData(_list: Account[]): TabViewerData[] {
    if (!_list || !_list.length) { return []; }

    let data = [];
    data = _list.map((item: Account, i: number) => {

      item.balance = item.balance && item.balance.match('x') ? String(parseInt(item.balance, 16)) : item.balance;

      return new TabViewerData({
        id: item.id,
        url: appRouteMap.account,
        titleLeft: item.id,
        subtitleLeft: new DataConfig({
          text: item.last_paid == 0 ? '' : `${item.last_paid}`,
          type: item.last_paid == 0 ? 'string' : 'date'
        }),
        titleRight: new DataConfig({text: item.balance, icon: true, iconClass: 'icon-gem', type: 'number'}),
        subtitleRight: new DataConfig({text: Number(((Number(item.balance)/this.totalBalance)*100).toFixed(2)), type: 'percent'})
      });
    });

    data = _.clone(_.first(data, 10))

    return data;
  }

  /**
   * Detect Changes
   */
  private detectChanges(): void {
    this.changeDetection.detectChanges();
  }
}
