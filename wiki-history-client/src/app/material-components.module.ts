import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  exports: [
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ]
})

export class MaterialComponentsModule {}
