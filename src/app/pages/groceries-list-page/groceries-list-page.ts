import { Component, inject, TemplateRef, ViewChild, effect } from '@angular/core';
import { Temporal } from '@js-temporal/polyfill';
import { TranslateModule } from '@ngx-translate/core';
import { Layout } from '../../core/services/layout/layout';
import { IBreadcrumb } from '../../core/services/layout/interfaces/breadcrumb.interface';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { IVAType } from '../../core/services/database/enums/IVA-type';
import { Database } from '../../core/services/database/database';
import { ExchangeRateType } from '../../core/services/database/enums/Exchange-rate-type';
import { Collection } from '../../core/services/database/enums/collections';
import { computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExchangeRate } from '../../core/services/database/collections/exchange-rate';
import { GroceryItem } from '../../core/services/database/collections/grocery-item';
import { WeightType } from '../../core/services/database/enums/weight-type';
import { GroceryList } from '../../core/services/database/collections/grocery-list';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-groceries-list-page',
  imports: [TranslateModule, DialogModule, NgClass, DecimalPipe, ReactiveFormsModule, DatePipe],
  templateUrl: './groceries-list-page.html',
  styleUrl: './groceries-list-page.scss',
})
export class GroceriesListPage {
  layout = inject(Layout);
  dialog = inject(Dialog);
  database = inject(Database);
  router = inject(Router);

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

  itemForm = new FormGroup({
    id: new FormControl(''),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    price: new FormControl(0, [Validators.required, Validators.min(0.01)]),
    quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
    IVAType: new FormControl(IVAType.GENERAL, { nonNullable: true, validators: [Validators.required] }),
    weight: new FormControl(0),
    wieghtType: new FormControl(WeightType.KG, { nonNullable: true }),
    createdAt: new FormControl('')
  });

  private formValue = toSignal(this.itemForm.valueChanges, { initialValue: this.itemForm.getRawValue() });

  items = signal<GroceryItem[]>([]);

  subtotalPrice = computed(() => {
    const value = this.formValue();
    let weightMultiplier = 1;
    if (this.showWeightOptions && (value.weight ?? 0) > 0) {
      weightMultiplier = value.wieghtType === WeightType.GR ? (value.weight ?? 0) / 1000 : (value.weight ?? 0);
    }
    
    const basePrice = value.price ?? 0;
    const quantity = value.quantity ?? 1;
    return basePrice * quantity * weightMultiplier;
  });

  totalPrice = computed(() => {
    const value = this.formValue();
    const baseTotal = this.subtotalPrice();
    
    let ivaMultiplier = 1;
    if (value.IVAType === IVAType.GENERAL) ivaMultiplier = 1.16;
    else if (value.IVAType === IVAType.REDUCED) ivaMultiplier = 1.08;
    
    return baseTotal * ivaMultiplier;
  });

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

  deleteIndex = signal<number>(-1);

  constructor() {
    // Sincronizar automáticamente el registro de la lista de mercado cuando cambien los items o tasas
    effect(async () => {
      const list = this.currentGroceryList();
      if (!list) return;

      const items = this.items();
      const bcv = this.bcvRate();
      const kontigo = this.kontigoRate();
      
      const subtotal = this.summarySubtotal();
      const iva = this.summaryIVA();
      const total = this.summaryTotal();

      const updatedList: Partial<GroceryList> = {
        itemIds: items.map(i => i.id),
        subtotalInDollars: subtotal,
        totalIVA: iva,
        totalInDollars: total,
        bcvRate: bcv,
        bcvRateId: this.bcvRateId(),
        bsTotalBCV: total * bcv,
        kontigoRate: kontigo,
        kontigoRateId: this.kontigoRateId(),
        dollarsTotalKontigo: kontigo > 0 ? (total * bcv / kontigo) : 0
      };

      try {
        await this.database.updateData(Collection.GROCERY_LIST, list.id, updatedList);
      } catch (error) {
        console.error('Error auto-updating GroceryList record:', error);
      }
    });
  }

  ngOnInit(): void {
    this.layout.cleanBreadcrumb();
    this.layout.setHeaderTitle('GROCERIES_LIST.TITLE');
    const breadcrumbItem: IBreadcrumb = {
      id: 'GroceriesList',
      label: 'GROCERIES_LIST.BREADCRUMB_NAME',
      url: '/exchange-rate',
    };
    this.layout.setBreadcrumbItem(breadcrumbItem);

    this.initPage();
  }

  async initPage() {
    this.layout.setToLoading();
    try {
      await this.getExchangeRates();
      await this.getItems();
      await this.getOrCreatePendingList();
    } catch (error) {
      console.error('Error initializing page:', error);
    } finally {
      this.layout.setToUnloading();
    }
  }

  async getItems() {
    const data = await this.database.getData(Collection.GROCERY) as GroceryItem[];
    this.items.set(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  async getExchangeRates() {
    const bcvData = await this.database.getData(Collection.EXCHANGE_RATE, {
      selector: { rateType: ExchangeRateType.BCV },
      sort: [{ createdAt: 'desc' }],
      limit: 1
    }) as ExchangeRate[];

    const kontigoData = await this.database.getData(Collection.EXCHANGE_RATE, {
      selector: { rateType: ExchangeRateType.KONTIGO },
      sort: [{ createdAt: 'desc' }],
      limit: 1
    }) as ExchangeRate[];

    if (bcvData.length > 0) {
      this.bcvRate.set(bcvData[0].amount);
      this.bcvRateId.set(bcvData[0].id);
    }

    if (kontigoData.length > 0) {
      this.kontigoRate.set(kontigoData[0].amount);
      this.kontigoRateId.set(kontigoData[0].id);
    }
  }

  async getOrCreatePendingList() {
    const lists = await this.database.getData(Collection.GROCERY_LIST, {
      selector: { completed: false },
      sort: [{ createdAt: 'desc' }],
      limit: 1
    }) as GroceryList[];

    if (lists.length > 0) {
      this.currentGroceryList.set(lists[0]);
    } else {
      const newList: GroceryList = {
        id: crypto.randomUUID(),
        description: 'Mercado',
        itemIds: this.items().map(i => i.id),
        subtotalInDollars: this.summarySubtotal(),
        totalIVA: this.summaryIVA(),
        totalInDollars: this.summaryTotal(),
        bcvRate: this.bcvRate(),
        bcvRateId: this.bcvRateId(),
        bsTotalBCV: this.summaryTotal() * this.bcvRate(),
        kontigoRate: this.kontigoRate(),
        kontigoRateId: this.kontigoRateId(),
        dollarsTotalKontigo: this.kontigoRate() > 0 ? (this.summaryTotal() * this.bcvRate() / this.kontigoRate()) : 0,
        completed: false,
        createdAt: Temporal.Now.instant().toString()
      };
      const inserted = await this.database.insertData(Collection.GROCERY_LIST, newList);
      this.currentGroceryList.set(inserted.toJSON() as GroceryList);
    }
  }

  showItemContent(index: number) {
    if (index === -1) {
      this.itemForm.reset({
        id: '',
        description: '',
        quantity: 1,
        price: 0,
        IVAType: IVAType.GENERAL,
        weight: 0,
        wieghtType: WeightType.KG,
        createdAt: ''
      });
      this.showWeightOptions = false;
    } else {
      const item = this.items()[index];
      this.itemForm.patchValue(item);
      this.showWeightOptions = item.weight > 0;
    }

    this.dialog.open(this.itemContent, {
      width: '90%',
      maxWidth: '500px',
    });
  }

  async onSubmitItem() {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const formValue = this.itemForm.getRawValue();
    this.layout.setToLoading();
    
    const finalItem: GroceryItem = {
      id: formValue.id || crypto.randomUUID(),
      description: formValue.description,
      price: formValue.price ?? 0,
      quantity: formValue.quantity ?? 1,
      IVAType: formValue.IVAType,
      weight: this.showWeightOptions ? formValue.weight || 0 : 0,
      wieghtType: formValue.wieghtType,
      totalInDollars: this.totalPrice(),
      createdAt: formValue.createdAt || Temporal.Now.instant().toString()
    };

    try {
      if (formValue.id) {
        await this.database.updateData(Collection.GROCERY, formValue.id, finalItem);
      } else {
        await this.database.insertData(Collection.GROCERY, finalItem);
      }
      await this.getItems();
      this.closeDialog();
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      this.layout.setToUnloading();
    }
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  showConfirmDeleteItem(index: number) {
    this.deleteIndex.set(index);
    this.dialog.open(this.confirmDeleteItem, {
      width: '90%',
      maxWidth: '500px',
    });
  }

  async onDeleteItem() {
    const index = this.deleteIndex();
    if (index === -1) return;

    const item = this.items()[index];
    this.layout.setToLoading();
    try {
      await this.database.deleteData(Collection.GROCERY, item.id);
      await this.getItems();
      this.closeConfirmDeleteItem();
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      this.layout.setToUnloading();
    }
  }

  async onDescriptionChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const list = this.currentGroceryList();
    if (!list) return;

    try {
      await this.database.updateData(Collection.GROCERY_LIST, list.id, {
        description: input.value
      });
      // Actualizar el signal local
      this.currentGroceryList.update(l => l ? { ...l, description: input.value } : null);
    } catch (error) {
      console.error('Error updating description:', error);
    }
  }

  showConfirmComplete() {
    this.dialog.open(this.confirmComplete, {
      width: '90%',
      maxWidth: '500px',
    });
  }

  showConfirmDiscard() {
    this.dialog.open(this.confirmDiscard, {
      width: '90%',
      maxWidth: '500px',
    });
  }

  async onDiscardShop() {
    const list = this.currentGroceryList();
    if (!list) return;

    this.dialog.closeAll();
    this.layout.setToLoading();
    try {
      // 1. Delete the pending list
      await this.database.deleteData(Collection.GROCERY_LIST, list.id);

      // 2. Clear current grocery items
      const items = await this.database.getData(Collection.GROCERY);
      for (const item of items) {
        await this.database.deleteData(Collection.GROCERY, item.id);
      }

      this.currentGroceryList.set(null);
      this.router.navigateByUrl('home');
    } catch (error) {
      console.error('Error discarding shop:', error);
    } finally {
      this.layout.setToUnloading();
    }
  }

  async onCompleteShop() {
    const list = this.currentGroceryList();
    if (!list) return;

    this.dialog.closeAll();
    this.layout.setToLoading();
    try {
      // 1. Mark as completed and save items
      await this.database.updateData(Collection.GROCERY_LIST, list.id, {
        completed: true,
        items: this.items()
      });

      // 2. Clear current grocery items
      const items = await this.database.getData(Collection.GROCERY);
      for (const item of items) {
        await this.database.deleteData(Collection.GROCERY, item.id);
      }

      this.currentGroceryList.set(null);
      this.router.navigateByUrl('/home');
    } catch (error) {
      console.error('Error completing shop:', error);
    } finally {
      this.layout.setToUnloading();
    }
  }

  closeConfirmDeleteItem() {
    this.deleteIndex.set(-1);
    this.dialog.closeAll();
  }
}
