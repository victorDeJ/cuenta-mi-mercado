import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ViewChild,
  TemplateRef,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Layout } from '../../core/services/layout/layout';
import { IBreadcrumb } from '../../core/services/layout/interfaces/breadcrumb.interface';
import { Database } from '../../core/services/database/database';
import { Collection } from '../../core/services/database/enums/collections';
import { GroceryList } from '../../core/services/database/collections/grocery-list';
import { IVAType } from '../../core/services/database/enums/IVA-type';
import { WeightType } from '../../core/services/database/enums/weight-type';

export interface SearchProductItem {
  id: string;
  marketId: string;
  marketCreatedAt: string;
  marketDescription: string;
  bcvRate: number;
  kontigoRate: number;
  description: string;
  price: number;
  quantity: number;
  IVAType: IVAType;
  weight: number;
  wieghtType: WeightType;
  totalInDollars: number;
}

function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const dp: number[][] = [];
  for (let i = 0; i <= b.length; i++) dp[i] = [i];
  for (let j = 0; j <= a.length; j++) dp[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j - 1] + 1, dp[i][j - 1] + 1, dp[i - 1][j] + 1);
      }
    }
  }
  return dp[b.length][a.length];
}

function isFuzzyTokenMatch(queryWord: string, targetWord: string): boolean {
  if (targetWord.includes(queryWord) || (queryWord.length >= 3 && queryWord.includes(targetWord))) {
    return true;
  }
  const maxLen = Math.max(queryWord.length, targetWord.length);
  if (maxLen <= 2) {
    return queryWord === targetWord;
  }
  const dist = levenshteinDistance(queryWord, targetWord);
  const maxDist = maxLen <= 4 ? 1 : maxLen <= 7 ? 2 : 3;
  if (dist <= maxDist) {
    return true;
  }
  const similarity = 1 - dist / maxLen;
  return similarity >= 0.7;
}

function matchesProduct(query: string, productDesc: string): boolean {
  const normQuery = normalizeText(query);
  const normDesc = normalizeText(productDesc);
  if (!normQuery) return false;

  if (normDesc.includes(normQuery)) {
    return true;
  }

  const queryTokens = normQuery.split(/\s+/).filter((t) => t.length > 0);
  const descTokens = normDesc.split(/[\s,.-]+/).filter((t) => t.length > 0);

  if (queryTokens.length === 0) return false;

  return queryTokens.every((qToken) => {
    if (normDesc.includes(qToken)) return true;

    return descTokens.some((dToken) => {
      if (isFuzzyTokenMatch(qToken, dToken)) return true;

      if (dToken.length > qToken.length + 1 && qToken.length >= 3) {
        for (let i = 0; i <= dToken.length - qToken.length; i++) {
          const sub = dToken.substring(i, i + qToken.length + 1);
          if (isFuzzyTokenMatch(qToken, sub)) return true;
        }
      }
      return false;
    });
  });
}

@Component({
  selector: 'app-groceries-search-page',
  standalone: true,
  imports: [TranslateModule, DialogModule, NgClass, DatePipe, DecimalPipe, FormsModule],
  templateUrl: './groceries-search-page.html',
  styleUrl: './groceries-search-page.scss',
})
export class GroceriesSearchPage implements OnInit, OnDestroy {
  layout = inject(Layout);
  db = inject(Database);
  router = inject(Router);
  dialog = inject(Dialog);

  @ViewChild('itemContent') itemContent!: TemplateRef<any>;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  IVAType = IVAType;
  WeightType = WeightType;

  allProducts = signal<SearchProductItem[]>([]);
  filteredProducts = signal<SearchProductItem[]>([]);
  searchTerm = signal<string>('');
  isSearching = signal<boolean>(false);
  hasSearched = signal<boolean>(false);

  selectedItem = signal<SearchProductItem | null>(null);

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  selectedItemPrice = computed(() => {
    const item = this.selectedItem();
    return item ? item.price : 0;
  });

  modalSubtotalInUSD = computed(() => {
    const item = this.selectedItem();
    if (!item) return 0;
    let weightMultiplier = 1;
    if (item.weight > 0) {
      weightMultiplier = item.wieghtType === WeightType.GR ? item.weight / 1000 : item.weight;
    }
    return item.price * item.quantity * weightMultiplier;
  });

  modalTotalInUSD = computed(() => {
    const item = this.selectedItem();
    if (!item) return 0;
    const baseTotal = this.modalSubtotalInUSD();
    let ivaMultiplier = 1;
    if (item.IVAType === IVAType.GENERAL) ivaMultiplier = 1.16;
    else if (item.IVAType === IVAType.REDUCED) ivaMultiplier = 1.08;
    return baseTotal * ivaMultiplier;
  });

  modalSubtotalInBS = computed(() => {
    const item = this.selectedItem();
    if (!item) return 0;
    return this.modalSubtotalInUSD() * (item.bcvRate || 0);
  });

  modalTotalInBS = computed(() => {
    const item = this.selectedItem();
    if (!item) return 0;
    return this.modalTotalInUSD() * (item.bcvRate || 0);
  });

  async ngOnInit(): Promise<void> {
    this.layout.cleanBreadcrumb();
    this.layout.setHeaderTitle('GROCERIES_SEARCH.TITLE');

    const historicalBreadcrumb: IBreadcrumb = {
      id: 'GroceriesListHistorical',
      label: 'GROCERIES_LIST_HISTORICAL.BREADCRUMB_NAME',
      url: '/groceries-list-historical',
    };
    this.layout.setBreadcrumbItem(historicalBreadcrumb);

    const searchBreadcrumb: IBreadcrumb = {
      id: 'GroceriesSearch',
      label: 'GROCERIES_SEARCH.BREADCRUMB_NAME',
      url: '/groceries-search',
    };
    this.layout.setBreadcrumbItem(searchBreadcrumb);

    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.executeSearch(term);
      });

    await this.loadAllHistoricalProducts();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  async loadAllHistoricalProducts(): Promise<void> {
    this.layout.setToLoading();
    try {
      const data = await this.db.getData(Collection.GROCERY_LIST, {
        selector: {
          completed: true,
        },
      });

      const lists = (data as GroceryList[]).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      const items: SearchProductItem[] = [];
      for (const list of lists) {
        if (list.items && Array.isArray(list.items)) {
          for (const item of list.items) {
            items.push({
              id: item.id,
              marketId: list.id,
              marketCreatedAt: list.createdAt,
              marketDescription: list.description,
              bcvRate: list.bcvRate,
              kontigoRate: list.kontigoRate,
              description: item.description,
              price: item.price,
              quantity: item.quantity,
              IVAType: item.IVAType,
              weight: item.weight,
              wieghtType: item.wieghtType,
              totalInDollars: item.totalInDollars,
            });
          }
        }
      }

      this.allProducts.set(items);
    } catch (error) {
      console.error('Error loading historical products:', error);
    } finally {
      this.layout.setToUnloading();
    }
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    const trimmed = value.trim();
    if (!trimmed) {
      this.isSearching.set(false);
      this.hasSearched.set(false);
      this.filteredProducts.set([]);
      this.searchSubject.next('');
      return;
    }
    this.isSearching.set(true);
    this.searchSubject.next(trimmed);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.isSearching.set(false);
    this.hasSearched.set(false);
    this.filteredProducts.set([]);
    this.searchSubject.next('');
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }
  }

  executeSearch(term: string): void {
    const currentTerm = this.searchTerm().trim();
    if (!currentTerm || !term.trim()) {
      this.filteredProducts.set([]);
      this.hasSearched.set(false);
      this.isSearching.set(false);
      return;
    }

    const all = this.allProducts();
    const results = all.filter((prod) => matchesProduct(currentTerm, prod.description));
    this.filteredProducts.set(results);
    this.hasSearched.set(true);
    this.isSearching.set(false);
  }

  openProductDetail(item: SearchProductItem): void {
    this.selectedItem.set(item);
    this.dialog.open(this.itemContent, {
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
    });
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  goToMarket(): void {
    const item = this.selectedItem();
    if (item && item.marketId) {
      this.dialog.closeAll();
      this.router.navigateByUrl(`/groceries-list-detail/${item.marketId}`);
    }
  }
}
