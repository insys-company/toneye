import { OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { SimpleDataFilter, ViewerData, TabViewerData } from 'src/app/api';
import { ListService } from './app-list.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { IModel } from '../../interfaces/IModel';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import { FilterSettings } from '../app-filter/filter-settings';
import _ from 'underscore';

export class AppListComponent<TModel extends IModel> implements OnInit, OnDestroy {
  /**
   * For subs 
   */
  private subs: Subscription[] = [];
  /**
   * For subscribers
   */
  public _unsubscribe: Subject<void> = new Subject();
  /**
   * For skeleton animation
   */
  public skeletonArrayForGeneralViewer: Array<number> = new Array(4);
  /**
   * Flag for show/hide state of info
   */
  public isAditionalInfoOpen: boolean;
  /**
   * Flag for loading animation in Viewers
   */
  public viewersLoading: boolean;
  /**
   * Data for view
   */
  public generalViewerData: Array<ViewerData>;
  /**
   * Flag for loading data of Tabs Viewer
   */
  public tableViewersLoading: boolean;
  /**
   * Data for view
   */
  public tableViewerData: Array<TabViewerData>;
  /**
   * For DOM elements
   */
  public disabled: boolean;


  /**
   * Params
   */
  public params: SimpleDataFilter = new SimpleDataFilter();
  /** Array of ... */
  public data: TModel[] = [];

  /**
   * data length
   */
  public total: number = 0;

  /**
   * Filter settings
   */
  public get filterSettings(): FilterSettings {
    return this._service._filterSettings;
  }

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected _service: ListService<TModel>,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {
    /** Disable change detection for application optimization */
    this.changeDetection.detach();

    this.params = new SimpleDataFilter();
    /** Для подписок в компоненте */
    this.subs = [];

    /** Loading animation in children */
    this.viewersLoading = true;
    this.tableViewersLoading = true;
  }

  // constructor(
  //   protected service: ListService<TModel>,
  //   protected route: ActivatedRoute,
  //   protected router: Router,
  //   @Inject(String) protected detailsPageName?: string,
  // ) {
  //   this.params = new SimpleDataFilter();
  //   /** Для подписок в компоненте */
  //   this.subs = [];
  // }

  /**
   * Initialization of the component
   */
  public ngOnInit(): void {

    this.subscribeInit();
    this.detectChanges();

    this.route.queryParams
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((queryParams: Params) => {

        this.params = this._service.baseFunctionsService.getFilterParams(queryParams, this.params);

        this.refreshData();

        // TODO

      });
  }

  /**
   * Destruction of the component
   */
  public ngOnDestroy(): void {
    if (this._unsubscribe) {
      this._unsubscribe.next();
      this._unsubscribe.complete();
      this._unsubscribe = null;
    }

    if (this._service) {
      this._service.destroy();
    }

    this.skeletonArrayForGeneralViewer = null;
    this.isAditionalInfoOpen = null;
    this.viewersLoading = null;
    this.generalViewerData = null;
    // this.aditionalViewerData = null;
    this.tableViewersLoading = null;
    this.tableViewerData = null;
    this.disabled = null;

    this.params = null;
    this.data = null;
    this.total = null;
  }

  /**
   * Export method
   */
  public onExport(): void {
    // TODO
  }

  /**
   * Change tab
   * @param index Index of selected tab
   */
  public onChangeTab(index: number): void {
    // TODO
  }

  /**
   * Load more data
   * @param index Index of selected tab
   */
  public onLoadMore(index: number): void {
    // TODO
  }

  /**
   * Получение данных
   */
  protected refreshData(): void {
    // TODO
  }

  /**
   * Reset scroll
   */
  protected scrollToTop(): void {
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  /**
   * Scroll to bottom
   */
  protected scrollToBottom(): void {
    window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'});
  }

  /**
   * Redirect to params
   */
  protected redirect(): Promise<boolean> {
    Object.keys(this.params).map(key => {
      if (!this.params[key] && this.params[key] !== 0) {
        delete this.params[key];
      }
    });
    return this.router.navigate([], { queryParams: this.params });
  }

  /**
   * For subscribers after ngOnDestroy
   */
  protected subscribeInit(): void {
    this._service.subscribeInit();
    this._unsubscribe = new Subject<void>();
  }

  /**
   * Data for model from other queries
   */
  protected getData(): void {
    // TODO
  }

  /**
   * Map messages for viewer
   * @param _model Model
   * @param _data Aditional data
   */
  protected mapDataForViews(_model: TModel, _data?: any): void {
    // TODO
  }

  /**
   * Map data for viewer
   * @param _list List of contracts
   * @param type Type of contract
   * @param arrayLength Length of mapped array
   * @param _data Aditional data
   */
  protected mapDataForTable(_list: TModel[], type: string, arrayLength: number = 10, _data?: any): TabViewerData[] {
    if (!_list || !_list.length) { return []; }

    let data = [];

    data = _list.map((item: any) => {
      if (type === appRouteMap.accounts) {
        return this._service.baseFunctionsService.mapAccountForTable(item, _data);
      }
      else if (type === appRouteMap.blocks) {
        return this._service.baseFunctionsService.mapBlockForTable(item);
      }
      else if (type === appRouteMap.contracts) {
        return this._service.baseFunctionsService.mapContractForTable(item);
      }
      else if (type === appRouteMap.messages) {
        return this._service.baseFunctionsService.mapMessageForTable(item);
      }
      else if (type === appRouteMap.transactions) {
        return this._service.baseFunctionsService.mapTransactionForTable(item);
      }
      else if (type === appRouteMap.validators) {
        return this._service.baseFunctionsService.mapValidatorForTable(item, _data);
      }
      else {
        return null;
      }
    });

    data = _.without(data, null);

    data = _.clone(_.first(data, arrayLength));

    return data;
  }

  /**
   * Detect Changes
   */
  protected detectChanges(): void {
    this.changeDetection.detectChanges();
  }
}
