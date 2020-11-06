import { Component, InjectionToken, Inject, OnDestroy, OnInit } from '@angular/core';
import { AppSearchOverlayService } from './app-search-overlay.service';
import { Block, Message, Transaction, Validator } from 'src/app/api/contracts';
import { smoothSearchPanelAnimation } from 'src/app/app-animations';
import { LocaleText } from 'src/locale/locale';

export const SEARCH_PANEL_DATA = new InjectionToken<{}>('SEARCH_PANEL_DATA');
export const NOT_FOUND = 'Not found';

@Component({
  selector: 'app-search-overlay',
  templateUrl: './app-search-overlay.component.html',
  styleUrls: ['./app-search-overlay.component.scss'],
  animations: [ smoothSearchPanelAnimation ],
})
export class AppSearchOverlayComponent implements OnInit, OnDestroy {
  /** Общие тексты для страниц */
  public locale = {
    blocksTitle: LocaleText.blocks,
    transactionsTitle: LocaleText.transactions,
    messagesTitle: LocaleText.messages,
    accountsTitle: LocaleText.accounts,
    validatorsTitle: LocaleText.validators,
    searchMessage: LocaleText.searchMessage,
    searchTransaction: LocaleText.searchTransaction,
    searchBlock: LocaleText.searchBlock,
    notFound: LocaleText.notFound,
  };

  /**
   * Список элементов для выбора
   */
  public blocks: Block[];
  /**
   * Список элементов для выбора
   */
  public messages: Message[];
  /**
   * Список элементов для выбора
   */
  public transactions: Transaction[];
  /**
   * Список элементов для выбора
   */
  public accounts: Account[];
  /**
   * Список элементов для выбора
   */
  public validators: Validator[];

  /**
   * Текст для случая когда не найдено ничего по поиску
   */
  public notFoundTitle: string;

  /**
   * Не найдено
   */
  public get notFound(): boolean {
    return !this.checkArray(this.blocks)
      && !this.checkArray(this.messages)
      && !this.checkArray(this.transactions)
      && !this.checkArray(this.accounts)
      && !this.checkArray(this.validators);
  }

  constructor(
    protected service: AppSearchOverlayService,
    @Inject(SEARCH_PANEL_DATA) public data: any,
  ) {
    // TODO
  }

  /**
   * Инициализация
   */
  public ngOnInit(): void {
    this.blocks = this.data.data.blocks ? this.data.data.blocks : [];
    this.messages = this.data.data.messages ? this.data.data.messages : [];
    this.transactions = this.data.data.transactions ? this.data.data.transactions : [];
    this.accounts = this.data.data.accounts ? this.data.data.accounts : [];
    this.validators = this.data.data.validators ? this.data.data.validators : [];

    this.notFoundTitle = this.data.data.notFoundTitle;

    this.notFoundTitle = this.notFoundTitle
      ? this.notFoundTitle
      : this.locale.notFound;
  }

  /**
   * Уничтожение компонента
   */
  public ngOnDestroy(): void {
    this.locale = null;
    this.blocks = null;
    this.messages = null;
    this.transactions = null;
    this.accounts = null;
    this.validators = null;

    this.notFoundTitle = null;
  }

  /**
   * Метод выбора элементов из списка
   * @param {any} option Выбранный элемент
   */
  public onSelectOption(type: string, option: any): void {
    this.service.selectOption.next({type, option});
  }

  /**
   * Метод проверки массива на его наличие и длину
   * @param {any[]} array Массив для проверки длины
   */
  private checkArray(array: any[]): boolean {
    return (array && array.length) ? true : false;
  }
}
