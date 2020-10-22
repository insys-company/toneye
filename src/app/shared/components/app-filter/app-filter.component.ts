import { Component, OnChanges, OnInit, OnDestroy, Input, ChangeDetectorRef, SimpleChange, ChangeDetectionStrategy } from '@angular/core';
import { AppFilterService } from './app-filter.service';
import { ListItem, SimpleDataFilter } from 'src/app/api';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterSettings } from './filter-settings';

/**
 * This component displays filters on list pages.
 */
@Component({
  selector: 'app-filter',
  templateUrl: './app-filter.component.html',
  styleUrls: ['./app-filter.component.scss'],
  // animations: [ smoothDisplayAfterSkeletonAnimation ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppFilterComponent implements OnChanges, OnInit, OnDestroy {
  /**
   * Data for view
   */
  @Input() public data: Array<any>;
  /**
   * Flag for loading data
   */
  @Input() public skeletalAnimation: boolean = true;
  /**
   * Filter settings
   */
  @Input() settings: FilterSettings = new FilterSettings();

  /**
   * Shard list
   */
  @Input() public shards: ListItem[] = [];

  /**
   * For skeleton animation
   */
  @Input() public skeletonArray: Array<number> = new Array(4);

  /**
   * Flag for main info
   */
  @Input() public isFilterOpen: boolean;
  /**
   * Flag for hide btn
   */
  @Input() public isFilterHideBtnVisible: boolean = true;
  /**
   * Flag for footer
   */
  @Input() public isFilterFooterVisible: boolean = true;
  

  /**
   * Url params
   */
  public params: SimpleDataFilter = new SimpleDataFilter({});

  /**
   * Selected shards list
   */
  public selectedShards: ListItem[] = [];

  /**
   * Chain list
   */
  public chains: ListItem[] = [];
  /**
   * Selected chain list
   */
  public selectedChains: ListItem[] = [];

  /**
   * ExtInt list
   */
  public extInt: ListItem[] = [];
  /**
   * Selected extint list
   */
  public selectedExtInt: ListItem[] = [];

  /**
   * For button in info
   */
  public get btnPlaceholder(): string {
    return !this.isFilterOpen ? 'Show' : 'Hide';
  }

  constructor(
    private changeDetection: ChangeDetectorRef,
    private appFilterService: AppFilterService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    /** Disable change detection for application optimization */
    this.changeDetection.detach();

    this.isFilterOpen = false;
  }

  /**
   * Change data and update
   * @param changes Input data from parent
   */
  ngOnChanges(changes: { [propertyName: string]: SimpleChange }): void {
    // this.detectChanges();
  }

  /**
   * Initialization of the component
   */
  ngOnInit(): void {
    this.detectChanges();
    // TODO
  }

  /**
   * Destruction of the component
   */
  ngOnDestroy(): void {
    this.data = null;
    this.skeletonArray = null;
    this.skeletalAnimation = null;
    this.isFilterOpen = null;
  }

  /**
   * Method for ngFor optimization (Skeleton list)
   * @param index Item index in ngFor
   * @param item Item in ngFor
   */
  identifySkeleton(index: number, item: number): number { return item; }

  /**
   * Show/Hide filter
   */
  onShowOrHide(): void {
    this.isFilterOpen = !this.isFilterOpen;
    this.detectChanges();
  }

  /**
   * Изменение идентификатора
   * @param item Выбранный элемент
   */
  onSelectChain(item: ListItem): void {
    if (!item) { // null передается при сбросе
      this.params.chains = null;
    } else {
      const index = this.selectedChains.indexOf(item);
      this.params.chains = index > -1 ? item.id : null;
    }

    this.redirect();
  }

  /**
   * Изменение идентификатора
   * @param item Выбранный элемент
   */
  onSelectExtint(item: ListItem): void {
    if (!item) { // null передается при сбросе
      this.params.extint = null;
    } else {
      const index = this.selectedExtInt.indexOf(item);
      this.params.extint = index > -1 ? item.id : null;
    }

    this.redirect();
  }

  /**
   * Изменение идентификатора
   * @param item Выбранный элемент
   */
  onSelectShard(item: ListItem): void {
    if (!item) { // null передается при сбросе
      this.params.shard = null;
    } else {
      const index = this.selectedShards.indexOf(item);
      this.params.shard = index > -1 ? item.id : null;
    }

    this.redirect();
  }

  /**
   * Изменение фильтра aborted
   * @param check Состояние выбранное
   */
  onChangeAbortedFilter(check: boolean): void {
    // TODO
  }

  onSelectDate(): void {
    // TODO
  }

  onSelectMinMax(): void {
    // TODO
  }

  /**
   * Метод обновляет списки выбранных элементов
   * @param selectedItems Выбранные элементы
   * (если селект не с мультивыбором, то в массива всехда один элемент)
   * @param arrayName Имя массива выбранных элементов
   */
  updateSelectedItems(selectedItems: any[], arrayName: string): void {
    this[arrayName] = selectedItems ? selectedItems : [];
  }

  /**
   * Метод перенаправления для смены адресной строки
   */
  private redirect(): Promise<boolean> {
    Object.keys(this.params).map(key => {
      if (!this.params[key] && this.params[key] !== 0) {
        delete this.params[key];
      }
    });

    return this.router.navigate([], { queryParams: this.params });
  }

  /**
   * Detect Changes for optimization
   */
  private detectChanges(): void {
    this.changeDetection.detectChanges();
  }
}
