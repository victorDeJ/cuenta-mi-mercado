import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home-page',
  imports: [TranslateModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  private readonly translate = inject(TranslateService);

  useLanguage(language: string): void {
    this.translate.use(language);
  }
}
