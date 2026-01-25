import { Component, inject, TemplateRef, ViewChild, signal, computed } from '@angular/core';
import { Temporal } from '@js-temporal/polyfill';
import { TranslateModule } from '@ngx-translate/core';
import { Layout } from '../../core/services/layout/layout';
import { IBreadcrumb } from '../../core/services/layout/interfaces/breadcrumb.interface';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { IVAType } from '../../core/services/database/enums/IVA-type';
import { Database } from '../../core/services/database/database';
import { Collection } from '../../core/services/database/enums/collections';
import { GroceryItem } from '../../core/services/database/collections/grocery-item';
import { WeightType } from '../../core/services/database/enums/weight-type';
import { GroceryList } from '../../core/services/database/collections/grocery-list';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-groceries-list-detail-page',
  imports: [TranslateModule, DialogModule, NgClass, DecimalPipe, ReactiveFormsModule, DatePipe],
  templateUrl: './groceries-list-detail-page.html',
  styleUrl: './groceries-list-detail-page.scss',
})
export class GroceriesListDetailPage {
  layout = inject(Layout);
  dialog = inject(Dialog);
  database = inject(Database);
  router = inject(Router);
  route = inject(ActivatedRoute);

  @ViewChild('itemContent') itemContent!: TemplateRef<any>;
  showWeightOptions: boolean = false;
  @ViewChild('confirmDeleteItem') confirmDeleteItem!: TemplateRef<any>;
  @ViewChild('confirmComplete') confirmComplete!: TemplateRef<any>;
  @ViewChild('confirmDiscard') confirmDiscard!: TemplateRef<any>;

  exchangeRateDate: Temporal.ZonedDateTime = Temporal.Now.zonedDateTimeISO('UTC');
  IVAType = IVAType
  
  bcvRate = signal<number>(0);
  bcvRateId = signal<string>('');
  kontigoRate = signal<number>(0);
  kontigoRateId = signal<string>('');
  WeightType = WeightType;

  currentGroceryList = signal<GroceryList | null>(null);

  items = signal<GroceryItem[]>([]);

  summarySubtotal = computed(() => {
    return this.items().reduce((acc, item) => {
      let weightMultiplier = 1;
      if (item.weight > 0) {
        weightMultiplier = item.wieghtType === WeightType.GR ? item.weight / 1000 : item.weight;
      }
      return acc + (item.price * item.quantity * weightMultiplier);
    }, 0);
  });

  summaryIVA = computed(() => {
    return this.items().reduce((acc, item) => {
      let weightMultiplier = 1;
      if (item.weight > 0) {
        weightMultiplier = item.wieghtType === WeightType.GR ? item.weight / 1000 : item.weight;
      }
      const baseTotal = item.price * item.quantity * weightMultiplier;
      let ivaRate = 0;
      if (item.IVAType === IVAType.GENERAL) ivaRate = 0.16;
      else if (item.IVAType === IVAType.REDUCED) ivaRate = 0.08;
      
      return acc + (baseTotal * ivaRate);
    }, 0);
  });

  summaryTotal = computed(() => this.summarySubtotal() + this.summaryIVA());

  constructor() {
    // Read-only mode, no autosave effect needed
  }

  ngOnInit(): void {
    this.layout.cleanBreadcrumb();
    this.layout.setHeaderTitle('GROCERIES_LIST.TITLE');
    const breadcrumbItem: IBreadcrumb = {
      id: 'GroceriesListDetail',
      label: 'GROCERIES_LIST.BREADCRUMB_NAME',
      url: '/groceries-list-historical',
    };
    this.layout.setBreadcrumbItem(breadcrumbItem);

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadList(id);
      }
    });
  }

  async loadList(id: string) {
    this.layout.setToLoading();
    try {
      const list = await this.database.getData(Collection.GROCERY_LIST, id) as GroceryList;
      if (list) {
        this.currentGroceryList.set(list);
        
        // Use items from the grocery list object if available
        if (list.items) {
          this.items.set(list.items);
        } else {
           // Fallback or empty if items were not saved in the new format
           this.items.set([]);
        }

        this.bcvRate.set(list.bcvRate);
        this.kontigoRate.set(list.kontigoRate);
      }
    } catch (error) {
      console.error('Error loading list:', error);
    } finally {
      this.layout.setToUnloading();
    }
  }

}
