import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home-page',
  imports: [TranslateModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  router  = inject(Router)
  private readonly translate = inject(TranslateService);

  useLanguage(language: string): void {
    this.translate.use(language);
  }

  navigateToPage( url: string){
    this.router.navigateByUrl(url)
  }
}
