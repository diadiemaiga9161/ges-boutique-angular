import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- CommonModule
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule, // <-- PAS BrowserModule
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class SharedModule { }