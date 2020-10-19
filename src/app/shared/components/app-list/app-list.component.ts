import { OnInit, OnDestroy, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { SimpleDataFilter } from 'src/app/api';
import { ListService } from './app-list.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

export class AppListComponent<TContract> implements OnInit, OnDestroy {
  /**
   * Переменная для подписок
   */
  protected subscriptions: Subscription[];

  /**
   * Флаг инициализации компонента
   */
  get initComplete(): boolean {
    return this.service.initComplete;
  }
  /**
   * Флаг инициализации компонента
   */
  set initComplete(init: boolean) {
    this.service.initComplete = init;
  }

  /**
   * Массив чисел для скелетной анимации
   */
  get skeletonArray(): Array<number> {
    return this.service.skeletonArray;
  }

  /**
   * Параметры фильтра
   */
  get filterParams(): SimpleDataFilter {
    return this.service.filterParams;
  }
  /**
   * Параметры фильтра
   */
  set filterParams(_filterParams: SimpleDataFilter) {
    this.service.filterParams = _filterParams;
  }

  /**
   * Дефолтные параметры фильтра
   * которые нельзя сбросить
   */
  get defaultFilterParams(): string[] {
    return this.service.defaultFilterParamsKeys;
  }
  /**
   * Дефолтные параметры фильтра
   * которые нельзя сбросить
   */
  set defaultFilterParams(_defaultFilterParams: string[]) {
    this.service.defaultFilterParamsKeys = _defaultFilterParams;
  }

  constructor(
    protected service: ListService<TContract>,
    protected route: ActivatedRoute,
    protected router: Router,
    @Inject(String) protected detailsPageName?: string,
  ) {
    this.filterParams = new SimpleDataFilter();
    /** Для подписок в компоненте */
    this.subscriptions = [];
  }

  /**
   * Инициализация
   */
  ngOnInit(): void {
    const _routeSub = this.route.queryParams.subscribe((queryParams: Params) => {
      this.filterParams = this.service.getFilterParams(queryParams, this.filterParams);
      // TODO
    });

    this.subscriptions.push(_routeSub);
  }

  /**
   * Уничтожение компонента
   * @returns {void}
   */
  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.forEach((s: Subscription) => s.unsubscribe());
      this.subscriptions = [];
    }
  }

  /**
   * Инициализация компонента задана строго после инициализации фильтра
   * Чтобы параметры роута не терялись
   * Переопределяем ngOnInit и onInitAfterFilter в наследователе
   * и в onInitAfterFilter вызываем super.ngOnInit()
   * @returns {void}
   */
  onInitAfterFilter(): void {
    // TODO
  }

  /**
   * Метод сортировки
   * @param {string} orderBy После сортировки
   *
   * @returns {void}
   */
  onSort(orderBy: string): void {

  }

  // /**
  //  * Метод смены страницы и размера страницы на пагинаторе
  //  * @param {PageEvent} event Событие с пагинатора (с параметрами)
  //  *
  //  * @returns {void}
  //  */
  // onChangePage(event: PageEvent): void {

  // }

  /**
   * Любое доп действие
   * @returns {void}
   */
  onAdditionalAction(): void {
    // TODO
  }


  /**
   * Метод дупликации
   * @param {string} id Идентификатор майлера
   * @param {any} clickEvent Событие для прекращения распространения клика
   *
   * @returns {void}
   */
  onCopy(itemId: string, clickEvent: any = null): void {
    /** Прекращение дальнейшей передачи текущего события */
    this.stopPropagation(clickEvent);

    // TODO
  }

  /**
   * Метод редактирования выбранного элемента
   * @param {string} itemId Идентификатор выбранного элемента
   * @param {any} clickEvent Событие для прекращения распространения клика
   *
   * @returns {void}
   */
  onDetails(itemId: string, clickEvent: any = null): void {
    /** Прекращение дальнейшей передачи текущего события */
    this.stopPropagation(clickEvent);

    if (!this.detailsPageName || !itemId) { return; }

    this.router.navigate([`/${this.detailsPageName}/${itemId}`]);
  }

  /**
   * Метод раскрытия списков (более детальной инфы в таблице)
   * @param {string | number} itemId Идентификатор выбранного элемента
   * @param {any} clickEvent Событие для прекращения распространения клика
   *
   * @returns {void}
   */
  onShowMore(itemId: string | number, clickEvent: any = null): void {
    /** Прекращение дальнейшей передачи текущего события */
    this.stopPropagation(clickEvent);

  }

  /**
   * Метод импорта файла
   * Переопределить в том компоненте, где импорт нужен
   * @returns {void}
   */
  onImport(): void {
    // TODO
  }

  /**
   * Метод экспорта файла
   * Переопределить в том компоненте, где импорт нужен
   * @returns {void}
   */
  onExport(): void {
    // TODO
  }

  /**
   * Прекращение распространения события
   * @param {any} clickEvent Событие для прекращения распространения клика
   *
   * @returns {void}
   */
  stopPropagation(clickEvent: any = null): void {
    /** Прекращение дальнейшей передачи текущего события */
    if (clickEvent) { clickEvent.stopPropagation(); }
  }


  /**
   * Метод перенаправления для смены адресной строки
   * Работа с параметрами и редирект
   * @returns {Promise<boolean>}
   */
  protected redirect(): Promise<boolean> {
    // Object.keys(this.filterParams).map(key => {
    //   if (!this.filterParams[this.service.constParamOrderByName]) {
    //     delete this.filterParams[this.service.constParamOrderAscName];
    //   }
    //   if (!this.filterParams[key] && this.filterParams[key] !== this.service.constZero) {
    //     delete this.filterParams[key];
    //   }
    // });
    return this.router.navigate([], { queryParams: this.filterParams });
  }
}
