import { Component, inject, signal, TemplateRef, viewChild, ViewChild, WritableSignal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Temporal } from '@js-temporal/polyfill';
import { Layout } from '../../core/services/layout/layout';
import { IBreadcrumb } from '../../core/services/layout/interfaces/breadcrumb.interface';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { Database } from '../../core/services/database/database';
import { Collection } from '../../core/services/database/enums/collections';
import { ExchangeRate } from '../../core/services/database/collections/exchange-rate';
import { ExchangeRateType } from '../../core/services/database/enums/Exchange-rate-type';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { form, min, required } from '@angular/forms/signals';

@Component({
  selector: 'app-exchange-rate-page',
  imports: [TranslateModule, NgClass, DatePipe, DialogModule, DecimalPipe],
  templateUrl: './exchange-rate-page.html',
  styleUrl: './exchange-rate-page.scss',
})
export class ExchangeRatePage {
  layout = inject(Layout);
  database = inject(Database);
  dialog = inject(Dialog);
  exchangeRateModal = viewChild.required<TemplateRef<any>>('exchangeRateModal');
  
  BCVExchangeRates: WritableSignal<ExchangeRate[]> = signal([]);
  KontigoExchangeRates: WritableSignal<ExchangeRate[]> = signal([]);
  exchangeRates: WritableSignal<ExchangeRate[]> = signal([]);
  ExchangeRateType = ExchangeRateType
  
  exchangeRateDate: Temporal.ZonedDateTime = Temporal.Now.zonedDateTimeISO('UTC');

  exchangeRateModel = signal<ExchangeRate>({
    id: '',
    rateType: ExchangeRateType.BCV,
    amount: 0,
    createdAt: Temporal.Now.zonedDateTimeISO('UTC').toString()
  });

  exchangeRateForm = form(this.exchangeRateModel, (schema) =>{
    required(schema.rateType);
    required(schema.amount);
    min(schema.amount, 1);    
  });

  ngOnInit(): void {
    this.layout.cleanBreadcrumb();
    this.layout.setHeaderTitle('EXCHANGE_RATE.TITLE');
    const breadcrumbItem: IBreadcrumb = {
      id: "ExchangeRate",
      label: "EXCHANGE_RATE.BREADCRUMB_NAME",
      url: "/exchange-rate"
    }
    this.layout.setBreadcrumbItem(breadcrumbItem);
    this.getExchangeRateList();
  }

  getExchangeRateList(){
    this.layout.setToLoading();
    this.database.getData(Collection.EXCHANGE_RATE)
    .then((data: any) => {
      data.sort((a: ExchangeRate, b: ExchangeRate) => b.createdAt.localeCompare(a.createdAt));
      this.exchangeRates.set(data);
      this.updateExchangeRateLists();
    })
    .finally(()=>{
      this.layout.setToUnloading();
    })
  }

  updateExchangeRateLists(){
    this.BCVExchangeRates.set( this.exchangeRates().filter(
      (item: ExchangeRate) => item.rateType === ExchangeRateType.BCV
    ));
    this.KontigoExchangeRates.set( this.exchangeRates().filter(
      (item: ExchangeRate) => item.rateType === ExchangeRateType.KONTIGO
    ));
  }

  ngAfterViewInit(): void {
    const element = document.getElementById('historialRates');
    if (element) {
      const top = element.getBoundingClientRect().top;
      
      element.style.height = `calc(100vh - ${top}px - 10vh - 8px)`;
    }
  }

  openDialog(exchangeRate: ExchangeRate | ExchangeRateType){

    if (typeof exchangeRate === 'object' && exchangeRate !== null) {
      this.exchangeRateModel.set({ ...exchangeRate });
    } 
    else {
      this.exchangeRateModel.set({
        id: '',
        rateType: exchangeRate as ExchangeRateType,
        amount: 0,
        createdAt: Temporal.Now.instant().toString()
      });
    }

    this.dialog.open(this.exchangeRateModal(), {
      width: '90%',
      maxWidth: '500px',
    });

  }

  closeDialog() {
    this.dialog.closeAll();
  }

  onAmountChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.exchangeRateModel.update((m) => ({ ...m, amount: Number(input.value) }));
  }

  onSubmit() {

    if ( this.exchangeRateModel().amount <= 0 ) {
      return;
    }

    this.layout.setToLoading();
    
    if (this.exchangeRateModel().id) {
      // Update
      this.database.updateData(Collection.EXCHANGE_RATE, this.exchangeRateModel().id, {
        amount: this.exchangeRateModel().amount
      })
      .then(() => {
        this.getExchangeRateList();
        this.closeDialog();
      })
      .finally(() => {
        this.updateExchangeRateLists();
        this.layout.setToUnloading();
      });
    } 
    else {
      // Create - Construimos el objeto limpio para cumplir estrictamente con el esquema
      const model = this.exchangeRateModel();
      const newRate: ExchangeRate = {
        id: crypto.randomUUID(),
        rateType: model.rateType,
        amount: model.amount,
        createdAt: Temporal.Now.instant().toString()
      };
      
      this.database.insertData(Collection.EXCHANGE_RATE, newRate)
      .then(() => {
        this.getExchangeRateList();
        this.closeDialog();
      })
      .finally(() => {
        this.updateExchangeRateLists();
        this.layout.setToUnloading();
      });
    }
  }
}
