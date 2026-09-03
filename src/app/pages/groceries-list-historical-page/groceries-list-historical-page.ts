import { Component, inject, signal, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { Layout } from '../../core/services/layout/layout';
import { IBreadcrumb } from '../../core/services/layout/interfaces/breadcrumb.interface';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass, DatePipe, DecimalPipe } from '@angular/common';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { Database } from '../../core/services/database/database';
import { Collection } from '../../core/services/database/enums/collections';
import { GroceryList } from '../../core/services/database/collections/grocery-list';
import { ExcelExportService } from '../../core/services/excel-export/excel-export.service';

@Component({
  selector: 'app-groceries-list-historical-page',
  imports: [TranslateModule, DialogModule, NgClass, DatePipe, DecimalPipe],
  templateUrl: './groceries-list-historical-page.html',
  styleUrl: './groceries-list-historical-page.scss',
})
export class GroceriesListHistoricalPage {
  layout = inject(Layout);
  db = inject(Database);
  router = inject(Router);
  dialog = inject(Dialog);
  excelExportService = inject(ExcelExportService);

  @ViewChild('confirmExport') confirmExport!: TemplateRef<any>;

  groceryLists = signal<GroceryList[]>([]);

  async ngOnInit(): Promise<void> {
    this.layout.cleanBreadcrumb();
    this.layout.setHeaderTitle('GROCERIES_LIST_HISTORICAL.TITLE');
    const breadcrumbItem: IBreadcrumb = {
      id: "GroceriesListHistorical",
      label: "GROCERIES_LIST_HISTORICAL.BREADCRUMB_NAME",
      url: "/groceries-list-historical"
    }
    this.layout.setBreadcrumbItem(breadcrumbItem);

    await this.loadGroceryLists();
  }

  async loadGroceryLists() {
    this.layout.setToLoading();
    try {
      const data = await this.db.getData(Collection.GROCERY_LIST, {
        selector: {
          completed: true
        }
      });
      console.log('Loaded grocery lists:', data);
      const sortedLists = (data as GroceryList[]).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      this.groceryLists.set(sortedLists);
    } catch (error) {
      console.error('Error loading grocery lists:', error);
    } finally {
      this.layout.setToUnloading();
    }
  }

  openList(id: string) {
    this.router.navigateByUrl(`/groceries-list-detail/${id}`);
  }

  openSearch() {
    this.router.navigateByUrl('/groceries-search');
  }

  showConfirmExport() {
    this.dialog.open(this.confirmExport, {
      width: '90%',
      maxWidth: '500px',
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  async onConfirmExport() {
    this.closeDialog();
    const lists = this.groceryLists();
    if (lists.length === 0) return;
    this.layout.setToLoading();
    try {
      await this.excelExportService.exportGroceryLists(lists);
    } catch (error) {
      console.error('Error exporting excel:', error);
    } finally {
      this.layout.setToUnloading();
    }
  }
}
