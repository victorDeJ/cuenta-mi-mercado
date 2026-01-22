import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { Temporal } from '@js-temporal/polyfill';
import { TranslateModule } from '@ngx-translate/core';
import { Layout } from '../../core/services/layout/layout';
import { IBreadcrumb } from '../../core/services/layout/interfaces/breadcrumb.interface';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-groceries-list-page',
  imports: [TranslateModule, DialogModule, NgClass, DecimalPipe],
  templateUrl: './groceries-list-page.html',
  styleUrl: './groceries-list-page.scss',
})
export class GroceriesListPage {
  layout = inject(Layout);
  dialog = inject(Dialog);

  @ViewChild('itemContent') itemContent!: TemplateRef<any>;
  showWeightOptions: boolean = false;
  @ViewChild('confirmDeleteItem') confirmDeleteItem!: TemplateRef<any>;

  exchangeRateDate: Temporal.ZonedDateTime = Temporal.Now.zonedDateTimeISO('UTC');

  ngOnInit(): void {
    this.layout.cleanBreadcrumb();
    this.layout.setHeaderTitle('GROCERIES_LIST.TITLE');
    const breadcrumbItem: IBreadcrumb = {
      id: 'GroceriesList',
      label: 'GROCERIES_LIST.BREADCRUMB_NAME',
      url: '/exchange-rate',
    };
    this.layout.setBreadcrumbItem(breadcrumbItem);
  }

  showItemContent(index: number) {
    this.dialog.open(this.itemContent, {
      width: '90%',
      maxWidth: '500px',
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  showConfirmDeleteItem(index: number) {
    this.dialog.open(this.confirmDeleteItem, {
      width: '90%',
      maxWidth: '500px',
    });
  }

  closeConfirmDeleteItem() {
    this.dialog.closeAll();
  }
}
