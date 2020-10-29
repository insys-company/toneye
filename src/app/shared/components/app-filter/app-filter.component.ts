import { Component, OnChanges, OnInit, OnDestroy, Input, ChangeDetectorRef, SimpleChange, ChangeDetectionStrategy, AfterViewChecked } from '@angular/core';
import { smoothDisplayAfterSkeletonAnimation } from 'src/app/app-animations';
import { AppFilterService } from './app-filter.service';
import { ListItem, SimpleDataFilter, FilterSettings, Block, BlockMasterShardHashes } from 'src/app/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * This component displays filters on list pages.
 */
@Component({
  selector: 'app-filter',
  templateUrl: './app-filter.component.html',
  styleUrls: ['./app-filter.component.scss'],
  animations: [ smoothDisplayAfterSkeletonAnimation ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppFilterComponent implements OnChanges, OnInit, AfterViewChecked, OnDestroy {
  /**
   * For subscribers
   */
  public _unsubscribe: Subject<void> = new Subject<void>();
  
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
  @Input() public settings: FilterSettings = new FilterSettings();

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
  @Input() public params: SimpleDataFilter = new SimpleDataFilter({});

  /**
   * Для поля
   */
  @Input() public minMaxPlaceholder: string;
  /**
   * Для поля
   */
  @Input() public minPlaceholder: string;
  /**
   * Для поля
   */
  @Input() public maxPlaceholder: string;

  /**
   * Для поля
   */
  @Input() public datePlaceholder: string;
  /**
   * Для поля
   */
  @Input() public fromPlaceholder: string;
  /**
   * Для поля
   */
  @Input() public toPlaceholder: string;

  /**
   * Shard list
   */
  public shards: ListItem[] = [];
  /**
   * Selected shards list
   */
  public selectedShards: ListItem[] = [];
  /**
   * Init
   */
  public shardsInit: boolean;

  /**
   * Chain list
   */
  public chains: ListItem[] = [];
  /**
   * Selected chain list
   */
  public selectedChains: ListItem[] = [];
  /**
   * Init
   */
  public chainsInit: boolean;

  /**
   * ExtInt list
   */
  public extInt: ListItem[] = [];
  /**
   * Selected extint list
   */
  public selectedExtInt: ListItem[] = [];
  /**
   * Init
   */
  public extIntInit: boolean;

  /**
   * ExtInt list
   */
  public aborted: ListItem[] = [];
  /**
   * Selected extint list
   */
  public selectedAborted: ListItem[] = [];
  /**
   * Init
   */
  public abortedInit: boolean;

  /**
   * Directions list
   */
  public directions: ListItem[] = [];
  /**
   * Selected directions list
   */
  public selectedDirections: ListItem[] = [];
  /**
   * Init
   */
  public directionsInit: boolean;

  /**
   * Min
   */
  public min: string;
  /**
   * Max
   */
  public max: string;

  /**
   * From date
   */
  public fromDate: string;
  /**
   * To date
   */
  public toDate: string;

  /**
   * For button in info
   */
  public get btnPlaceholder(): string {
    return !this.isFilterOpen ? 'Show' : 'Hide';
  }

  /**
   * For button in info
   */
  public get filterSetCount(): number {
    if (!this.settings && !this.params) { return 0 }

    let count = 0;

    count = this.settings.filterChain && this.params.chain != null ? count += 1 : count;
    count = this.settings.filterByShard && this.params.shard != null ? count += 1 : count;
    count = this.settings.filterExtInt && this.params.ext_int != null ? count += 1 : count;
    count = this.settings.filterByMinMax && (this.params.min != null || this.params.max != null) ? count += 1 : count;
    count = this.settings.filterByAbort && this.params.aborted != null ? count += 1 : count;
    count = this.settings.filterByDirection && this.params.msg_direction != null ? count += 1 : count;
    count = this.settings.filterByDate && (this.params.fromDate != null || this.params.toDate != null) ? count += 1 : count;
  
    return count;
  }

  constructor(
    private changeDetection: ChangeDetectorRef,
    private service: AppFilterService,
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
  public ngOnChanges(changes: { [propertyName: string]: SimpleChange }): void {
    if (this.settings) {
      if (this.settings.filterChain) {
        this.getChains(this.params ? this.params.chain : null);
      }
      if (this.settings.filterExtInt) {
        this.getExtInt(this.params ? this.params.ext_int : null);
      }
      if (this.settings.filterByShard) {
        this.getShards(this.params ? this.params.shard : null);
      }
      if (this.settings.filterByAbort) {
        this.getAbortFilter(this.params ? this.params.aborted : null);
      }
      if (this.settings.filterByDirection) {
        this.getDirections(this.params ? this.params.msg_direction : null);
      }
      if (this.settings.filterByMinMax) {
        this.getMinMax(this.params ? { min: this.params.min, max: this.params.max } : { min: null, max: null})
      }
      if (this.settings.filterByDate) {
        this.getDate(this.params ? { from: this.params.fromDate, to: this.params.toDate } : { from: null, to: null})
      }

      console.log(this.params);
      // this.detectChanges();
    }
  }

  /**
   * Initialization of the component
   */
  public ngOnInit(): void {
    this.service.init();

    console.log(this.params);

    // this.route.queryParams
    //   .pipe(takeUntil(this._unsubscribe))
    //   .subscribe((queryParams: Params) => {

    //     this.params = this.baseFunctionsService.getFilterParams(queryParams, this.params);

    //     console.log(this.params);

    //     this.detectChanges();

    //   });
  }

  /**
   * After children check
   */
  public ngAfterViewChecked(): void {
    console.log('f');
    this.detectChanges();
  }

  /**
   * Destruction of the component
   */
  public ngOnDestroy(): void {
    this.unsubscribe();
    this._unsubscribe = null;

    if (this.service) {
      this.service.destroy();
    }

    this.data = null;
    this.skeletalAnimation = null;
    this.skeletonArray = null;
    this.settings = null;
    this.shards = null;
    this.isFilterOpen = null;
    this.isFilterHideBtnVisible = null;
    this.isFilterFooterVisible = null;
    this.params = null;
    this.selectedShards = null;
    this.chains = null;
    this.selectedChains = null;
    this.extInt = null;
    this.selectedExtInt = null;
    this.aborted = null;
    this.selectedAborted = null;

    this.shardsInit = null;
    this.chainsInit = null;
    this.extIntInit = null;
    this.abortedInit = null;
  }

  /**
   * unsubscribe from qeries of the component
   */
  public unsubscribe(): void {
    if (this._unsubscribe) {
      this._unsubscribe.next();
      this._unsubscribe.complete();
    }
  }

  /**
   * Method for ngFor optimization (Skeleton list)
   * @param index Item index in ngFor
   * @param item Item in ngFor
   */
  public identifySkeleton(index: number, item: number): number { return item; }

  /**
   * Reset filter
   */
  public onResetFilter(): void {
    this.selectedChains = [];
    this.selectedExtInt = [];
    this.selectedShards = [];
    this.selectedAborted = [];
    this.selectedDirections = [];
    this.min = null;
    this.max = null;
    this.fromDate = null;
    this.toDate = null;
    this.params = new SimpleDataFilter({});
    this.redirect();
  }

  /**
   * Show/Hide filter
   */
  public onShowOrHide(): void {
    this.isFilterOpen = !this.isFilterOpen;
    // this.detectChanges();
  }

  /**
   * Изменение идентификатора
   * @param item Выбранный элемент
   */
  public onSelectChain(item: ListItem): void {
    if (!item) { // null передается при сбросе
      this.params.chain = null;
    } else {
      const index = this.selectedChains.indexOf(item);
      this.params.chain = index > -1 ? item.id : null;
    }

    // this.detectChanges();
    this.redirect();
  }

  /**
   * Изменение идентификатора
   * @param item Выбранный элемент
   */
  public onSelectExtint(item: ListItem): void {
    if (!item) { // null передается при сбросе
      this.params.ext_int = null;
    } else {
      const index = this.selectedExtInt.indexOf(item);
      this.params.ext_int = index > -1 ? item.id : null;
    }

    // this.detectChanges();
    this.redirect();
  }

  /**
   * Изменение идентификатора
   * @param item Выбранный элемент
   */
  public onSelectShard(item: ListItem): void {
    if (!item) { // null передается при сбросе
      this.params.shard = null;
    } else {
      const index = this.selectedShards.indexOf(item);
      this.params.shard = index > -1 ? item.id : null;
    }

    // this.detectChanges();
    this.redirect();
  }

  /**
   * Изменение идентификатора
   * @param item Выбранный элемент
   */
  public onSelectAborted(item: ListItem): void {
    if (!item) { // null передается при сбросе
      this.params.aborted = null;
    } else {
      const index = this.selectedAborted.indexOf(item);
      this.params.aborted = index > -1 ? item.id : null;
    }

    // this.detectChanges();
    this.redirect();
  }

  /**
   * Изменение идентификатора
   * @param item Выбранный элемент
   */
  public onSelectDirection(item: ListItem): void {
    if (!item) { // null передается при сбросе
      this.params.msg_direction = null;
    } else {
      const index = this.selectedDirections.indexOf(item);
      this.params.msg_direction = index > -1 ? item.id : null;
    }

    // this.detectChanges();
    this.redirect();
  }

  /**
   * Изменение фильтра aborted
   * @param check Состояние выбранное
   */
  public onChangeAbortedFilter(check: boolean): void {
    // TODO
  }

  /**
   * Get params from child component
   * @param obj Obj with from to
   */
  public onSelectDate(obj: { from: string, to: string }): void {
    this.fromDate = obj.from != null ? obj.from : null;
    this.toDate = obj.to != null ? obj.to : null;
    this.params.fromDate = this.fromDate != null ? this.fromDate : null;
    this.params.toDate = this.toDate != null ? this.toDate : null;

    // this.detectChanges();
    this.redirect();
  }

  /**
   * Get params from child component
   * @param obj Obj with min max
   */
  public onSelectMinMax(obj: { min: string, max: string }): void {
    this.min = obj.min != null ? obj.min : null;
    this.max = obj.max != null ? obj.max : null;
    this.params.min = this.min != null ? this.min : null;
    this.params.max = this.max != null ? this.max : null;

    // this.detectChanges();
    this.redirect();
  }

  /**
   * Метод обновляет списки выбранных элементов
   * @param selectedItems Выбранные элементы
   * (если селект не с мультивыбором, то в массива всехда один элемент)
   * @param arrayName Имя массива выбранных элементов
   */
  public updateSelectedItems(selectedItems: any[], arrayName: string): void {
    this[arrayName] = selectedItems ? selectedItems : [];
  }

  /**
   * Get list
   * @param id Id of selected item
   */
  private getChains(id?: string): void {

    if (!this.chainsInit) {
      this.chains = this.service.getChains();
      this.selectedChains = [];
    }

    // Поиск выбранных
    if (id) {
      let item = this.chains.find(s => s.id === id);

      if (item) {
        this.selectedChains.push(item);
      }

      item = null;
    }

    this.chainsInit = true;
  }

  /**
   * Get list
   * @param id Id of selected item
   */
  private getDirections(id?: string): void {

    if (!this.directionsInit) {
      this.directions = this.service.getDirections();
      this.selectedDirections = [];
    }

    // Поиск выбранных
    if (id) {
      let item = this.directions.find(s => s.id === id);

      if (item) {
        this.selectedDirections.push(item);
      }

      item = null;
    }

    this.directionsInit = true;
  }

  /**
   * Get list
   * @param id Id of selected item
   */
  private getShards(id?: string): void {

    if (!this._unsubscribe) {
      this._unsubscribe = new Subject<void>();
    }
    
    if (this.shardsInit) {
      // Поиск выбранных
      if (id && this.shards.length) {
        let item = this.shards.find(s => s.id === id);

        if (item) {
          this.selectedShards.push(item);
        }

        item = null;
      }
      return;
    }

    this.service.getShards()
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Block[]) => {

        this.shards = res && res[0] && res[0].master ? this.mapShards(res[0].master.shard_hashes) : [];
        this.selectedShards = [];

        // Поиск выбранных
        if (id && this.shards.length) {
          let item = this.shards.find(s => s.id === id);

          if (item) {
            this.selectedShards.push(item);
          }

          item = null;
        }

        this.shardsInit = true;

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Get list
   * @param id Id of selected item
   */
  private getExtInt(id?: string): void {

    if (!this.extIntInit) {
      this.extInt = this.service.getExtInt();
      this.selectedExtInt = [];
    }

    // Поиск выбранных
    if (id) {
      let item = this.extInt.find(s => s.id === id);

      if (item) {
        this.selectedExtInt.push(item);
      }

      item = null;
    }

    this.extIntInit = true;
  }

  /**
   * Get list
   * @param id Id of selected item
   */
  private getAbortFilter(id?: string): void {

    if (!this.abortedInit) {
      this.aborted = this.service.getAbortFilter();
      this.selectedAborted = [];
    }

    // Поиск выбранных
    if (id) {
      let item = this.aborted.find(s => s.id === id);

      if (item) {
        this.selectedAborted.push(item);
      }

      item = null;
    }

    this.abortedInit = true;
  }

  /**
   * Set params
   * @param obj Obj with min max
   */
  private getDate(obj: { from: string, to: string }): void {
    this.fromDate = obj.from != null ? obj.from : null;
    this.toDate = obj.to != null ? obj.to : null;
  }

  /**
   * Set params
   * @param obj Obj with min max
   */
  private getMinMax(obj: { min: string, max: string }): void {
    this.min = obj.min != null ? obj.min : null;
    this.max = obj.max != null ? obj.max : null;
  }

  /**
   * Map shard list
   * @param shard_hashes List of Shards
   */
  private mapShards(shard_hashes: Array<BlockMasterShardHashes>): ListItem[] {
    if (!shard_hashes || !shard_hashes.length) { return []; }

    let list: ListItem[] = [];

    shard_hashes.forEach((sh) => {
      list.push(new ListItem({ id: sh.shard, name: sh.shard }));
    });

    return list;
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
