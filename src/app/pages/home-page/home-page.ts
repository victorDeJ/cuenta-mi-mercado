import { Component, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Database } from '../../core/services/database/database';
import { Collection } from '../../core/services/database/enums/collections';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { Layout } from '../../core/services/layout/layout';
import { GroceryList } from '../../core/services/database/collections/grocery-list';

@Component({
  selector: 'app-home-page',
  imports: [TranslateModule, DialogModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly database = inject(Database);
  private readonly dialog = inject(Dialog);
  private readonly layout = inject(Layout);

  pendingListModal = viewChild.required<TemplateRef<any>>('pendingListModal');
  pendingList = signal<GroceryList | null>(null);

  ngOnInit(): void {
    this.checkPendingStatus();
  }

  checkPendingStatus() {
    this.layout.setToLoading();
    setTimeout(async() => {
      try {
        const data = await this.database.getData(Collection.GROCERY_LIST, {
          selector: { completed: false },
          limit: 1
        }) as GroceryList[];
        
        if (data && data.length > 0) {
          this.pendingList.set(data[0]);
        } else {
          this.pendingList.set(null);
        }
      } catch (error) {
        console.error('Error checking pending status:', error);
        this.pendingList.set(null);
      }
      this.layout.setToUnloading();
    }, 500);
  }

  useLanguage(language: string): void {
    this.translate.use(language);
  }

  navigateToPage(url: string) {
    this.router.navigateByUrl(`/${url}`);
  }

  onRegisterShop() {
    if (this.pendingList()) {
      this.dialog.open(this.pendingListModal(), {
        width: '90%',
        maxWidth: '500px',
      });
    } else {
      this.navigateToPage('groceries-list');
    }
  }

  async onContinue() {
    const pending = this.pendingList();
    if (!pending) return;

    this.layout.setToLoading();
    try {
      await this.database.updateData(Collection.GROCERY_LIST, pending.id, {
        completed: true
      });

      const items = await this.database.getData(Collection.GROCERY);
      for (const item of items) {
        await this.database.deleteData(Collection.GROCERY, item.id);
      }

      this.pendingList.set(null);
      this.dialog.closeAll();
      this.navigateToPage('groceries-list-historical');
    } catch (error) {
      console.error('Error completing shop:', error);
    } finally {
      this.layout.setToUnloading();
    }
  }

  async onDiscard() {
    const pending = this.pendingList();
    if (!pending) return;

    this.layout.setToLoading();
    try {
      // 1. Delete the pending list
      await this.database.deleteData(Collection.GROCERY_LIST, pending.id);

      // 2. Clear current grocery items
      const items = await this.database.getData(Collection.GROCERY);
      for (const item of items) {
        await this.database.deleteData(Collection.GROCERY, item.id);
      }

      this.pendingList.set(null);
      this.dialog.closeAll();
      this.navigateToPage('groceries-list');
    } catch (error) {
      console.error('Error discarding shop:', error);
    } finally {
      this.layout.setToUnloading();
    }
  }

  onCancel() {
    this.dialog.closeAll();
  }
}
