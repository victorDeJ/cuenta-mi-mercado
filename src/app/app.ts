import { Component, signal, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Layout } from './core/services/layout/layout';
import { Database } from './core/services/database/database';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  router = inject(Router);
  layout = inject(Layout);
  database = inject(Database);

  private readonly translate = inject(TranslateService);
  protected readonly title = signal('cuenta-mi-mercado');

  constructor() {
    this.translate.addLangs(['es', 'en']);
    this.translate.setDefaultLang('es');
    this.translate.use('es');
  }

  ngOnInit() {
    if(
    this.layout.getCurrentBreadcrumb().id === 'home'
    ){
      this.navigateToPage('/')
    }
  }

  onDeactivate() {
    this.layout.clearLayout();
  }

  navigateToPage(url: string) {
    this.router.navigate([url]);
  }
}
