import { OnInit, AfterViewChecked, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { IModel } from '../../interfaces';
import { BaseService } from './app-base.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { ViewerData, TabViewerData, SimpleDataFilter, ItemList, FilterSettings } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import _ from 'underscore';
import { LocaleText } from 'src/locale/locale';

export class BaseComponent<TModel extends IModel> implements OnInit, AfterViewChecked, OnDestroy {
  // /**
  //  * For subs 
  //  */
  // private subs: Subscription[] = [];
  /**
   * Details or list
   */
  protected listMode: boolean;
  /**
   * For subscribers
   */
  public _routeUnsubscribe: Subject<void> = new Subject<void>();
  /**
   * For subscribers
   */
  public _unsubscribe: Subject<void> = new Subject<void>();
  /**
   * For skeleton animation
   */
  public skeletonArrayForGeneralViewer: Array<number> = new Array(4);
  /**
   * For skeleton animation
   */
  public skeletonArrayForFilter: Array<number> = new Array(4);
  /**
   * Flag for filter
   */
  public filterLoading: boolean;
  /**
   * Flag for main info
   */
  public isGeneralInfoOpen: boolean;
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
   * Aditional Data for view
   */
  public aditionalViewerData: Array<ViewerData>;
  /**
   * Flag for loading data of Tabs Viewer
   */
  public tableViewersLoading: boolean;
  /**
   * Data for view
   */
  public tableViewerData: Array<TabViewerData>;
  /**
   * Aditional Data for view
   */
  public aditionalTableViewerData: Array<TabViewerData>;

  /**
   * For data update
   */
  public autoupdate: boolean;

  /**
   * For data update
   */
  public autoupdateSubscribe: boolean;

  /**
   * Data for view
   */
  public newDataAfterUpdate: Array<TabViewerData>;

  /**
   * For DOM elements
   */
  public disabled: boolean;
  /**
   * Component is init
   */
  public initComplete: boolean;


  /** For Details component */
  /**
   * Model
   */
  public model: TModel;
  /**
   * ModelId
   */
  public modelId: string | number;


  /**For list component */
  /**
   * Params
   */
  public params: SimpleDataFilter = new SimpleDataFilter();
  /**
   * Array of ...
   */
  public data: ItemList<TModel>;
  /**
   * data length
   */
  public total: number = 0;
  /**
   * Tab index
   * (For styles and queries in parent component)
   */
  public selectedTabIndex: number = 0;

  /**
   * Filter settings
   */
  public get filterSettings(): FilterSettings {
    return this._service._filterSettings;
  }

  /**
   * For button in info
   */
  public get generalInfoBtnPlaceholder(): string {
    return !this.isGeneralInfoOpen ? LocaleText.show : LocaleText.hide;
  }

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected _service: BaseService<TModel>,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {
    /** Disable change detection for application optimization */
    this.changeDetection.detach();

    this._routeUnsubscribe = new Subject<void>();
    this._unsubscribe = new Subject<void>();
    this.params = new SimpleDataFilter();

    /** Loading animation in children */
    this.filterLoading = true;
    this.isGeneralInfoOpen = true;
    this.viewersLoading = true;
    this.tableViewersLoading = true;
  }

  /**
   * Initialization of the component
   */
  public ngOnInit(): void {

    this.init();

    this.listMode
      ? this.initList()
      : this.initDatails();
  }

  /**
   * After children check
   */
  public ngAfterViewChecked(): void {
    // console.log('datails');
    this.detectChanges();
  }

  /**
   * Initialization of the component
   * For details component
   */
  public initDatails(): void {
    this.route.params
      .pipe(takeUntil(this._routeUnsubscribe))
      .subscribe((params: Params) => {
        this.modelId = params['id'] != null ? params['id'].trim() : null;

        this._service.getModel(this.modelId)
          .pipe(takeUntil(this._unsubscribe))
          .subscribe((_model: TModel[]) => {

            if (!_model[0]) {
              this.router.navigate([`/${this._service.parentPageName}`]);
              this._unsubscribe.next();
              this._unsubscribe.complete();
              return;
            }
  
            this.model = this._service.factoryFunc(_model[0]);

            // Get aditional data
            this.getData();

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
      .pipe(takeUntil(this._routeUnsubscribe))
      .subscribe((queryParams: Params) => {

        this.params = _.clone(this._service.baseFunctionsService.getFilterParams(queryParams, this.params));

        console.log(this.params);

        this.detectChanges();

        this.refreshData();

        // TODO

      });
  }

  /**
   * Destruction of the component
   */
  public ngOnDestroy(): void {
    this.routeUnsubscribe();
    this._routeUnsubscribe = null;

    this.unsubscribe();
    this._unsubscribe = null;

    if (this._service) {
      this._service.destroy();
    }

    this.listMode = null;
    this.skeletonArrayForGeneralViewer = null;
    this.isGeneralInfoOpen = null;
    this.isAditionalInfoOpen = null;
    this.viewersLoading = null;
    this.generalViewerData = null;
    this.aditionalViewerData = null;
    this.tableViewersLoading = null;
    this.tableViewerData = null;
    this.aditionalTableViewerData = null;
    this.disabled = null;
    this.autoupdate = null;
    this.autoupdateSubscribe = null;
    this.newDataAfterUpdate = null;

    this.model = null;
    this.modelId =  null;
    this.params = null;
    this.data = null;
    this.total = null;
    this.selectedTabIndex = null;
  }

  /**
   * unsubscribe from qeries of the component
   */
  public routeUnsubscribe(): void {
    if (this._routeUnsubscribe) {
      this._routeUnsubscribe.next();
      this._routeUnsubscribe.complete();
    }
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
   * Export method
   */
  public onExport(): void {
    // TODO
  }

  /**
   * Copy method
   * @param itemId Selected item id
   * @param clickEvent Click event
   */
  public onCopy(itemId: string, clickEvent: any = null): void {
    /** Прекращение дальнейшей передачи текущего события */
    this.stopPropagation(clickEvent);

    // TODO
  }

  /**
   * Change tab
   * @param index Index of selected tab
   */
  public onChangeTab(index: number): void {

    if (index == this.selectedTabIndex) { return; }

    this.selectedTabIndex = index;

    this.detectChanges();

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
   * Show/Hide info about TON
   */
  public onShowOrHideGeneralInfo(): void {

    this.isGeneralInfoOpen = !this.isGeneralInfoOpen;

    this.detectChanges();
  }

  /**
   * Event of select
   * @param item Selected item from table
   */
  public onSelectItem(item: TabViewerData): void {
    if (item.id) {
      this.router.navigate([`/${this._service.detailsPageName}/${item.id}`]);
    }
  }

  /**
   * Method for ngFor optimization (Skeleton list)
   * @param index Item index in ngFor
   * @param item Item in ngFor
   */
  public identifySkeleton(index: number, item: number): number { return item; }

  /**
   * Method for ngFor optimization (ViewerData list)
   * @param index Item index in ngFor
   * @param item Item in ngFor
   */
  public identifyData(index: number, item: ViewerData): string { return item.value; }

  /**
   * Change autoupdate checkbox
   * @param check Flag
   */
  public updateChange(check: boolean) {
    this.autoupdate = check;

    this.detectChanges();
    // TODO
  }

  /**
   * update data
   */
  protected refreshData(): void {

    this.detectChanges();

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

    if (!(this.autoupdate && this.autoupdateSubscribe)) {
      this.unsubscribe();
      this._service.unsubscribe();
    }

    return this.router.navigate([], { queryParams: this.params });
  }

  /**
   * For subscribers after ngOnDestroy
   */
  protected init(): void {
    this._service.init();
    this._routeUnsubscribe = new Subject<void>();
    this._unsubscribe = new Subject<void>();
    this.params = new SimpleDataFilter();

    /** Loading animation in children */
    this.isGeneralInfoOpen = true;
    this.viewersLoading = true;
    this.tableViewersLoading = true;

    this.detectChanges();
  }

  /**
   * Data for model from other queries
   */
  protected getData(): void {

    this.detectChanges();

    // TODO
  }

  /**
   * Map for viewer
   * @param _model Model
   * @param _data Aditional data
   */
  protected mapDataForViews(_model: TModel, _data?: any): void {
    // TODO
  }

  /**
   * Прекращение распространения события
   * @param clickEvent Событие для прекращения распространения клика
   */
  protected stopPropagation(clickEvent: any = null): void {
    /** Прекращение дальнейшей передачи текущего события */
    if (clickEvent) { clickEvent.stopPropagation(); }
  }

  /**
   * Detect Changes
   */
  protected detectChanges(): void {
    this.changeDetection.detectChanges();
  }
}
