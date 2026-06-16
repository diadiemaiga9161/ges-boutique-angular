// import { CaisseComponent } from './caisse/caisse.component';
import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule, DecimalPipe } from '@angular/common';

import { BrowserModule } from '@angular/platform-browser';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { PagesRoutingModule } from './pages-routing.module';
import { NgbHighlight, NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbdSortableHeader } from 'src/app/shared/directives/sortable.directive';
import { HttpClientModule } from '@angular/common/http';
// import { CaisseComponent } from './caisse/caisse.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgbModule,
    DecimalPipe,
    FormsModule, 
    AsyncPipe, 
    NgbHighlight, 
    NgbdSortableHeader, 
    NgbPaginationModule,
    PagesRoutingModule, 
    HttpClientModule,
    NgbModalModule,
     
  ],
  declarations: []
})
export class PagesModule { }
