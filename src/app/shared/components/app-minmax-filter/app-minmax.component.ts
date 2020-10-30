import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy, HostListener, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChange } from '@angular/core';
import { AppMinmaxService } from './app-minmax.service';
import { AppMinmaxOverlayService } from './app-minmax-overlay/app-minmax-overlay.service';
import { OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { Subscription } from 'rxjs';
import 'rxjs/add/operator/debounceTime';
import _ from 'underscore';
import { LocaleText } from 'src/locale/locale';

export type MaterialType = 'legacy' | 'standard' | 'fill' | 'outline';

const DEFAULT_INPUTNAME = 'minmax';
const DEFAULT_MATERIAL_THEME = 'outline';
@Component({
  selector: 'app-minmax',
  templateUrl: './app-minmax.component.html',
  styleUrls: ['./app-minmax.component.scss'],
  providers: [ AppMinmaxService ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppMinmaxComponent implements OnInit, OnDestroy {
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
   * min
   */
  @Input() public min: string;
  /**
   * max
   */
  @Input() public max: string;

  /**
   * Для поля
   * @type {string}
   */
  @Input() public minPlaceholder: string;
  /**
   * Для поля
   * @type {string}
   */
  @Input() public maxPlaceholder: string;

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
  @Output() periodSelected: EventEmitter<{ min: string, max: string }>;
  /**
   * Событие генерируемое при закрытии панели
   * @type {EventEmitter<>}
   */
  @Output() panelClose: EventEmitter<void>;

  /** Общие тексты для страниц */
  public locale = {
    placeholder: LocaleText.searchPlaceholder,
  };

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
      return this.min != null || this.max != null;
    }
    return true;
  }
  /**
   * Устанавливает класс для стилизации селекта
   * в состоянии, когда элементы выбраны
   * @type {boolean}
   */
  public get isDirty(): boolean {
    return this.min != null || this.max != null;
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
    return ((this.min != null && this.min != '') || (this.max != null && this.max != '')) && !this.setUpClassForArrowIcon;
  }

  constructor(
    private service: AppMinmaxService,
    private overlayService: AppMinmaxOverlayService,
    private changeDetection: ChangeDetectorRef
  ) {
    this.overlaySubs = [];

    /** Основные поля по дефолту */
    this.required = false;
    this.disabled = false;
    /** Метка над полем */
    this.label = LocaleText.label;
    /** Наименование инпута для формы */
    this.inputName = DEFAULT_INPUTNAME;
    this.placeholder = LocaleText.placeholder;
    this.materialTheme = DEFAULT_MATERIAL_THEME;


    /** События */
    this.periodSelected = new EventEmitter<{ min: string, max: string }>();
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
    this.label = this.label != null ? this.label : LocaleText.label;
    this.inputName = this.inputName != null ? this.inputName : DEFAULT_INPUTNAME;
    this.placeholder = this.placeholder != null ? this.placeholder : LocaleText.placeholder;
    this.materialTheme = this.materialTheme != null ? this.materialTheme : DEFAULT_MATERIAL_THEME;
    this.styleClass = this.styleClass != null ? this.styleClass : 'app-default__multiselect';
    this.shadowStyleClass = this.shadowStyleClass != null ? this.shadowStyleClass : 'app-multiselect__multiselect--shadow';
    this.singleSelectClearingEnable = this.singleSelectClearingEnable != null ? this.singleSelectClearingEnable : false;
    /** Панель */
    this.min = this.min != null ? this.min : null;
    this.max = this.max != null ? this.max : null;
    this.panelClass = this.panelClass != null ? this.panelClass : null;
    this.minPlaceholder = this.minPlaceholder != null ? this.minPlaceholder : LocaleText.min;
    this.maxPlaceholder = this.maxPlaceholder != null ? this.maxPlaceholder : LocaleText.max;
  }

  /**
   * Уничтожение компонента
   * @returns {void}
   */
  public ngOnDestroy(): void {
    this.overlayUnsubscribe();

    this.locale = null;
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
    this.min = null;
    this.max = null;
    this.minPlaceholder = null;
    this.maxPlaceholder = null;

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
        min: this.min,
        max: this.max,
        minPlaceholder: this.minPlaceholder,
        maxPlaceholder: this.maxPlaceholder,
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
    this.min = null;
    this.max = null;
    this.periodSelected.emit({min: null, max: null});
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

        this.min = selectedOptions.min;
        this.max = selectedOptions.max;

        this.periodSelected.emit({min: this.min, max: this.max});

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
