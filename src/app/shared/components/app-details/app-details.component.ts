import { OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { GeneralViewer } from 'src/app/api';
import { DetailsService } from './app-details.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { IModel } from '../../interfaces/IModel';

export class AppDetailsComponent<TModel extends IModel> implements OnInit, OnDestroy {
  /**
   * For subscribers
   */
  protected _unsubscribe: Subject<void> = new Subject();
  /**
   * For skeleton animation
   */
  public skeletonArray: Array<number> = new Array(4);
  /**
   * Flag for show/hide state of info
   */
  public isAditionalInfoOpen: boolean;
  /**
   * Flag for loading animation in Viewers
   */
  public viewersLoading: boolean;
  /**
   * Model
   */
  public model: TModel;
  /**
   * ModelId
   */
  public modelId: string | number;
  /**
   * For for subscribers
   */
  public disabled: boolean;
  /**
   * General Data for view
   */
  public generalViewerData: Array<GeneralViewer>;
  /**
   * Aditional Data for view
   */
  public aditionalViewerData: Array<GeneralViewer>;

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected _service: DetailsService<TModel>,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {
    /** Disable change detection for application optimization */
    this.changeDetection.detach();

    /** Loading animation in children */
    this.viewersLoading = true;
  }

  /**
   * Initialization of the component
   */
  ngOnInit(): void {

    this.subscribeInit();
    this.detectChanges();

    this.route.params
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((params: Params) => {
        this.modelId = params['id'] != null ? params['id'].trim() : null;

        if (this.modelId == null) {
          this.router.navigate([`/${this._service.parentPageName}`]);
          this._unsubscribe.next();
          this._unsubscribe.complete();
          return;
        }

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
   * Destruction of the component
   */
  ngOnDestroy(): void {
    if (this._unsubscribe) {
      this._unsubscribe.next();
      this._unsubscribe.complete();
      this._unsubscribe = null;
    }

    if (this._service) {
      this._service.destroy();
    }

    this.skeletonArray = null;
    this.isAditionalInfoOpen = null;
    this.viewersLoading = null;
    this.model = null;
    this.modelId =  null;
    this.disabled = null;
    this.generalViewerData = null;
    this.aditionalViewerData = null;
  }

  /**
   * Export method
   */
  onExport(): void {
    // TODO
  }

  /**
   * Метод дупликации
   * @param id Идентификатор выбранного элемента
   * @param clickEvent Событие для прекращения распространения клика
   */
  onCopy(itemId: string, clickEvent: any = null): void {
    /** Прекращение дальнейшей передачи текущего события */
    this.stopPropagation(clickEvent);

    // TODO
  }

  /**
   * Прекращение распространения события
   * @param clickEvent Событие для прекращения распространения клика
   */
  stopPropagation(clickEvent: any = null): void {
    /** Прекращение дальнейшей передачи текущего события */
    if (clickEvent) { clickEvent.stopPropagation(); }
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

    this.mapData(this.model);
    this.viewersLoading = false;
    this.detectChanges();

    // TODO
  }

  /**
   * Map messages for viewer
   * @param _model Model
   * @param _data Aditional data
   */
  protected mapData(_model: TModel, _data?: any): void {

    this.generalViewerData = [];

    // TODO
  }

  /**
   * Detect Changes
   */
  protected detectChanges(): void {
    this.changeDetection.detectChanges();
  }
}
