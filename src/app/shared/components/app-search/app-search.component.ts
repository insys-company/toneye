import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy, HostListener, OnInit, SimpleChange } from '@angular/core';
import { AppSearchService } from './app-search.service';
import { AppSearchOverlayService } from './app-search-overlay/app-search-overlay.service';
import { OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { Subscription, Subject } from 'rxjs';
import 'rxjs/add/operator/debounceTime';
import { Block, Message, Transaction, Validator } from 'src/app/api';
import { NOT_FOUND } from './app-search-overlay/app-search-overlay.component';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './app-search.component.html',
  styleUrls: ['./app-search.component.scss'],
  providers: [ AppSearchService ],
//   animations: [ smoothDisplayAfterSkeletonAnimation ],
})
export class AppSearchComponent implements OnInit, OnDestroy {
  /**
   * Подписка на изменение строки поиска
   * @type {Subject<string>}
   */
  private debouncer: Subject<string>;
  /**
   * Для подписок
   */
  private overlaySubs: Subscription[];
  /**
   * Для подписок
   */
  private searchSub: Subscription;
  /**
   * Список элементов для выбора
   */
  @Input() blocks: Block[];
  /**
   * Список элементов для выбора
   */
  @Input() messages: Message[];
  /**
   * Список элементов для выбора
   */
  @Input() transactions: Transaction[];
  /**
   * Список элементов для выбора
   */
  @Input() accounts: Account[];
  /**
   * Список элементов для выбора
   */
  @Input() validators: Validator[];

  /**
   * Текст для случая когда не найдено ничего по поиску
   */
  @Input() notFoundTitle: string;

  /**
   * Search event
   */
  @Output() searchChange: EventEmitter<string>;

  /**
   * фокус на поле
   */
  public focused: boolean;
  /**
   * строка поиска
   */
  public search: string;
  /**
   * Загрузка
   */
  public isLoading: boolean;
  /**
   * Клик по кномпке сброса
   */
  public isResetClick: boolean;

  /**
   * Для overlay
   */
  private get overlayRef(): OverlayRef {
    return this.service.overlayRef;
  }

  /**
   * Устанавливает класс для стилизации селекта
   * в состоянии, когда элементы выбраны
   */
  public get isDirty(): boolean {
    return this.checkString(this.search);
  }

  constructor(
    private service: AppSearchService,
    private overlayService: AppSearchOverlayService,
  ) {
    
    this.overlaySubs = [];

    /** Основные поля по дефолту */
    this.notFoundTitle = NOT_FOUND;
    this.blocks = [];
    this.messages = [];
    this.transactions = [];

    /** События */
    this.searchChange = new EventEmitter<string>();

    this.debouncer = new Subject<string>();

    /** Подписка на изменение строки поиска */
    this.searchSub = this.debouncer
      .debounceTime(1000)
      .pipe(distinctUntilChanged())
      .subscribe((value: string) => {

        if (value !== undefined) {
          this.closePanel();

          if (!this.isResetClick) {
            // Для иконки загрузки
            this.isLoading = true;
          }

          this.searchChange.emit(value);
        }

      });
  }

  /** Элемента для расчета позиции overlay */
  @ViewChild('searchElement') searchElement?: ElementRef;
  /** Поле поиска */
  @ViewChild('searchInput', { static: false }) searchInput?: ElementRef;

  /** Обновление длинны overlay отнительно элемента */
  @HostListener('window:resize')
  handleWindowResizeEvent(): void {
    if (this.overlayRef) {
      this.overlayRef.updateSize({
        width: this.searchElement.nativeElement.getBoundingClientRect().width
      });
      this.overlayRef.updatePosition();
    }
  }

  /**
   * Отписываться не нужно, умирает с компонентом
   * Слушает нажатие esc и закрывает окно
   * @param {KeyboardEvent} event Событие
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
  ngOnChanges(changes: { [propertyName: string]: SimpleChange }): void {

    if (this.isDirty && this.focused) {
      this.isLoading = false;

      !this.isResetClick
        ? this.onOpenPanel()
        : this.isResetClick = false;

    }
    else if (!this.isDirty) {
      this.isResetClick = false;
      this.isLoading = false;
    }
  }

  /**
   * Инициализация
   */
  ngOnInit(): void {
    this.blocks = this.blocks != null ? this.blocks : [];
    this.messages = this.messages != null ? this.messages : [];
    this.transactions = this.transactions != null ? this.transactions : [];
    this.accounts = this.accounts != null ? this.accounts : [];
    this.validators = this.validators != null ? this.validators : [];
    this.notFoundTitle = this.notFoundTitle != null ? this.notFoundTitle : null;
  }

  /**
   * Уничтожение компонента
   */
  ngOnDestroy(): void {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
    this.searchSub = null;
    this.overlayUnsubscribe();
    this.notFoundTitle = null;

    this.blocks = null;
    this.messages = null;
    this.transactions = null;
    this.accounts = null;
    this.validators = null;
  }

  /**
   * Метод открытия overlay
   */
  onOpenPanel(): void {

    if (this.overlayRef && this.overlayRef.hasAttached()) {
      // this.closePanel();
      return;
    }

    if (!this.isDirty) { return; }

    if (!this.searchElement) { return; }

    // Цепляемся к элементу, указываем
    // стратегию выбора позиции относительно элемента
    let positionStrategy = this.service.getPositionStrategy(this.searchElement);

    // стратегия скроллинга
    let scrollStrategy = this.service.getScrollStrategy();

    this.service.createOverlay(
      {
        blocks: this.blocks,
        messages: this.messages,
        transactions: this.transactions,
        accounts: this.accounts,
        validators: this.validators,
        notFoundTitle: this.notFoundTitle,
      },
      new OverlayConfig({
        positionStrategy: positionStrategy,
        scrollStrategy: scrollStrategy,
        // hasBackdrop: true,
        backdropClass: 'app-search__backdrop',
        width: this.searchElement.nativeElement.getBoundingClientRect().width
      })
    );

    this.openPanel();
  }

  /**
   * Search method
   * @param search String from search input
   */
  onSearch(search: string): void {
    const _search = search ? search.trim() : search;

    if (!_search || _search == '') {
      this.onResetSearch(null, true);
      return;
    }

    this.debouncer.next(_search);
  }

  /**
   * Метод очищает поле поиска и все списки
   * @param {Event} clickEvent Событие для прекращения дальнейшей передачи текущего события
   */
  onResetSearch(clickEvent?: Event, isNotReset: boolean = false): void {
    /** Прекращение дальнейшей передачи текущего события */
    if (clickEvent) { clickEvent.stopPropagation(); }

    this.search = null;
    this.blocks = [];
    this.messages = [];
    this.transactions = [];
    this.accounts = [];
    this.validators = [];

    this.closePanel();

    if (!isNotReset) { this.isResetClick = true; }

    this.debouncer.next(this.search);
  }

  /**
   * Закрытие overlay
   */
  closePanel(): void {
    this.service.closePanel();
    this.overlayUnsubscribe();
  }

  /**
   * Метод проверяет строку
   * @param {string} str Строка для проверки
   */
  private checkString(str: string): boolean {
    return (str && str.length) ? true : false;
  }

  /**
   * Отписки
   */
  private overlayUnsubscribe(): void {
    if (this.overlaySubs) {
      this.overlaySubs.forEach((s: Subscription) => s.unsubscribe());
      this.overlaySubs = [];
    }
  }

  /**
   * Открытие overlay
   */
  private openPanel(): void {

    this.service.openPanel();

    /** Событие передает выбранный элемент */
    const optionSub = this.overlayService.selectOption
      .subscribe((option: any) => {

        this.searchChange.emit(option);

        this.closePanel();

      });

    const panelCloseSub = this.overlayRef.backdropClick()
      .subscribe(() => {
        this.closePanel();
      });

    this.overlaySubs.push(optionSub);
    this.overlaySubs.push(panelCloseSub);
  }
}
