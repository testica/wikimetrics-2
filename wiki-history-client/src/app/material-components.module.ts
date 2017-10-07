import { NgModule } from '@angular/core';
import { MdCardModule, MatButtonModule } from '@angular/material';

const components = [MdCardModule, MatButtonModule];

@NgModule({ imports: components, exports: components })

export class MaterialComponentsModule {}
