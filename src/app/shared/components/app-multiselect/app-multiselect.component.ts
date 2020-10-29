import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy, HostListener, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChange } from '@angular/core';
import { AppMultiselectService } from './app-multiselect.service';
import { AppMultiselectOverlayService } from './app-multiselect-overlay/app-multiselect-overlay.service';
import { OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { Subscription } from 'rxjs';
import 'rxjs/add/operator/debounceTime';
import _ from 'underscore';
import { LocaleText } from 'src/locale/locale';

export type MaterialType = 'legacy' | 'standard' | 'fill' | 'outline';

const DEFAULT_INPUTNAME = 'multiselect';
const DEFAULT_MATERIAL_THEME = 'outline';
@Component({
  selector: 'app-multiselect',
  templateUrl: './app-multiselect.component.html',
  styleUrls: ['./app-multiselect.component.scss'],
  providers: [ AppMultiselectService ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppMultiselectComponent implements OnInit, OnDestroy {
  /**
   * Элемента для расчета позиции overlay
   * @type {ElementRef}
   */
  @ViewChild('multiselectElement') multiselectElement?: ElementRef;

  /** ДЛЯ СЕЛЕКТА */

  /**
   * Блокировщик для поля
   * @type {boolean}
   */
  @Input() public disabled: boolean;
  /**
   * Обязательность селекта
   * Для использования в форме
   * @type {boolean}
   */
  @Input() public required: boolean;
  /**
   * Простой фильтр - фильтрация списка производится
   * путем поиска строки, которая начинается на `введенные символы`
   * По умолчанию фильтрацию по вхождению: возвращаются все строки в которые
   * входят введенные символы не зависимо от их позиции
   * @type {boolean}
   */
  @Input() public simpleFilter: boolean;

  /**
   * Флаг включения Label для поля
   * @type {boolean}
   */
  @Input() public labelVisible: boolean;
  /**
   * Label для поля, если включена
   * @type {string}
   */
  @Input() public label: string;
  /**
   * Имя для инпута
   * @type {string}
   */
  @Input() public inputName: string;
  /**
   * Заголовок поля
   * @type {string}
   */
  @Input() public placeholder: string;
  /**
   * Тема материала
   * @type {string}
   */
  @Input() public materialTheme?: MaterialType;
  /**
   * Доп класс для стилизации
   * @type {string}
   */
  @Input() public styleClass?: string;
  /**
   * Класс для тени
   * @type {string}
   */
  @Input() public shadowStyleClass?: string;
  /**
   * Включение иконки отчистки селекта в single режиме
   * Появится вместо стрелочки
   * @type {string}
   */
  @Input() public singleSelectClearingEnable?: boolean;

  /**
   * For prefix icon
   */
  @Input() public isPrefixIconVisible: boolean = true;
  /**
   * For prefix icon
   */
  @Input() public prefixIconClass: string;

  /**
   * Для окраски текста в селекте
   * @type {string}
   */
  @Input() public inputTextColorClass: string;

  /** ДЛЯ ОТКРЫВАЮЩЕЙСЯ ПАНЕЛИ СЕЛЕКТА */

  /**
   * Размер списка
   * @type {number}
   */
  @Input() public overlaySize: number;
  /**
   * Список элементов для выбора
   * @type {any[]}
   */
  @Input() public options: any[];
  /**
   * Список элементов которые выбраны
   * @type {any[]}
   */
  @Input() public selectedOptions: any[];
  /**
   * Имя, которое будет отображаться в списке
   * @type {string}
   */
  @Input() public displayName: string;
  /**
   * Поле для сортировки списков
   * @type {string}
   */
  @Input() public sortField: string;
  /**
   * Включение поиска
   * @type {boolean}
   */
  @Input() public searchEnable: boolean;
  /**
   * Для поля поиска заголовок
   * @type {string}
   */
  @Input() public searchPlaceholder: string;
  /**
   * Мультирежим
   * @type {boolean}
   */
  @Input() public multiple: boolean;
  /**
   * Текст для случая когда не найдено ничего по поиску
   * @type {string}
   */
  @Input() public notFoundTitle: string;
  /**
   * Включение лимита на выбор опций
   * @type {boolean}
   */
  @Input() public optionsLimitEnable: boolean;
  /**
   * Лимит на выбор опций
   * @type {number}
   */
  @Input() public optionsLimit: number;
  /**
   * Включение поиска по запросам к серверу
   * @type {boolean}
   */
  @Input() public serverSideSearchEnable: boolean;
  /**
   * Эндпоинт для поиска
   * @type {string}
   */
  @Input() public searchEndpoint: string;
  /**
   * Параметр, который будет отправляться на сервер при поиске
   * например search=example
   * По умолчанию search
   * @type {string}
   */
  @Input() public searchParamNameForServerSideSearching: string;
  /**
   * Тултип на опциях
   * @type {boolean}
   */
  @Input() public tooltipVisible: boolean;

  /**
   * Чекбокс Select All в листе
   * @type {boolean}
   */
  @Input() public selectAll: boolean;
  /**
   * Наименование - чекбокса Select All в листе
   * @type {string}
   */
  @Input() public selectAllPlaceholder: string;


  /**
   * Доп класс для панели
   * @type {string}
   */
  @Input() public panelClass?: string;

  /**
   * Событие генерируемое при выборе конкретного элемента
   * Передает выбранный элемент
   * @type {EventEmitter<>}
   */
  @Output() optionSelected: EventEmitter<any>;
  /**
   * Событие генерируемое при выборе конкретного элемента
   * Передает массив выбранных элементов (например для мультиселекта)
   * @type {EventEmitter<>}
   */
  @Output() selectedOptionsChange: EventEmitter<any[]>;
  /**
   * Событие генерируемое при закрытии панели
   * @type {EventEmitter<>}
   */
  @Output() panelClose: EventEmitter<void>;

  /**
   * Для подписок
   * @type {Subscription}
   */
  private overlaySubs: Subscription[];
  /**
   * Для overlay
   * @type {OverlayRef}
   */
  private get overlayRef(): OverlayRef {
    return this.service.overlayRef;
  }
  /**
   * фокус на селекте
   * @type {boolean}
   */
  public focused: boolean;
  /**
   * Для проверки валидности
   * при использовании в форме
   * @type {boolean}
   */
  public get valid(): boolean {
    if (this.required && !this.disabled) {
      return this.checkArrayLength(this.selectedOptions);
    }
    return true;
  }
  /**
   * Устанавливает класс для стилизации селекта
   * в состоянии, когда элементы выбраны
   * @type {boolean}
   */
  public get isDirty(): boolean {
    return this.checkArrayLength(this.selectedOptions);
  }
  /**
   * Имя первого выбранного элемента
   * @type {string}
   */
  public get firstSelectedOptionName(): string {
    if (this.selectedAll) { return 'All'; }
    return this.checkArrayLength(this.selectedOptions) ? _.first(this.selectedOptions)[this.displayName] : null;
  }
  /**
   * Имя первого выбранного option
   * @type {string}
   */
  public set firstSelectedOptionName(name: string) {
    this.firstSelectedOptionName = name;
  }
  /**
   * Устанавливает класс для стилизации каунта
   * выбранных элементов при множественном выборе
   * Появляется только когда выбрано более 1ого элемента
   * @type {boolean}
   */
  public get setShowClassForMultipleText() {
    if (!this.multiple || this.selectedAll) { return false; }

    return this.checkArrayLength(this.selectedOptions) && this.selectedOptions.length > 1;
  }
  /**
   * Флаг при всех выбранных элементах
   * @type {string}
   */
  public get selectedAll(): boolean {
    if (!this.multiple) { return false; }

    return this.checkArrayLength(this.selectedOptions) && this.selectedOptions.length === this.options.length;
  }
  /**
   * Устанавливает класс для стилизации кнопки стрелочки селекта
   * Поворачивает ее вверх если панель открыта
   * @type {boolean}
   */
  public get setUpClassForArrowIcon() {
    return this.overlayRef && this.overlayRef.hasAttached();
  }
  /**
   * Устанавливает класс для стилизации кнопки стрелочки селекта
   * Скрывает ее
   * @type {boolean}
   */
  public get setHideClassForArrowIcon() {
    return this.setShowClassForClearIcon;
  }
  /**
   * Устанавливает класс для стилизации кнопки крестика
   * @type {boolean}
   */
  public get setShowClassForClearIcon(): boolean {
    return this.checkArrayLength(this.selectedOptions)
      && !this.setUpClassForArrowIcon && (this.multiple || this.singleSelectClearingEnable);
  }

  constructor(
    private service: AppMultiselectService,
    private overlayService: AppMultiselectOverlayService,
    private changeDetection: ChangeDetectorRef
  ) {
    this.overlaySubs = [];

    /** Основные поля по дефолту */
    this.required = false;
    this.disabled = false;
    this.simpleFilter = false;
    /** Метка над полем */
    this.label = LocaleText.label;
    /** Наименование инпута для формы */
    this.inputName = DEFAULT_INPUTNAME;
    this.placeholder = LocaleText.placeholder;
    this.materialTheme = DEFAULT_MATERIAL_THEME;

    this.options = [];
    this.selectedOptions = [];
    this.displayName = 'name';
    this.sortField = this.displayName;
    this.searchParamNameForServerSideSearching = 'search';
    this.selectAllPlaceholder = LocaleText.selectAll;
    this.inputTextColorClass = 'default';

    /** Список по дефолту */
    this.options = this.service.setDefaultOptions();

    /** События */
    this.optionSelected = new EventEmitter<any>();
    this.selectedOptionsChange = new EventEmitter<any[]>();
    this.panelClose = new EventEmitter<void>();
  }

  /**
   * Поле поиска в панели
   * @type {MatFormField}
   */
  @ViewChild('multiselectInput', { static: false }) multiselectInput?: ElementRef;


  /** Обновление длинны overlay отнительно элемента */
  @HostListener('window:resize')
  handleWindowResizeEvent(): void {
    if (this.overlayRef) {
      this.overlayRef.updateSize({
        width: this.multiselectElement.nativeElement.getBoundingClientRect().width
      });
      this.overlayRef.updatePosition();
    }
  }

  /**
   * Отписываться не нужно, умирает с компонентом
   * Слушает нажатие esc и закрывает окно
   * @param {KeyboardEvent} event Событие
   *
   * @returns {void}
   */
  @HostListener('document:keyup.escape', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    this.closePanel();

    event.stopPropagation();
  }

  /**
   * Change data and update
   * @param changes Input data from parent
   */
  public ngOnChanges(changes: { [propertyName: string]: SimpleChange }): void {

    this.changeDetection.detectChanges();
  }

  /**
   * Инициализация
   * @returns {void}
   */
  public ngOnInit(): void {
    this.disabled = this.disabled != null ? this.disabled : false;
    this.required = this.required != null ? this.required : false;
    this.simpleFilter = this.simpleFilter != null ? this.simpleFilter : false;
    this.labelVisible = this.labelVisible != null ? this.labelVisible : false;
    this.label = this.label != null ? this.label : LocaleText.label;
    this.inputName = this.inputName != null ? this.inputName : DEFAULT_INPUTNAME;
    this.placeholder = this.placeholder != null ? this.placeholder : LocaleText.placeholder;
    this.materialTheme = this.materialTheme != null ? this.materialTheme : DEFAULT_MATERIAL_THEME;
    this.styleClass = this.styleClass != null ? this.styleClass : 'app-default__multiselect';
    this.shadowStyleClass = this.shadowStyleClass != null ? this.shadowStyleClass : 'app-multiselect__multiselect--shadow';
    this.singleSelectClearingEnable = this.singleSelectClearingEnable != null ? this.singleSelectClearingEnable : false;
    this.inputTextColorClass = this.inputTextColorClass != null ? this.inputTextColorClass : 'default';
    /** Панель */
    this.overlaySize = this.overlaySize != null ? this.overlaySize : 20;
    this.options = this.options != null ? this.options : this.service.setDefaultOptions();
    this.selectedOptions = this.selectedOptions != null ? this.selectedOptions : [];
    this.displayName = this.displayName != null ? this.displayName : 'name';
    this.sortField = this.sortField != null ? this.sortField : this.displayName;
    this.searchParamNameForServerSideSearching =
      this.searchParamNameForServerSideSearching != null ? this.searchParamNameForServerSideSearching : 'search';
    this.searchEnable = this.searchEnable != null ? this.searchEnable : false;
    this.searchPlaceholder = this.searchPlaceholder != null ? this.searchPlaceholder : `${LocaleText.search}...`;
    this.multiple = this.multiple != null ? this.multiple : false;
    this.notFoundTitle = this.notFoundTitle != null ? this.notFoundTitle : null;
    this.optionsLimitEnable = this.optionsLimitEnable != null ? this.optionsLimitEnable : false;
    this.optionsLimit = this.optionsLimit != null ? this.optionsLimit : 10;
    this.serverSideSearchEnable = this.serverSideSearchEnable != null ? this.serverSideSearchEnable : false;
    this.searchEndpoint = this.searchEndpoint != null ? this.searchEndpoint : null;
    this.tooltipVisible = this.tooltipVisible != null ? this.tooltipVisible : false;

    this.selectAll = this.selectAll != null ? this.selectAll : false;
    this.selectAllPlaceholder = this.selectAllPlaceholder != null ? this.selectAllPlaceholder : LocaleText.selectAll;

    this.panelClass = this.panelClass != null ? this.panelClass : null;
  }

  /**
   * Уничтожение компонента
   * @returns {void}
   */
  public ngOnDestroy(): void {
    this.overlayUnsubscribe();

    this.disabled = null;
    this.required = null;
    this.simpleFilter = null;
    this.labelVisible = null;
    this.label = null;
    this.inputName = null;
    this.placeholder = null;
    this.materialTheme = null;
    this.styleClass = null;
    this.shadowStyleClass = null;
    this.singleSelectClearingEnable = null;
    this.inputTextColorClass = null;
    /** Панель */
    this.overlaySize = null;
    this.options = null;
    this.selectedOptions = null;
    this.searchEnable = null;
    this.searchPlaceholder = null;
    this.multiple = null;
    this.notFoundTitle = null;
    this.displayName = null;
    this.sortField = null;
    this.optionsLimitEnable = null;
    this.optionsLimit = null;
    this.serverSideSearchEnable = null;
    this.searchEndpoint = null;
    this.tooltipVisible = null;

    this.selectAll = null;
    this.selectAllPlaceholder = null;

    this.panelClass = null;
  }

  // ngAfterViewChecked(): void {
  //   console.log('f');
  //   this.changeDetection.detectChanges();
  // }

  /**
   * Метод открытия overlay
   * @returns {void}
   */
  public onOpenPanel(): void {

    if (this.disabled || this.overlayRef && this.overlayRef.hasAttached()) {
      this.closePanel();
      return;
    }

    if (!this.multiselectElement) {
      return;
    }

    // Сортировка списков
    if (this.multiple) {
      this.options = this.moveSelectedItemsToTopList(this.options, this.selectedOptions);
    }

    // Цепляемся к элементу, указываем
    // стратегию выбора позиции относительно элемента
    let positionStrategy = this.service.getPositionStrategy(this.multiselectElement);

    // стратегия скроллинга
    let scrollStrategy = this.service.getScrollStrategy();

    this.service.createOverlay(
      {
        disabled: this.disabled,
        simpleFilter: this.simpleFilter,
        overlaySize: this.overlaySize,
        options: this.options,
        selectedOptions: this.selectedOptions,
        displayName: this.displayName,
        sortField: this.sortField,
        searchEnable: this.searchEnable,
        searchPlaceholder: this.searchPlaceholder,
        multiple: this.multiple,
        notFoundTitle: this.notFoundTitle,
        optionsLimitEnable: this.optionsLimitEnable,
        optionsLimit: this.optionsLimit,
        serverSideSearchEnable: this.serverSideSearchEnable,
        searchEndpoint: this.searchEndpoint,
        searchParamNameForServerSideSearching: this.searchParamNameForServerSideSearching,
        tooltipVisible: this.tooltipVisible,
        selectAll: this.selectAll,
        selectAllPlaceholder: this.selectAllPlaceholder,
        panelClass: this.panelClass
      },
      new OverlayConfig({
        positionStrategy: positionStrategy,
        scrollStrategy: scrollStrategy,
        hasBackdrop: true,
        backdropClass: 'app-multiselect-backdrop',
        width: this.multiselectElement.nativeElement.getBoundingClientRect().width
      })
    );

    this.openPanel();
  }

  /**
   * Метод удаления всех выбранных элементов
   * @param {Event} clickEvent Событие для прекращения
   * дальнейшей передачи текущего события
   *
   * @returns {void}
   */
  public onDeleteOptions(clickEvent?: Event): void {
    /** Прекращение дальнейшей передачи текущего события */
    if (clickEvent) { clickEvent.stopPropagation(); }

    if (this.disabled) { return; }

    this.deleteSelectedOption();
  }

  /**
   * Метод проверки массива на его наличие и длину
   * @param {any[]} array Массив для проверки длины
   *
   * @returns {boolean} результат - удовлетворяет ли массив условию
   */
  public checkArrayLength(array: any[]): boolean {
    return (array && array.length) ? true : false;
  }

  /**
   * Метод очищает поле фильтра и закрывает панель
   * @returns {void}
   */
  private deleteSelectedOption(): void {
    this.selectedOptions = [];

    // Сортировка списков
    if (this.multiple) {
      this.options = this.moveSelectedItemsToTopList(this.options, this.selectedOptions);
    }

    this.selectedOptionsChange.emit(this.selectedOptions);
    this.optionSelected.emit(null);
  }

  /**
   * Отписки
   * @returns {void}
   */
  private overlayUnsubscribe(): void {
    if (this.overlaySubs) {
      this.overlaySubs.forEach((s: Subscription) => s.unsubscribe());
      this.overlaySubs = [];
    }
  }

  /**
   * Открытие overlay
   * @returns {void}
   */
  private openPanel(): void {

    this.service.openPanel();

    /** Событие передает выбранный элемент */
    const optionSub = this.overlayService.selectOption
      .subscribe((option: any) => {

        this.optionSelected.emit(option);

        if (!this.multiple) {
          this.closePanel();
        }

      });

    /** Событие передает все выбранные элементы (для мультиселекта) */
    const optionsSub = this.overlayService.selectedOptions
      .subscribe((selectedOptions: any[]) => {

        this.selectedOptions = selectedOptions;
        this.selectedOptionsChange.emit(selectedOptions);

      });

    const panelCloseSub = this.overlayRef.backdropClick()
      .subscribe(() => {
        this.closePanel();
      });

    this.overlaySubs.push(optionSub);
    this.overlaySubs.push(optionsSub);
    this.overlaySubs.push(panelCloseSub);

    this.changeDetection.detectChanges();
  }

  /**
   * Закрытие overlay
   * @returns {void}
   */
  private closePanel(): void {
    this.panelClose.emit();
    this.service.closePanel();
    this.overlayUnsubscribe();

    this.changeDetection.detectChanges();

    // setTimeout(() => {
    //   if (this.multiselectInput) { this.multiselectInput.nativeElement.focus(); }
    // }, 0); 
  }

  /**
   * Метод перемещения выбранных элементов в начало списка
   * или возвращение отменённых элементов на их место в общем списке
   * @param {any[]} list Общий список элементов
   * @param {any[]} selectedList Список выбранных элементов
   * @param {string} sortField Поле для сортировки
   *
   * @returns {void}
   */
  private moveSelectedItemsToTopList(list: any[], selectedList: any[], sortField: string = this.sortField): any[] {

    if (!this.checkArrayLength(list)) {
      return [];
    }

    if (!this.checkArrayLength(selectedList)) {
      list = _.sortBy(list, (item: any) => item[sortField] != null ? item[sortField].toString().toLowerCase() : '');
      return list;
    }

    // Сортировка списков
    list = _.sortBy(list, (item: any) => item[sortField] != null ? item[sortField].toString().toLowerCase() : '');
    selectedList = _.sortBy(selectedList, (item: any) => item[sortField] != null ? item[sortField].toString().toLowerCase() : '');

    // Удаление из общего списка выбранных элементов
    list = _.difference(list, selectedList);

    // Объединение списков.
    // В первую очередь выбранные элементы
    list = selectedList.concat(list);

    return list;
  }
}
