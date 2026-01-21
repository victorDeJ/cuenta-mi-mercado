import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Temporal } from '@js-temporal/polyfill';
import { DatePipe } from '@angular/common';
import { Layout } from '../../core/services/layout';
import { IBreadcrumb } from '../../core/services/interfaces/breadcrumb.interface';

@Component({
  selector: 'app-exchange-rate-page',
  imports: [TranslateModule, DatePipe],
  templateUrl: './exchange-rate-page.html',
  styleUrl: './exchange-rate-page.scss',
})
export class ExchangeRatePage {
  layout = inject(Layout);
  exchangeRateDate: Temporal.ZonedDateTime = Temporal.Now.zonedDateTimeISO('UTC');

  ngOnInit(): void {
    this.layout.cleanBreadcrumb();
    this.layout.setHeaderTitle('EXCHANGE_RATE.TITLE');
    const breadcrumbItem: IBreadcrumb = {
      id: "ExchangeRate",
      label: "EXCHANGE_RATE.BREADCRUMB_NAME",
      url: "/exchange-rate"
    }
    this.layout.setBreadcrumbItem(breadcrumbItem);
  }

  ngAfterViewInit(): void {
    const element = document.getElementById('historialRates');
    if (element) {
      const top = element.getBoundingClientRect().top;
      
      element.style.height = `calc(100vh - ${top}px - 10vh - 8px)`;
    }
  }

}
