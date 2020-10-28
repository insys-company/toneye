import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy, HostListener, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChange } from '@angular/core';
import { AppDatepickerService } from './app-datepicker.service';
import { AppDatepickerOverlayService } from './app-datepicker-overlay/app-datepicker-overlay.service';
import { OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { MIN, MAX } from './app-datepicker-overlay/app-datepicker-overlay.component';
import { Subscription } from 'rxjs';
import 'rxjs/add/operator/debounceTime';
import _ from 'underscore';

export type MaterialType = 'legacy' | 'standard' | 'fill' | 'outline';

const DEFAULT_LABEL = 'label';
const DEFAULT_INPUTNAME = 'minmax';
const DEFAULT_PLACEHOLDER = 'placeholder';
const DEFAULT_MATERIAL_THEME = 'outline';
@Component({
  selector: 'app-datepicker',
  templateUrl: './app-datepicker.component.html',
  styleUrls: ['./app-datepicker.component.scss'],
  providers: [ AppDatepickerService ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppDatepickerComponent implements OnInit, OnDestroy {
  /**
   * Элемента для расчета позиции overlay
   * @type {ElementRef}
   */
  @ViewChild('minmaxElement') minmaxElement?: ElementRef;

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


  /** ДЛЯ ОТКРЫВАЮЩЕЙСЯ ПАНЕЛИ СЕЛЕКТА */
  /**
   * From date
   */
  @Input() public fromDate: string;
  /**
   * To date
   */
  @Input() public toDate: string;

  /**
   * Для поля
   * @type {string}
   */
  @Input() public fromPlaceholder: string;
  /**
   * Для поля
   * @type {string}
   */
  @Input() public toPlaceholder: string;

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
  @Output() periodSelected: EventEmitter<{from: string, to: string}>;
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
      return this.fromDate != null || this.toDate != null;
    }
    return true;
  }
  /**
   * Устанавливает класс для стилизации селекта
   * в состоянии, когда элементы выбраны
   * @type {boolean}
   */
  public get isDirty(): boolean {
    return this.fromDate != null || this.toDate != null;
  }
  /**
   * Имя первого выбранного элемента
   * @type {string}
   */
  public get firstSelectedOptionName(): string {
    return this.placeholder;
  }
  /**
   * Имя первого выбранного option
   * @type {string}
   */
  public set firstSelectedOptionName(name: string) {
    this.firstSelectedOptionName = name;
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
    return ((this.fromDate != null && this.fromDate != '') || (this.toDate != null && this.toDate != '')) && !this.setUpClassForArrowIcon;
  }

  constructor(
    private service: AppDatepickerService,
    private overlayService: AppDatepickerOverlayService,
    private changeDetection: ChangeDetectorRef
  ) {
    this.overlaySubs = [];

    /** Основные поля по дефолту */
    this.required = false;
    this.disabled = false;
    /** Метка над полем */
    this.label = DEFAULT_LABEL;
    /** Наименование инпута для формы */
    this.inputName = DEFAULT_INPUTNAME;
    this.placeholder = DEFAULT_PLACEHOLDER;
    this.materialTheme = DEFAULT_MATERIAL_THEME;


    /** События */
    this.periodSelected = new EventEmitter<{from: string, to: string}>();
    this.panelClose = new EventEmitter<void>();
  }

  /**
   * Поле поиска в панели
   * @type {MatFormField}
   */
  @ViewChild('minmaxInput', { static: false }) minmaxInput?: ElementRef;


  /** Обновление длинны overlay отнительно элемента */
  @HostListener('window:resize')
  handleWindowResizeEvent(): void {
    if (this.overlayRef) {
      this.overlayRef.updateSize({
        width: this.minmaxElement.nativeElement.getBoundingClientRect().width
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
    this.labelVisible = this.labelVisible != null ? this.labelVisible : false;
    this.label = this.label != null ? this.label : DEFAULT_LABEL;
    this.inputName = this.inputName != null ? this.inputName : DEFAULT_INPUTNAME;
    this.placeholder = this.placeholder != null ? this.placeholder : DEFAULT_PLACEHOLDER;
    this.materialTheme = this.materialTheme != null ? this.materialTheme : DEFAULT_MATERIAL_THEME;
    this.styleClass = this.styleClass != null ? this.styleClass : 'app-default__multiselect';
    this.shadowStyleClass = this.shadowStyleClass != null ? this.shadowStyleClass : 'app-multiselect__multiselect--shadow';
    this.singleSelectClearingEnable = this.singleSelectClearingEnable != null ? this.singleSelectClearingEnable : false;
    /** Панель */
    this.fromDate = this.fromDate != null ? this.fromDate : null;
    this.toDate = this.toDate != null ? this.toDate : null;
    this.panelClass = this.panelClass != null ? this.panelClass : null;
    this.fromPlaceholder = this.fromPlaceholder != null ? this.fromPlaceholder : MIN;
    this.toPlaceholder = this.toPlaceholder != null ? this.toPlaceholder : MAX;
  }

  /**
   * Уничтожение компонента
   * @returns {void}
   */
  public ngOnDestroy(): void {
    this.overlayUnsubscribe();

    this.disabled = null;
    this.required = null;
    this.labelVisible = null;
    this.label = null;
    this.inputName = null;
    this.placeholder = null;
    this.materialTheme = null;
    this.styleClass = null;
    this.shadowStyleClass = null;
    this.singleSelectClearingEnable = null;
    /** Панель */
    this.fromDate = null;
    this.toDate = null;
    this.fromPlaceholder = null;
    this.toPlaceholder = null;

    this.panelClass = null;
  }

  /**
   * Метод открытия overlay
   * @returns {void}
   */
  public onOpenPanel(): void {

    if (this.disabled || this.overlayRef && this.overlayRef.hasAttached()) {
      this.closePanel();
      return;
    }

    if (!this.minmaxElement) {
      return;
    }

    // Цепляемся к элементу, указываем
    // стратегию выбора позиции относительно элемента
    let positionStrategy = this.service.getPositionStrategy(this.minmaxElement);

    // стратегия скроллинга
    let scrollStrategy = this.service.getScrollStrategy();

    this.service.createOverlay(
      {
        disabled: this.disabled,
        fromDate: this.fromDate,
        toDate: this.toDate,
        fromPlaceholder: this.fromPlaceholder,
        toPlaceholder: this.toPlaceholder,
        panelClass: this.panelClass
      },
      new OverlayConfig({
        positionStrategy: positionStrategy,
        scrollStrategy: scrollStrategy,
        hasBackdrop: true,
        backdropClass: 'app-multiselect-backdrop',
        width: this.minmaxElement.nativeElement.getBoundingClientRect().width
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
    this.fromDate = null;
    this.toDate = null;
    this.periodSelected.emit({from: null, to: null});
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
    const optionSub = this.overlayService.periodSelect
      .subscribe((selectedOptions: any) => {

        this.fromDate = selectedOptions.from;
        this.toDate = selectedOptions.to;

        this.periodSelected.emit({from: this.fromDate, to: this.toDate});

        this.closePanel();

      });

    const panelCloseSub = this.overlayRef.backdropClick()
      .subscribe(() => {
        this.closePanel();
      });

    this.overlaySubs.push(optionSub);
    this.overlaySubs.push(panelCloseSub);
  }

  /**
   * Закрытие overlay
   * @returns {void}
   */
  private closePanel(): void {
    this.panelClose.emit();
    this.service.closePanel();
    this.overlayUnsubscribe();

    setTimeout(() => {
      if (this.minmaxInput) { this.minmaxInput.nativeElement.focus(); }
    }, 0); 
  }
}
