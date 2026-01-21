import { Injectable, signal, WritableSignal } from '@angular/core';
import { IBreadcrumb } from './interfaces/breadcrumb.interface';

@Injectable({
  providedIn: 'root',
})
export class Layout {
  headerTitle: WritableSignal<string> = signal('')
  private initBreadcrumb: IBreadcrumb = {
    id: 'home',
    label: 'HOME.BREADCRUMB_NAME',
    url: '/',
  };
  breadcrumb: WritableSignal<IBreadcrumb[]> = signal([ {...this.initBreadcrumb}]);


  setHeaderTitle(headerTitle: string): void {
    this.headerTitle.set(headerTitle);
  }

  cleanBreadcrumb() {
    this.breadcrumb.set([ {...this.initBreadcrumb}]); 
  }

  getCurrentBreadcrumb(): IBreadcrumb {
    return this.breadcrumb()[ this.breadcrumb().length -1 ] ?? {...this.initBreadcrumb};
  }

  setBreadcrumbItem(breadcrumbItem: IBreadcrumb){
    if(  this.breadcrumb()[0].id === breadcrumbItem.id){
      return;
    }
    if( this.breadcrumb().length === 0 || this.breadcrumb()[0].id !== this.initBreadcrumb.id){
      this.breadcrumb.set([ {...this.initBreadcrumb}]);
    }
    this.breadcrumb.update((prev) => [...prev, breadcrumbItem]);
  }

  deleteBreadcrumbItem(id: string){
    if(  this.breadcrumb()[0].id === id){
      return;
    }
    if( this.breadcrumb().length === 0 || this.breadcrumb()[0].id !== this.initBreadcrumb.id){
      this.breadcrumb.set([ {...this.initBreadcrumb}]);
      return;
    }

    const index = this.breadcrumb().findIndex((item) => item.id === id);
    if (index !== -1) {
      this.breadcrumb.update((prev) => prev.slice(0, index));
    }
  }

  clearLayout(): void {
    this.headerTitle.set('');
    this.breadcrumb.set([{ ...this.initBreadcrumb }]);
  }

  getPreviousBreadcrumb(): IBreadcrumb | undefined {
    if( this.breadcrumb().length === 1 ){
      return;
    }
    return this.breadcrumb()[ this.breadcrumb().length -2 ] ?? {...this.initBreadcrumb};
  }
}
