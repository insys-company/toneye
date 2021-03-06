import { Component, OnChanges, OnInit, OnDestroy, Input, Output, ChangeDetectorRef, SimpleChange, ChangeDetectionStrategy, EventEmitter } from '@angular/core';
import { smoothDisplayAfterSkeletonAnimation } from 'src/app/app-animations';
import { TabViewerData } from 'src/app/api';
import { appRouteMap } from 'src/app/app-route-map';
import _ from 'underscore';
import { LocaleText } from 'src/locale/locale';

/**
 * This component displays table information on list pages.
 */
@Component({
  selector: 'app-table-viewer',
  templateUrl: './app-table-viewer.component.html',
  styleUrls: ['./app-table-viewer.component.scss'],
  animations: [ smoothDisplayAfterSkeletonAnimation ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppTableViewerComponent implements OnChanges, OnInit, OnDestroy {
  /**
   * Data for view
   */
  @Input() public data: TabViewerData[];
  /**
   * New Data for view
   */
  @Input() public newData: TabViewerData[];
  /**
   * Name of New Data
   */
  @Input() public newDataName: string = LocaleText.items;
  
  /**
   * For skeleton animation
   */
  @Input() public skeletonArray: Array<number> = new Array(5);
  /**
   * Flag for loading data
   */
  @Input() public skeletalAnimation: boolean = true;
  /**
   * Flag for header display
   */
  @Input() public isHeaderVisible: boolean = true;
  /**
   * Tabs header mode (several titles)
   */
  @Input() public isTabsHeaderMode: boolean = false;
  /**
   * For tabs header (titles)
   */
  @Input() public tabsTitles: Array<string> = [ 'List 1', 'List 2'];
  /**
   * Header for block
   */
  @Input() public header: string = LocaleText.list;
  /**
   * For header button
   */
  @Input() public btnPlaceholder: string = LocaleText.exportTo;
  /**
   * For header button (icon in btn)
   */
  @Input() public btnIcon: boolean = false;
  /**
   * For footer button
   */
  @Input() public isFooterVisible: boolean = true;
  /**
   * For footer button
   */
  @Input() public footerPlaceholder: string = LocaleText.seeAll;

  /**
   * Click export button
   */
  @Output() exportEvent: EventEmitter<void> = new EventEmitter<void>();
  /**
   * Click more button
   */
  @Output() moreEvent: EventEmitter<number> = new EventEmitter<number>(null);
  /**
   * Tab index change event
   */
  @Output() tabChange: EventEmitter<number> = new EventEmitter<number>(null);
  /**
   * Select item from tabs
   */
  @Output() selectItem: EventEmitter<any> = new EventEmitter<any>(null);
  /**
   * Click export button
   */
  @Output() showNewDataEvent: EventEmitter<void> = new EventEmitter<void>();

  /** Общие тексты для страниц */
  public locale = {
    list: LocaleText.list,
    notFound: LocaleText.notFound,
    show: LocaleText.show,
    new: LocaleText.new,
    lastTx: LocaleText.lastTx
  };

  /**
   * Tab index
   * (For styles and queries in parent component)
   */
  public selectedTabIndex: number = 0;
  /**
   * Getter for footer button
   * Change placeholder
   */
  public get footerBtnPlaceholder(): string {
    if (!this.isTabsHeaderMode) { return this.footerPlaceholder };

    return `${this.selectedTabIndex == 0 ? LocaleText.seeAllBlocks.toLocaleLowerCase() : this.selectedTabIndex == 1 ? LocaleText.seeAllTransactions.toLocaleLowerCase() : LocaleText.seeAllMessages.toLocaleLowerCase()}`;
  }

  constructor(
    private changeDetection: ChangeDetectorRef
  ) {
    /** Disable change detection for application optimization */
    this.changeDetection.detach();

  }

  /**
   * Change data and update
   * @param changes Input data from parent
   */
  ngOnChanges(changes: { [propertyName: string]: SimpleChange }): void {

    if (this.data) {

      if (this.data.length && this.data.length < 11) {
        this.skeletonArray = new Array(this.data.length);
      }
      else if (!this.data.length) {
        this.skeletonArray = new Array(5);
      }
      else if (this.data.length > 10) {
        this.skeletonArray = new Array(10);
      }

    }

    this.detectChanges();
  }

  /**
   * Initialization of the component
   */
  ngOnInit(): void {
    // this.detectChanges();
  }

  /**
   * Destruction of the component
   */
  ngOnDestroy(): void {
    this.locale = null;
    this.data = null;
    this.newData = null;
    this.newDataName = null;
    this.skeletonArray = null;
    this.skeletalAnimation = null;
    this.isHeaderVisible = null;
    this.isTabsHeaderMode = null;
    this.header = null;
    this.tabsTitles = null;
    this.btnPlaceholder = null;
    this.btnIcon = null;
    this.footerPlaceholder = null;
  }

  /**
   * Method for ngFor optimization (Skeleton list)
   * @param index Item index in ngFor
   * @param item Item in ngFor
   */
  identifySkeleton(index: number, item: number): number { return item; }

  /**
   * Method for ngFor optimization (Tabs list)
   * @param index Item index in ngFor
   * @param item Item in ngFor
   */
  identifyTabs(index: number, item: TabViewerData): string { return item.titleLeft; }

  /**
   * Method for ngFor optimization (Data list)
   * @param index Item index in ngFor
   * @param item Item in ngFor
   */
  identifyData(index: number, item: any): string { return item.value; }

  /**
   * Export event
   */
  public onExport(): void {
    if (!this.data || !this.data.length) { return; }

    this.exportEvent.next();
  }

  /**
   * See more event
   */
  public onLoadMore(): void {
    this.isTabsHeaderMode
      ? this.moreEvent.next(this.selectedTabIndex) // For redirect
        : this.moreEvent.next(null); // For reques
  }

  /**
   * Event of select
   * @param item Selected item from table
   */
  public onSelectItem(item: TabViewerData): void {
    if (item && item.url != null && item.id != null) {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
    // this.selectItem.next(item);
  }

  /**
   * Change tab event
   * @param index Index of selected tab
   */
  public onChangeTab(index: number): void {
    if (index == this.selectedTabIndex) { return; }

    this.selectedTabIndex = index;
    this.detectChanges();

    this.tabChange.next(this.selectedTabIndex);
  }

  /**
   * Show new data
   */
  public onShowNewData(): void {
    this.showNewDataEvent.next();
    // this.skeletalAnimation = true;

    // let _newData = _.clone(this.newData = this.newData ? this.newData : []);
    // this.newData = [];

    // this.detectChanges();

    // // Объединение двух массивов и сортировка
    // this.data = _.clone(_.first(_newData.concat(this.data), 10));

    // this.skeletalAnimation = false;

    // this.detectChanges();
  }

  /**
   * Get src from string
   * @param str String
   */
  public getSrc(str: string): string {
    if (!str || str.length === 0) { return ''; }

    return str.split('|')[0];
  }

  /**
   * Get dst from string
   * @param str String
   */
  public getDst(str: string): string {
    if (!str || str.length === 0) { return ''; }

    return str.split('|')[1];
  }

  /**
   * Detect Changes for optimization
   */
  private detectChanges(): void {
    this.changeDetection.detectChanges();
  }
}
