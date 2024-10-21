// Angular Imports
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { CommonModule,DatePipe } from '@angular/common';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DocumentComponent } from './document.component';
import { DocumentRoutingModule } from './document.routing.module';
import { MergePdfComponent } from './merge-pdf/merge-pdf.component';
import { DocumentUploadComponent } from './document-upload/document-upload.component';
import { DocumentViewComponent } from './document-view/document-view.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { ToastrModule } from 'ngx-toastr';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModelModule } from '../model/model.module';
import { PdfDocumentMergeComponent } from './pdf-document-merge/pdf-document-merge.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { WaterMarkComponent } from './water-mark/water-mark.component';
import { EditMetadataComponent } from './edit-metadata/edit-metadata.component';
import { DeletePagesComponent } from './delete-pages/delete-pages.component';
import { AddShortTextComponent } from './add-short-text/add-short-text.component';
import { AddCustomPagesComponent } from './add-custom-pages/add-custom-pages.component';
import { DocumentService } from './document.service';
import { SharedModule } from '../shared/shared.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MAT_RADIO_DEFAULT_OPTIONS, MatRadioModule } from '@angular/material/radio';
// import { BrowserModule } from '@angular/platform-browser';
@NgModule({
    imports: [
        // BrowserModule,
        FormsModule,
        RouterModule,
        CommonModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        DocumentRoutingModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatSelectModule,
        MatCardModule,
        MatInputModule,
        AutocompleteLibModule,
        NgxDocViewerModule,
        ToastrModule.forRoot(),
        BsDatepickerModule.forRoot(),
        ModelModule,
        DragDropModule,
        SharedModule,
        Ng2SearchPipeModule,
        NgxPaginationModule,
        MatPaginatorModule ,
        NgxSpinnerModule,
        MatMenuModule,
        MatIconModule,
        MatTooltipModule,
        MatButtonModule,
        MatRadioModule
    ],
    declarations: [
        DocumentComponent,
        MergePdfComponent,
        DocumentUploadComponent,
        DocumentViewComponent,
        PdfDocumentMergeComponent,
        WaterMarkComponent,
        EditMetadataComponent,
        DeletePagesComponent,
        AddShortTextComponent,
        AddCustomPagesComponent,
    ],
    exports: [
        DocumentViewComponent,
    ],
    providers: [BsDatepickerConfig,DocumentService,DatePipe,{
        provide: MAT_RADIO_DEFAULT_OPTIONS,
        useValue: { color: 'cyan' },
    }],
})
export class DocumentModule {

}
