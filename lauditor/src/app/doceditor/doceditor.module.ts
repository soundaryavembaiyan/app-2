
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { DoceditorComponent} from './doceditor.component';
import { LatexblockComponent, LatexDialogComponent } from './latexblock/latexblock.component';
import { ViewDocComponent, OpendialogBoxComponent, DownloadBoxComponent, ContentDialogComponent, SaveasBoxComponent, OverviewExpandComponent } from './doceditor.component';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
    imports: [
        FormsModule,
        RouterModule,
        ReactiveFormsModule, 
        MatDialogModule,
        NgxSpinnerModule
    ],
    declarations: [
        DoceditorComponent,
        LatexblockComponent,
        LatexDialogComponent,
        ViewDocComponent, 
        OpendialogBoxComponent, 
        DownloadBoxComponent,
        SaveasBoxComponent,
        ContentDialogComponent,
        OverviewExpandComponent
    ],
    exports: [
        DoceditorComponent,
    ],
    providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: { } }
    ]
})
export class DoceditorModule{

}

