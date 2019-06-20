import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ViewerComponent } from './viewer.component';
import { MaterialModule } from '../material.module';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { IonicModule } from '@ionic/angular';
import { NgbModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialFileInputModule,
    IonicModule,
    MaterialModule,
    NgbModule,
    NgbModalModule,
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ViewerComponent
      }
    ])
  ],
  declarations: [ViewerComponent]
})
export class ViewerModule { }
