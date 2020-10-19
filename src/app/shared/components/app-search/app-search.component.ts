// import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy, HostListener, OnInit } from '@angular/core';
// import { AppMultiselectService } from './app-multiselect.service';
// import { AppMultiselectOverlayService } from './app-multiselect-overlay/app-multiselect-overlay.service';
// import { OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
// import { Subscription } from 'rxjs';
// import 'rxjs/add/operator/debounceTime';
// import _ from 'underscore';
// import { Block, Message, Transaction } from 'src/app/api';

// export type MaterialType = 'legacy' | 'standard' | 'fill' | 'outline';

// const DEFAULT_LABEL = 'label';
// const DEFAULT_INPUTNAME = 'multiselect';
// const DEFAULT_PLACEHOLDER = 'placeholder';
// const DEFAULT_MATERIAL_THEME = 'outline';
// @Component({
//   selector: 'app-search',
//   templateUrl: './app-search.component.html',
//   styleUrls: ['./app-search.component.scss'],
//   providers: [ AppMultiselectService ]
// })
// export class AppSearchComponent implements OnInit, OnDestroy {
//   /**
//    * Элемента для расчета позиции overlay
//    */
//   @ViewChild('multiselectElement') multiselectElement?: ElementRef;

//   /** ДЛЯ ОТКРЫВАЮЩЕЙСЯ ПАНЕЛИ СЕЛЕКТА */
//   /**
//    * Список элементов для выбора
//    */
//   @Input() blocks: Block[];
//   /**
//    * Список элементов для выбора
//    */
//   @Input() messages: Message[];
//   /**
//    * Список элементов для выбора
//    */
//   @Input() transactions: Transaction[];
//   /**
//    * Текст для случая когда не найдено ничего по поиску
//    */
//   @Input() notFoundTitle: string;

//   /**
//    * Search
//    */
//   @Output() searchChange: EventEmitter<string>;

//   /**
//    * Для подписок
//    */
//   private overlaySubs: Subscription[];
//   /**
//    * фокус на селекте
//    */
//   public multiselectFocused: boolean;
//   /**
//    * фокус на селекте
//    */
//   public search: string;

//   /**
//    * Для overlay
//    */
//   private get overlayRef(): OverlayRef {
//     return this.service.overlayRef;
//   }
//   /**
//    * Устанавливает класс для стилизации селекта
//    * в состоянии, когда элементы выбраны
//    */
//   public get isDirty(): boolean {
//     return this.checkString(this.search);
//   }

//   /**
//    * Устанавливает класс для стилизации кнопки стрелочки селекта
//    * Поворачивает ее вверх если панель открыта
//    */
//   get setUpClassForArrowIcon() {
//     return this.overlayRef && this.overlayRef.hasAttached();
//   }
//   /**
//    * Устанавливает класс для стилизации кнопки стрелочки селекта
//    * Скрывает ее
//    */
//   get setHideClassForArrowIcon() {
//     return this.setShowClassForClearIcon;
//   }
//   /**
//    * Устанавливает класс для стилизации кнопки крестика
//    * @type {boolean}
//    */
//   get setShowClassForClearIcon(): boolean {
//     return this.checkString(this.search);
//   }

//   constructor(
//     private service: AppMultiselectService,
//     private overlayService: AppMultiselectOverlayService,
//   ) {
//     this.overlaySubs = [];

//     /** Основные поля по дефолту */
//     this.required = false;
//     this.disabled = false;
//     this.simpleFilter = false;
//     /** Метка над полем */
//     this.label = DEFAULT_LABEL;
//     /** Наименование инпута для формы */
//     this.inputName = DEFAULT_INPUTNAME;
//     this.placeholder = DEFAULT_PLACEHOLDER;
//     this.materialTheme = DEFAULT_MATERIAL_THEME;

//     this.options = [];
//     this.selectedOptions = [];
//     this.displayName = 'name';
//     this.sortField = this.displayName;
//     this.searchParamNameForServerSideSearching = 'search';
//     this.selectAllPlaceholder = 'Select All';
//     this.inputTextColorClass = 'default';

//     /** Список по дефолту */
//     this.options = this.service.setDefaultOptions();

//     /** События */
//     this.optionSelected = new EventEmitter<any>();
//     this.selectedOptionsChange = new EventEmitter<any[]>();
//     this.panelClose = new EventEmitter<void>();
//   }

//   /**
//    * Поле поиска в панели
//    * @type {MatFormField}
//    */
//   @ViewChild('multiselectInput', { static: false }) multiselectInput?: ElementRef;


//   /** Обновление длинны overlay отнительно элемента */
//   @HostListener('window:resize')
//   handleWindowResizeEvent(): void {
//     if (this.overlayRef) {
//       this.overlayRef.updateSize({
//         width: this.multiselectElement.nativeElement.getBoundingClientRect().width
//       });
//       this.overlayRef.updatePosition();
//     }
//   }

//   /**
//    * Отписываться не нужно, умирает с компонентом
//    * Слушает нажатие esc и закрывает окно
//    * @param {KeyboardEvent} event Событие
//    *
//    * @returns {void}
//    */
//   @HostListener('document:keyup.escape', ['$event'])
//   handleKeyboardEvent(event: KeyboardEvent): void {
//     this.closePanel();

//     event.stopPropagation();
//   }

//   /**
//    * Инициализация
//    * @returns {void}
//    */
//   ngOnInit(): void {
//     this.disabled = this.disabled != null ? this.disabled : false;
//     this.required = this.required != null ? this.required : false;
//     this.simpleFilter = this.simpleFilter != null ? this.simpleFilter : false;
//     this.labelVisible = this.labelVisible != null ? this.labelVisible : false;
//     this.label = this.label != null ? this.label : DEFAULT_LABEL;
//     this.inputName = this.inputName != null ? this.inputName : DEFAULT_INPUTNAME;
//     this.placeholder = this.placeholder != null ? this.placeholder : DEFAULT_PLACEHOLDER;
//     this.materialTheme = this.materialTheme != null ? this.materialTheme : DEFAULT_MATERIAL_THEME;
//     this.styleClass = this.styleClass != null ? this.styleClass : 'app-default__multiselect';
//     this.shadowStyleClass = this.shadowStyleClass != null ? this.shadowStyleClass : 'app-multiselect__multiselect--shadow';
//     this.singleSelectClearingEnable = this.singleSelectClearingEnable != null ? this.singleSelectClearingEnable : false;
//     this.inputTextColorClass = this.inputTextColorClass != null ? this.inputTextColorClass : 'default';
//     /** Панель */
//     this.overlaySize = this.overlaySize != null ? this.overlaySize : 20;
//     this.options = this.options != null ? this.options : this.service.setDefaultOptions();
//     this.selectedOptions = this.selectedOptions != null ? this.selectedOptions : [];
//     this.displayName = this.displayName != null ? this.displayName : 'name';
//     this.sortField = this.sortField != null ? this.sortField : this.displayName;
//     this.searchParamNameForServerSideSearching =
//       this.searchParamNameForServerSideSearching != null ? this.searchParamNameForServerSideSearching : 'search';
//     this.searchEnable = this.searchEnable != null ? this.searchEnable : false;
//     this.searchPlaceholder = this.searchPlaceholder != null ? this.searchPlaceholder : null;
//     this.multiple = this.multiple != null ? this.multiple : false;
//     this.notFoundTitle = this.notFoundTitle != null ? this.notFoundTitle : null;
//     this.optionsLimitEnable = this.optionsLimitEnable != null ? this.optionsLimitEnable : false;
//     this.optionsLimit = this.optionsLimit != null ? this.optionsLimit : 10;
//     this.serverSideSearchEnable = this.serverSideSearchEnable != null ? this.serverSideSearchEnable : false;
//     this.searchEndpoint = this.searchEndpoint != null ? this.searchEndpoint : null;
//     this.tooltipVisible = this.tooltipVisible != null ? this.tooltipVisible : false;

//     this.selectAll = this.selectAll != null ? this.selectAll : false;
//     this.selectAllPlaceholder = this.selectAllPlaceholder != null ? this.selectAllPlaceholder : 'Select All';

//     this.panelClass = this.panelClass != null ? this.panelClass : null;
//   }

//   /**
//    * Уничтожение компонента
//    * @returns {void}
//    */
//   ngOnDestroy(): void {
//     this.overlayUnsubscribe();

//     this.disabled = null;
//     this.required = null;
//     this.simpleFilter = null;
//     this.labelVisible = null;
//     this.label = null;
//     this.inputName = null;
//     this.placeholder = null;
//     this.materialTheme = null;
//     this.styleClass = null;
//     this.shadowStyleClass = null;
//     this.singleSelectClearingEnable = null;
//     this.inputTextColorClass = null;
//     /** Панель */
//     this.overlaySize = null;
//     this.options = null;
//     this.selectedOptions = null;
//     this.searchEnable = null;
//     this.searchPlaceholder = null;
//     this.multiple = null;
//     this.notFoundTitle = null;
//     this.displayName = null;
//     this.sortField = null;
//     this.optionsLimitEnable = null;
//     this.optionsLimit = null;
//     this.serverSideSearchEnable = null;
//     this.searchEndpoint = null;
//     this.tooltipVisible = null;

//     this.selectAll = null;
//     this.selectAllPlaceholder = null;

//     this.panelClass = null;
//   }

//   /**
//    * Метод открытия overlay
//    * @returns {void}
//    */
//   onOpenPanel(): void {

//     if (this.disabled || this.overlayRef && this.overlayRef.hasAttached()) {
//       this.closePanel();
//       return;
//     }

//     if (!this.multiselectElement) {
//       return;
//     }

//     // Сортировка списков
//     if (this.multiple) {
//       this.options = this.moveSelectedItemsToTopList(this.options, this.selectedOptions);
//     }

//     // Цепляемся к элементу, указываем
//     // стратегию выбора позиции относительно элемента
//     let positionStrategy = this.service.getPositionStrategy(this.multiselectElement);

//     // стратегия скроллинга
//     let scrollStrategy = this.service.getScrollStrategy();

//     this.service.createOverlay(
//       {
//         disabled: this.disabled,
//         simpleFilter: this.simpleFilter,
//         overlaySize: this.overlaySize,
//         options: this.options,
//         selectedOptions: this.selectedOptions,
//         displayName: this.displayName,
//         sortField: this.sortField,
//         searchEnable: this.searchEnable,
//         searchPlaceholder: this.searchPlaceholder,
//         multiple: this.multiple,
//         notFoundTitle: this.notFoundTitle,
//         optionsLimitEnable: this.optionsLimitEnable,
//         optionsLimit: this.optionsLimit,
//         serverSideSearchEnable: this.serverSideSearchEnable,
//         searchEndpoint: this.searchEndpoint,
//         searchParamNameForServerSideSearching: this.searchParamNameForServerSideSearching,
//         tooltipVisible: this.tooltipVisible,
//         selectAll: this.selectAll,
//         selectAllPlaceholder: this.selectAllPlaceholder,
//         panelClass: this.panelClass
//       },
//       new OverlayConfig({
//         positionStrategy: positionStrategy,
//         scrollStrategy: scrollStrategy,
//         hasBackdrop: true,
//         backdropClass: 'app-multiselect-backdrop',
//         width: this.multiselectElement.nativeElement.getBoundingClientRect().width
//       })
//     );

//     this.openPanel();
//   }

//   /**
//    * Метод удаления всех выбранных элементов
//    * @param {Event} clickEvent Событие для прекращения
//    * дальнейшей передачи текущего события
//    *
//    * @returns {void}
//    */
//   onDeleteOptions(clickEvent?: Event): void {
//     /** Прекращение дальнейшей передачи текущего события */
//     if (clickEvent) { clickEvent.stopPropagation(); }

//     if (this.disabled) { return; }

//     this.deleteSelectedOption();
//   }

//   /**
//    * Метод проверки массива на его наличие и длину
//    * @param {any[]} array Массив для проверки длины
//    *
//    * @returns {boolean} результат - удовлетворяет ли массив условию
//    */
//   checkArrayLength(array: any[]): boolean {
//     return (array && array.length) ? true : false;
//   }

//   /**
//    * Метод проверяет строку
//    * @param {string} str Строка для проверки
//    *
//    * @returns {boolean} результат - удовлетворяет ли строка условию
//    */
//   checkString(str: string): boolean {
//     return (str && str.length) ? true : false;
//   }

//   /**
//    * Метод очищает поле фильтра и закрывает панель
//    * @returns {void}
//    */
//   private deleteSelectedOption(): void {
//     this.selectedOptions = [];

//     // Сортировка списков
//     if (this.multiple) {
//       this.options = this.moveSelectedItemsToTopList(this.options, this.selectedOptions);
//     }

//     this.selectedOptionsChange.emit(this.selectedOptions);
//     this.optionSelected.emit(null);
//   }

//   /**
//    * Отписки
//    * @returns {void}
//    */
//   private overlayUnsubscribe(): void {
//     if (this.overlaySubs) {
//       this.overlaySubs.forEach((s: Subscription) => s.unsubscribe());
//       this.overlaySubs = [];
//     }
//   }

//   /**
//    * Открытие overlay
//    * @returns {void}
//    */
//   private openPanel(): void {

//     this.service.openPanel();

//     /** Событие передает выбранный элемент */
//     const optionSub = this.overlayService.selectOption
//       .subscribe((option: any) => {

//         this.optionSelected.emit(option);

//         if (!this.multiple) {
//           this.closePanel();
//         }

//       });

//     /** Событие передает все выбранные элементы (для мультиселекта) */
//     const optionsSub = this.overlayService.selectedOptions
//       .subscribe((selectedOptions: any[]) => {

//         this.selectedOptions = selectedOptions;
//         this.selectedOptionsChange.emit(selectedOptions);

//       });

//     const panelCloseSub = this.overlayRef.backdropClick()
//       .subscribe(() => {
//         this.closePanel();
//       });

//     this.overlaySubs.push(optionSub);
//     this.overlaySubs.push(optionsSub);
//     this.overlaySubs.push(panelCloseSub);
//   }

//   /**
//    * Закрытие overlay
//    * @returns {void}
//    */
//   private closePanel(): void {
//     this.panelClose.emit();
//     this.service.closePanel();
//     this.overlayUnsubscribe();

//     setTimeout(() => {
//       if (this.multiselectInput) { this.multiselectInput.nativeElement.focus(); }
//     }, 0); 
//   }

//   /**
//    * Метод перемещения выбранных элементов в начало списка
//    * или возвращение отменённых элементов на их место в общем списке
//    * @param {any[]} list Общий список элементов
//    * @param {any[]} selectedList Список выбранных элементов
//    * @param {string} sortField Поле для сортировки
//    *
//    * @returns {void}
//    */
//   private moveSelectedItemsToTopList(list: any[], selectedList: any[], sortField: string = this.sortField): any[] {

//     if (!this.checkArrayLength(list)) {
//       return [];
//     }

//     if (!this.checkArrayLength(selectedList)) {
//       list = _.sortBy(list, (item: any) => item[sortField] != null ? item[sortField].toString().toLowerCase() : '');
//       return list;
//     }

//     // Сортировка списков
//     list = _.sortBy(list, (item: any) => item[sortField] != null ? item[sortField].toString().toLowerCase() : '');
//     selectedList = _.sortBy(selectedList, (item: any) => item[sortField] != null ? item[sortField].toString().toLowerCase() : '');

//     // Удаление из общего списка выбранных элементов
//     list = _.difference(list, selectedList);

//     // Объединение списков.
//     // В первую очередь выбранные элементы
//     list = selectedList.concat(list);

//     return list;
//   }
// }
