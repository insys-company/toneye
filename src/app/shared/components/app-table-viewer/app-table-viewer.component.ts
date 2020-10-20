import { Component, OnChanges, OnInit, OnDestroy, Input, Output, ChangeDetectorRef, SimpleChange, ChangeDetectionStrategy, EventEmitter } from '@angular/core';
import { smoothDisplayAfterSkeletonAnimation } from 'src/app/app-animations';
import { TabViewerData } from 'src/app/api';
import { appRouteMap } from 'src/app/app-route-map';

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
  @Input() public tabsTitles: Array<string> = [ '1', '2'];
  /**
   * Header for block
   */
  @Input() public header: string = 'List';
  /**
   * For header button
   */
  @Input() public btnPlaceholder: string = 'Export to csv';
  /**
   * For header button (icon in btn)
   */
  @Input() public btnIcon: boolean = false;
  /**
   * For footer button
   */
  @Input() public footerPlaceholder: string = 'See all';

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

    return `See all ${this.selectedTabIndex == 0 ? appRouteMap.blocks : this.selectedTabIndex == 1 ? appRouteMap.transactions : appRouteMap.messages}`;
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
    this.data = null;
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
    this.exportEvent.next();
  }

  /**
   * See more event
   */
  public onSeeMore(): void {
    this.isTabsHeaderMode
      ? this.moreEvent.next(this.selectedTabIndex) // For redirect
        : this.moreEvent.next(null); // For reques
  }

  /**
   * Event of select
   * @param item Selected item from table
   */
  public onSelectItem(item: TabViewerData): void {
    this.selectItem.next(item);
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
   * Detect Changes for optimization
   */
  private detectChanges(): void {
    this.changeDetection.detectChanges();
  }
}
