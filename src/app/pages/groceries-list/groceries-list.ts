import { Component, inject } from '@angular/core';
import { Temporal } from '@js-temporal/polyfill';
import { TranslateModule } from '@ngx-translate/core';
import { Layout } from '../../core/services/layout';
import { IBreadcrumb } from '../../core/services/interfaces/breadcrumb.interface';

@Component({
  selector: 'app-groceries-list',
  imports: [ TranslateModule ],
  templateUrl: './groceries-list.html',
  styleUrl: './groceries-list.scss',
})
export class GroceriesList {
  layout = inject(Layout);
  exchangeRateDate: Temporal.ZonedDateTime = Temporal.Now.zonedDateTimeISO('UTC');

  ngOnInit(): void {
    this.layout.cleanBreadcrumb();
    this.layout.setHeaderTitle('GROCERIES_LIST.TITLE');
    const breadcrumbItem: IBreadcrumb = {
      id: "GroceriesList",
      label: "GROCERIES_LIST.BREADCRUMB_NAME",
      url: "/exchange-rate"
    }
    this.layout.setBreadcrumbItem(breadcrumbItem);
  }

}
