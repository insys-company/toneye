import { Component, ViewChild, InjectionToken, Inject, OnDestroy, OnInit, HostListener, ElementRef, AfterContentInit, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { AppMultiselectOverlayService } from './app-multiselect-overlay.service';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ItemList, SimpleDataFilter } from 'src/app/api/contracts';
import { Subscription, Subject } from 'rxjs';
import 'rxjs/add/operator/debounceTime';
import _ from 'underscore';

export const MULTISELECT_PANEL_DATA = new InjectionToken<{}>('MULTISELECT_PANEL_DATA');
const SEARCH_PLACEHOLDER = 'Search...';
const NOT_FOUND = 'Not found';
const SELECT_ALL = 'Select All';
@Component({
  selector: 'app-multiselect-overlay',
  templateUrl: './app-multiselect-overlay.component.html',
  styleUrls: ['./app-multiselect-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppMultiselectOverlayComponent implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {
  /**
   * Для отписок на запросы
   * @type {Subject<void>}
   */
  private unsubscribe: Subject<void>;
  /**
   * Подписка на изменение строки поиска
   * @type {Subject<string>}
   */
  private debouncer: Subject<string>;
  /**
   * Для подписок
   * @type {Subscription}
   */
  private overlaySub: Subscription;
  /**
   * Не изменяющийся лист, для локальной фильтрации
   * @type {any[]}
   */
  private staticOptions: any[];
  /**
   * Фокусированный элемент
   * (нужен для перемещания по списку с keyboard)
   * @type {any}
   */
  private focusedOption: any;
  /**
   * Индекс элемента в фокусе
   * @type {number}
   */
  private focusedOptionIndex: number;

  /**
   * Блокировщик
   * @type {boolean}
   */
  disabled: boolean;
  /**
   * Простой фильтр - фильтрация списка производится
   * путем поиска строки, которая начинается на `введенные символы`
   * По умолчанию фильтрацию по вхождению: возвращаются все строки в которые
   * входят введенные символы не зависимо от их позиции
   * @type {boolean}
   */
  simpleFilter: boolean;

  /**
   * Список элементов для выбора
   * @type {any[]}
   */
  options: any[];
  /**
   * Список элементов которые выбраны
   * @type {any[]}
   */
  selectedOptions: any[];
  /**
   * Имя, которое будет отображаться в списке
   * @type {string}
   */
  displayName: string;
  /**
   * Поле для сортировки списков
   * @type {string}
   */
  sortField: string;

  /**
   * Включение поиска
   * @type {boolean}
   */
  searchEnable: boolean;
  /**
   * Для поля поиска заголовок
   * @type {string}
   */
  searchPlaceholder: string;
  /**
   * Мультирежим
   * @type {boolean}
   */
  multiple: boolean;
  /**
   * Текст для случая когда не найдено ничего по поиску
   * @type {string}
   */
  notFoundTitle: string;
  /**
   * Включение лимита на выбор опций
   * @type {boolean}
   */
  optionsLimitEnable: boolean;
  /**
   * Лимит на выбор опций
   * @type {number}
   */
  optionsLimit: number;
  /**
   * Включение поиска по запросам к серверу
   * @type {boolean}
   */
  serverSideSearchEnable: boolean;
  /**
   * Эндпоинт для поиска
   * @type {string}
   */
  searchEndpoint: string;
  /**
   * Параметр, который будет отправляться на сервер при поиске
   * например search=example
   * По умолчанию search
   * @type {string}
   */
  searchParamNameForServerSideSearching: string;
  /**
   * Тултип на опциях
   * @type {boolean}
   */
  tooltipVisible: boolean;

  /**
   * Чекбокс Select All в листе
   * @type {boolean}
   */
  selectAll: boolean;
  /**
   * Наименование - чекбокса Select All в листе
   * @type {string}
   */
  selectAllPlaceholder: string;
  /**
   * Размер списка
   * @type {number}
   */
  overlaySize: number;

  /**
   * Доп класс для панели
   * @type {string}
   */
  panelClass?: string;

  /**
   * Строка поиска
   * @type {string}
   */
  search: string;
  /**
   * Устанавливает класс для стилизации иконки поиска
   * @type {boolean}
   */
  get setFocusClassForSearchIconInSearchInput(): boolean {
    return  this.searchEnable && this.multiselectSearchInput && this.multiselectSearchInput._control.focused ? true : false;
  }
  /**
   * Устанавливает класс для стилизации кнопки крестика
   * @type {boolean}
   */
  get setShowClassForClearIconInSearchInput(): boolean {
    return  this.search && this.search.length ? true : false;
  }


  constructor(
    protected service: AppMultiselectOverlayService,
    @Inject(MULTISELECT_PANEL_DATA) public data: any,
  ) {

    this.search = '';
  }

  /**
   * Поле поиска в панели
   * @type {MatFormField}
   */
  @ViewChild('multiselectSearchInput', { static: false }) multiselectSearchInput?: MatFormField;
  /**
   * Поле поиска в панели
   * @type {MatFormField}
   */
  @ViewChild('optionsPanel', { static: false }) optionsPanel?: ElementRef;

  /**
   * Отписываться не нужно, умирает с компонентом
   * Слушает нажатие esc и закрывает окно
   * @param {KeyboardEvent} event Событие
   *
   * @returns {void}
   */
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): boolean {
    if (this.searchEnable && this.multiselectSearchInput && this.multiselectSearchInput._control.focused) {

      // С поля search по enter прыгаем на список options
      if (event && event.keyCode === 13 && this.optionsPanel) {
        this.optionsPanel.nativeElement.focus();
      }

      return true;
    }

    if (!this.checkArrayLength(this.options)) {

      return false;
    }

    let key = event.keyCode;

    // space, enter, arrowup, arrowdown
    if (!(key === 32 || key === 13 || key === 38 || key === 40)) {

      key = null;

      return false;
    }

    // space, enter
    if (key === 13 || key === 32) {

      this.onSelectOption(this.focusedOption);

      return false;
    }

    // arrowup, arrowdown
    if (key === 38 || key === 40) {

      // arrowup
      if (key === 38) {

        if (this.focusedOptionIndex === 0) {
          return false;
        }

        this.focusedOptionIndex = this.focusedOptionIndex > 0 ? this.focusedOptionIndex -= 1 : 0;
      }
  
      // arrowdown
      if (key === 40) {
        /**
         * Индекс последнего элемента в списке
         * Если спикоб больше overlaySize, то берем overlaySize так как именно
         * столько элементов отображается в панели
         */
        let lastIndex = this.options.length > this.overlaySize ? this.overlaySize - 1 : this.options.length - 1;

        if (this.focusedOptionIndex === lastIndex) {

          lastIndex = null;
          return false;
        }

        this.focusedOptionIndex = this.focusedOptionIndex < lastIndex ? this.focusedOptionIndex += 1 : lastIndex;
        lastIndex = null;
      }

      this.focusedOption = this.options[this.focusedOptionIndex];

      try {

        let option = document.getElementById(`${this.focusedOptionIndex}`);
        option.scrollIntoView({ block: "center", behavior: "smooth" });

      } catch (ex) {
        console.log(ex);
      }

    }

    key = null;

    return false;
  }

  /**
   * Инициализация
   * @returns {void}
   */
  public ngOnInit(): void {
    this.focusedOptionIndex = null;
    this.overlaySize = this.data.data.overlaySize != null ? this.data.data.overlaySize : 20;
    this.disabled = this.data.data.disabled;
    this.simpleFilter = this.data.data.simpleFilter;

    this.searchEnable = this.data.data.searchEnable;
    this.searchPlaceholder = this.data.data.searchPlaceholder;
    this.multiple = this.data.data.multiple;
    this.notFoundTitle = this.data.data.notFoundTitle;
    this.optionsLimitEnable = this.data.data.optionsLimitEnable;
    this.optionsLimit = this.data.data.optionsLimit;
    this.serverSideSearchEnable = this.data.data.serverSideSearchEnable;
    this.searchEndpoint = this.data.data.searchEndpoint;
    this.tooltipVisible = this.data.data.tooltipVisible;

    this.selectAll = this.data.data.selectAll;
    this.selectAllPlaceholder = this.data.data.selectAllPlaceholder;

    this.selectAllPlaceholder = this.selectAllPlaceholder
      ? this.selectAllPlaceholder
      : SELECT_ALL;

    this.panelClass = this.data.data.panelClass;

    this.searchPlaceholder = this.searchPlaceholder
      ? this.searchPlaceholder
      : SEARCH_PLACEHOLDER;

    if (!this.multiple) {
      this.optionsLimitEnable = false;
      this.optionsLimit = 10;
    }

    this.notFoundTitle = this.notFoundTitle
      ? this.notFoundTitle
      : NOT_FOUND;

    if (this.optionsLimitEnable && !this.optionsLimit) {
      this.optionsLimit = 10;
    }

    this.displayName = this.data.data.displayName ? this.data.data.displayName : 'name';
    this.sortField = this.data.data.sortField ? this.data.data.sortField : this.displayName;
    this.searchParamNameForServerSideSearching =
      this.data.data.searchParamNameForServerSideSearching ? this.data.data.searchParamNameForServerSideSearching : 'search';

    /** Неизменяющийся лист */
    this.staticOptions = this.data.data.options ? this.data.data.options : [];
    this.options = this.staticOptions.slice();

    this.selectedOptions = this.data.data.selectedOptions ? this.data.data.selectedOptions : [];

    if (this.searchEnable) {

      /** Поиск будет производиться запросами на сервер, а не локально */
      if (this.serverSideSearchEnable) {
        this.unsubscribe = new Subject<void>();
      }

      this.debouncer = new Subject<string>();

      /** Подписка на изменение строки поиска */
      this.overlaySub = this.debouncer
        .debounceTime(1000)
        .pipe(distinctUntilChanged())
        .subscribe((value: string) => {

          if (value !== undefined) {
            this.serverSideSearchEnable
              ? this._serverSideFilter(value)
              : this._clientSideFilter(value);
          }

        });
    }
  }

  /**
   * Обновление дом элементов после инициализации
   * @returns {void}
   */
  public ngAfterViewInit(): void {
    if (this.optionsPanel) { this.optionsPanel.nativeElement.focus(); }
  }

  /**
   * Обновление дом элементов после ngDoCheck
   * @returns {void}
   */
  public ngAfterContentInit(): void {
    this.focusedOption = this.checkArrayLength(this.selectedOptions)
     ? this.selectedOptions[this.selectedOptions.length - 1]
     : this.checkArrayLength(this.options)
      ? this.options[0]
      : null;

    if (this.focusedOption) {
      /** Поиск в обновленных данных */
      let index = _.findIndex(this.options, (_item: any) => {
        return String(this.focusedOption['id']) === String(_item['id']);
      });
    
      // Если выбранный элемент уже содерджится, то удаляем его
      this.focusedOptionIndex = index > -1 ? index : null;
      index = null;
    }
  }

  /**
   * Уничтожение компонента
   * @returns {void}
   */
  public ngOnDestroy(): void {
    this.ngUnsubscribe();

    if (this.overlaySub) {
      this.overlaySub.unsubscribe();
      this.overlaySub = null;
    }

    this.staticOptions = null;

    this.options = null;
    this.selectedOptions = null;
    this.searchParamNameForServerSideSearching = null;
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

  /**
   * Отписка от запросов
   * @returns {void}
   */
  public ngUnsubscribe(): void {
    if (this.unsubscribe) {
      this.unsubscribe.next();
      this.unsubscribe.complete();
      this.unsubscribe = null;
    }
  }

  /**
   * Метод генерирует событие при изменении строки
   * @param {string} search Строка поиска
   *
   * @returns {void}
   */
  public onSearch(search: string): void {
    if (this.searchEnable && this.multiselectSearchInput) {
      this.search = search;
    }
    this.debouncer.next(this.search);
  }

  /**
   * Метод очищает строку поиска и генерирует событие
   * @returns {void}
   */
  public onClearSearch(): void {
    if (this.searchEnable && this.search !== '' && this.multiselectSearchInput) {
      this.search = '';

      this.serverSideSearchEnable
        ? this._serverSideFilter(this.search)
        : this._clientSideFilter(this.search);
    }
  }

  /**
   * Метод выбора элементов из списка
   * @param {any} option Выбранный элемент
   *
   * @returns {void}
   */
  public onSelectOption(option: any): void {

    this.selectedOptions = this.selectedOptions ? this.selectedOptions : [];

    if (!this.multiple) {

      this.selectedOptions.splice(0, this.selectedOptions.length);
      this.selectedOptions.push(option);

    } else {

      /** Поиск индекса */
      let index = this.selectedOptions.indexOf(option);

      // Удаление, если уже есть в списке
      if (index > -1) {
        this.selectedOptions.splice(index, 1);

        // Добавляем только в том случае, если количество не привышает лимит
      } else if (!this.optionsLimitEnable || (this.optionsLimitEnable && this.selectedOptions.length < this.optionsLimit)) {
        this.selectedOptions.push(option);
      }

      index = null;

    }

    this.service.selectedOptions.next(this.selectedOptions);
    this.service.selectOption.next(option);
  }

  /**
   * Выбор всех элементов по чекбоксу
   * @param {MatCheckboxChange} event Событие `checkbox`, привязанное к `change`
   *
   * @returns {void}
   */
  public onSelectAll(event: MatCheckboxChange): void {

    if (!this.multiple || !this.checkArrayLength(this.options)) { return; }

    if (event.checked) {

      this.selectedOptions = !this.optionsLimitEnable ?  this.options.slice() : _.first(this.options.slice(), this.optionsLimit);

    } else {
      this.selectedOptions.splice(0, this.selectedOptions.length);
    }

    this.service.selectedOptions.next(this.selectedOptions);
  }

  /**
   * Проверка выбраны ли все элементы
   * @returns {boolean}
   */
  public isAllSelected(): boolean {
    if (!this.multiple) { return false; }

    const numSelected = this.selectedOptions ? this.selectedOptions.length : 0;
    const numRows = this.options ? this.options.length : 0;

    return !this.optionsLimitEnable
      ? numSelected === numRows
      : numSelected === this.optionsLimit;
  }

  /**
   * Метод проверки элемента на содержание
   * его в массиве `selectedOptions`
   * @param {any} option Элемент
   *
   * @returns {boolean}
   */
  public isOptionSelected(option: any): boolean {
    if (!option) {
      return false;
    }

    return this.selectedOptions.find((opt: any) => opt.id === option.id) ? true : false;
  }

  /**
   * Метод проверки фокусировки на элементе
   * @param {any} option Элемент
   *
   * @returns {boolean}
   */
  public isOptionFocused(option: any): boolean {
    if (!option || !this.focusedOption || !this.checkArrayLength(this.options)) {
      return false;
    }
    return option.id === this.focusedOption.id;
  }

  /**
   * Метод проверки привышения лимита
   * @param {any} option Элемент
   *
   * @returns {boolean}
   */
  public isLimitExceeded(option: any): boolean {
    if (this.isOptionSelected(option) || !this.optionsLimitEnable || !this.multiple) {
      return;
    }

    return this.selectedOptions.length >= this.optionsLimit;
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
   * Сброс элемента для фокуса
   * @returns {void}
   */
  private resetFocusedOption(): void {
    if (this.checkArrayLength(this.options)) {
      this.focusedOptionIndex = 0;
      this.focusedOption = this.options[0];
      if (this.optionsPanel) { this.optionsPanel.nativeElement.scrollTop = 0; }
    }
  }

  /**
   * Фильтрация по имени - запрос в базу
   * @param {string} value Строка для фильтрации
   *
   * @returns {void}
   */
  private _serverSideFilter(value: string): void {

    if (this.searchEnable && this.serverSideSearchEnable && this.searchEndpoint) {

      const val = (value != null && value.toString().trim() !== '') ? value.toString().toLowerCase() : null;

      /** Поиск по лакальному списку, чтобы не делать лишний запрос */
      if (val != null) {
        let items = this._filter(value);

        /**
         * Если в локальном списке присутствуют элементы,
         * то возвращаем его без запроса к серверу
         */
        if (this.checkArrayLength(items)) {
          items = null;
          this._clientSideFilter(value);
          return;
        }

        items = null;
      }

      const filterParams = new SimpleDataFilter({
        PageSize: this.overlaySize ? this.overlaySize : 20,
        OrderByField: this.sortField,
        [this.searchParamNameForServerSideSearching]: val
      });

      // this.service.updateOptions(this.searchEndpoint, filterParams)
      //   .pipe(takeUntil(this.unsubscribe))
      //   .subscribe((res: ItemList<any>) => {
      //     this.staticOptions = res.data ? res.data : [];
      //     this.options = this.staticOptions.slice();

      //     this.resetFocusedOption();
      //   });

    } else if (this.searchEnable) {
      this._clientSideFilter(value);
    }
  }

  /**
   * Получает фильтрованный лист
   * @param {string} value Строка для фильтрациии
   *
   * @returns {void}
   */
  private _clientSideFilter(value: string): void {
    this.options = (value != null && value.toString().trim() !== '') ? this._filter(value) : this.staticOptions.slice();

    this.resetFocusedOption();
  }

  /**
   * Фильтрация списка по имени (введенной строки в search)
   * @param {string} value Строка для фильтрациии
   *
   * @returns {any[]} фильтрованный лист
   */
  private _filter(value: string): any[] {
    const filterValue = value ? value.toString().toLowerCase() : '';

    // фильтрация по первым символам
    if (this.simpleFilter) {
      return this.staticOptions.filter(option => option[this.displayName].toString().toLowerCase().indexOf(filterValue) === 0);
    }

    // фильтрация по включению
    return this.staticOptions.filter(option => option[this.displayName].toString().toLowerCase().includes(filterValue));
  }
}
