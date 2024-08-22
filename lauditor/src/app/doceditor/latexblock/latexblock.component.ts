import { Component, Inject, Injectable, Input, Output, OnInit, EventEmitter, ViewChild, ElementRef, Renderer2, AfterViewInit, Optional, OnChanges } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ModalService } from 'src/app/model/model.service';
import { HttpService } from 'src/app/services/http.service';
import { URLUtils } from 'src/app/urlUtils';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ChangeDetectorRef } from '@angular/core';
import { ConfirmationDialogService } from 'src/app/confirmation-dialog/confirmation-dialog.service';


@Component({
  selector: 'app-latexblock',
  templateUrl: './latexblock.component.html',
  styleUrls: ['./latexblock.component.scss']
})
export class LatexblockComponent implements OnInit {
  //@Output() submitted = new EventEmitter();
  //@Output() dataEvent: EventEmitter<any> = new EventEmitter<any>();
  
  @Input() content: any;
  @Input() id: any;
  @Input() isOpen: boolean = true

  @Output() formDataEvent: EventEmitter<any> = new EventEmitter<any>();

  latexForm: any;
  overviewForm: any;
  sectionForm: any;
  subsectionForm: any;
  subsubsectionForm: any;
  paragraphForm: any;
  orderedlistForm: any;
  unorderedlistForm: any;

  latex: any;
  latexTitle: any;
  isSection: boolean = false;
  latexDialog: boolean = true;
  closeDiv = true;
  latexBlock: boolean = false;

  @Input() contentTitle:any;

  orderListItems: any;
  orderlist: any;
  orderlistTitle: any;
  isOrderlist: boolean = false;

  unorderListItems: any;
  unorderlist: any;
  unorderlistTitle: any;
  isunOrderlist: boolean = false;

  overview:any;
  overviewTitle:any;

  section: any;
  sectionTitle: any;
  subsection: any;
  subsectionTitle: any;
  subsubsection: any;
  subsubsectionTitle: any;
  paragraph:any;
  paragraphTitle:any;

  @Input() latexcode: any;
  @Input() onSave:any;

  // @Input() title: any;
  // @Input() author: any;
  // @Input() date: any;

  constructor(private router: Router, private fb: FormBuilder, private httpservice: HttpService,
    private toast: ToastrService, private cdr: ChangeDetectorRef,
    private renderer: Renderer2, private modalService: ModalService, private confirmationDialogService: ConfirmationDialogService,
    public sanitizer: DomSanitizer, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.overviewForm = this.fb.group({
      overview: [''],
    });
    this.sectionForm = this.fb.group({
      section:[''],
      sectionTitle:['']
    });
    this.subsectionForm = this.fb.group({
      subsection:[''],
      subsectionTitle:['']
    });
    this.subsubsectionForm = this.fb.group({
      subsubsection:[''],
      subsubsectionTitle:['']
    });
    this.paragraphForm = this.fb.group({
      paragraph: [''],
      paragraphTitle:['']
    });
    this.orderedlistForm = this.fb.group({
      orderListItems: this.fb.array([this.createorderItem()])
    });
    this.unorderedlistForm = this.fb.group({
      unorderListItems: this.fb.array([this.createunorderItem()]),
    });

    this.orderListItems = this.orderedlistForm.get('orderListItems') as FormArray;
    this.unorderListItems = this.unorderedlistForm.get('unorderListItems') as FormArray;

    // console.log('title',this.content)
    // console.log('this.overviewForm',this.overviewForm.value)
    
    if (this.content === 'OVERVIEW') {
      this.overviewForm.valueChanges.subscribe(() => {
        this.formDataEvent.emit({
          "overview": this.overviewForm.value.overview
        });
      });
    }
    if (this.content === 'SECTION') {
      this.sectionForm.valueChanges.subscribe(() => {
        this.formDataEvent.emit({
            "section": this.sectionForm.value.section
          });
        this.formDataEvent.emit({
            "sectionTitle": this.sectionForm.value.sectionTitle
          });
      });
    }
    if (this.content === 'SUB SECTION') {
      this.subsectionForm.valueChanges.subscribe(() => {
        this.formDataEvent.emit({
            "subsection": this.subsectionForm.value.subsection
          });
        this.formDataEvent.emit({
            "subsectionTitle": this.subsectionForm.value.subsectionTitle
          });
      });
    }
    if (this.content === 'SUB SUB SECTION') {
      this.subsubsectionForm.valueChanges.subscribe(() => {
        this.formDataEvent.emit({
            "subsubsection": this.subsubsectionForm.value.subsubsection
          });
        this.formDataEvent.emit({
            "subsubsectionTitle": this.subsubsectionForm.value.subsubsectionTitle
          });
      });
    }
    
    if (this.content === 'PARAGRAPH') {
      this.paragraphForm.valueChanges.subscribe(() => {
        this.formDataEvent.emit({
            "paragraph": this.paragraphForm.value.paragraph
          });
        this.formDataEvent.emit({
            "paragraphTitle": this.paragraphForm.value.paragraphTitle
          });
      });
    }
    if (this.content === 'ORDERED LIST') {
      this.orderedlistForm.valueChanges.subscribe(() => {
        this.formDataEvent.emit({
            "orderListItems": this.orderedlistForm.value.orderListItems
          });
      });
    }
    if (this.content === 'UNORDERED LIST') {
      this.unorderedlistForm.valueChanges.subscribe(() => {
        this.formDataEvent.emit({
            "unorderListItems": this.unorderedlistForm.value.unorderListItems
          });
      });
    }

    console.log('child onSave',this.onSave)
  }


  extractionData() {
    // this.isOpen = true;
    console.log('latexcode!',this.latexcode)
    console.log('extraction works on child!')

    // Extract Abstract Title and Content
    this.overview = this.latexcode?.document.match(/\\abstract\{([^}]*)\}/);
    this.overview = this.overview && this.overview.length > 2 ? this.overview[1] : '';
    this.overview = this.overview.replace(/<ltk>/g, '');
    console.log('Extracted Overview:', this.overview);

    // Extract Section Title and Content
    this.section = this.latexcode?.document.match(/\\section{([^}]*)}([^]*)\\subsection{/);
    this.sectionTitle = this.section && this.section.length > 1 ? this.section[1] : '';
    this.section = this.section && this.section.length > 2 ? this.section[2] : '';
    this.section = this.section.replace(/<ltk>/g, '');
    console.log("Extracted sectionTitle:", this.sectionTitle);
    console.log("Extracted sectionContent:", this.section);

    // Extract subSection Title and Content
    this.subsection = this.latexcode?.document.match(/\\subsection{([^}]*)}([^]*)\\subsubsection{/);
    this.subsectionTitle = this.subsection && this.subsection.length > 1 ? this.subsection[1] : '';
    this.subsection = this.subsection && this.subsection.length > 2 ? this.subsection[2] : '';
    this.subsection = this.subsection.replace(/<ltk>/g, '');
    // console.log("Extracted subsectionTitle:", this.subsectionTitle);
    // console.log("Extracted subsectionContent:", this.subsection);

    // Extract subsubSection Title and Content
    this.subsubsection = this.latexcode?.document.match(/\\subsubsection{([^}]*)}([^]*)\\paragraph{/);
    this.subsubsectionTitle = this.subsubsection && this.subsubsection.length > 1 ? this.subsubsection[1] : '';
    this.subsubsection = this.subsubsection && this.subsubsection.length > 2 ? this.subsubsection[2] : '';
    this.subsubsection = this.subsubsection.replace(/<ltk>/g, '');
    // console.log("Extracted subsubsectionTitle:", this.subsubsectionTitle);
    // console.log("Extracted subsubsectionContent:", this.subsubsection);

    //Extract Paragraph Title and Content
    this.paragraph = this.latexcode?.document.match(/\\paragraph\{([^}]*)\}/);
    this.paragraphTitle = this.paragraph && this.paragraph.length > 1 ? this.paragraph[1] : '';
    this.paragraph = this.paragraph && this.paragraph.length > 2 ? this.paragraph[2] : '';
    this.paragraph = this.paragraph.replace(/<ltk>/g, '');
    // console.log("Extracted paragraphTitle:", this.paragraphTitle);
    // console.log("Extracted paragraphContent:", this.paragraph);

    const itemizeMatches = this.latexcode?.document.match(/\\begin{itemize}([^]*?)\\end{itemize}/);
    const itemizeContent = itemizeMatches && itemizeMatches.length > 0 ? itemizeMatches[1] : '';
    const itemizeList = itemizeContent.match(/\\item\s([^\\]*)/g);
    const itemizedItems = itemizeList ? itemizeList.map((match: string) => match.replace(/\\item\s/, '').trim()) : [];
    // console.log("Extracted OrderedList:", itemizedItems);
    //this.updateOrderListItemsForm(itemizedItems); // Update the orderlist extracted data

    // Extract UnOrdered List items
    const enumerateMatches = this.latexcode?.document.match(/\\begin{enumerate}([^]*?)\\end{enumerate}/);
    const enumerateContent = enumerateMatches && enumerateMatches.length > 0 ? enumerateMatches[1] : '';
    const enumerateList = enumerateContent.match(/\\item\s([^\\]*)/g);
    const enumeratedItems = enumerateList ? enumerateList.map((match: string) => match.replace(/\\item\s/, '').trim()) : [];
    //console.log("Extracted UnorderedList:", enumeratedItems);
    //this.updateUnOrderListItemsForm(enumeratedItems); // Update the unorderlist extracted data

  }

  //ORDERLSITS
  addorderList(): void {
    //console.log('orderListItems', this.orderListItems)
    this.orderListItems = this.orderedlistForm.get('orderListItems') as FormArray;
    this.orderListItems.push(this.createorderItem());
  }
  createorderItem(): FormGroup {
    return this.fb.group({
      orderlist: [''] // Initialize with an empty value
    });
  }

  removeorderList(i: number) {
    const orderListItemsArray = this.orderListItems as FormArray;
    orderListItemsArray.removeAt(i);
  }

  //Disable Add button if it empty
  isorderItemsInvalid(): boolean {
    const orderListItems = this.orderedlistForm.get('orderListItems') as FormArray;
    for (let i = 0; i < orderListItems.length; i++) {
      const item = orderListItems.at(i) as FormGroup;
      const orderList = item.get('orderlist')?.value;

      if (!orderList) {
        return true;
      }
    }
    return false;
  }

  //UNORDERLSITS
  addunorderList(): void {
    this.unorderListItems = this.unorderedlistForm.get('unorderListItems') as FormArray;
    this.unorderListItems.push(this.createunorderItem());
  }
  createunorderItem(): FormGroup {
    return this.fb.group({
      unorderlist: [''] // Initialize with an empty value
    });
  }

  removeunorderList(i: number) {
    const unorderListItemsArray = this.unorderListItems as FormArray;
    unorderListItemsArray.removeAt(i);
  }
  
  //Disable Add button if it empty
  isunorderItemsInvalid(): boolean {
    const unorderListItems = this.unorderedlistForm.get('unorderListItems') as FormArray;
    for (let i = 0; i < unorderListItems.length; i++) {
      const item = unorderListItems.at(i) as FormGroup;
      const unorderList = item.get('unorderlist')?.value;

      if (!unorderList) {
        return true;
      }
    }
    return false;
  }

  removeOverview() {
    this.overviewForm.reset();
    this.overview = '';
    this.closeDiv = false;
  }

  removeSection() {
    this.sectionForm.reset();
    this.closeDiv = false;
  }
  removesubSection() {
    this.subsectionForm.reset();
    this.closeDiv = false;
  }
  removesubsubSection() {
    this.subsubsectionForm.reset();
    this.closeDiv = false;
  }
  removeParagraph() {
    this.paragraphForm.reset();
    this.closeDiv = false;
  }

  //Dialog boxes for all sections!!!
  openparagraphDialog() {
    this.latexDialog = true;

      const dialogRef = this.dialog.open(LatexDialogComponent, {
        width: '600px',
        height: '330px',
        data: {
          paragraph: this.paragraph,
          paragraphTitle: this.paragraphTitle,
        },
        hasBackdrop: true,
        panelClass: 'hello',
        autoFocus: true
      });
      //console.log('pass data to dialog', dialogRef)
  
      dialogRef.afterClosed().subscribe((result: {paragraph: string, paragraphTitle: string}) => {
        if (result) {
          this.paragraph = result.paragraph;
          this.paragraphTitle = result.paragraphTitle;
        }
      });
  }

  opensectionDialog(){
  }

  opensubsectionDialog(){
  }

  opensubsubsectionDialog(){
  }

}


@Component({
  selector: 'app-latex-dialog',
  templateUrl: './latex-dialog.component.html',
  styleUrls: ['./latexblock.component.scss']
})

@Injectable()
export class LatexDialogComponent {
  
  @Input() content: any;
  dialog: any;
  name: any;
  latexdialogForm: any;

  latex: any;
  latexTitle: any;
  isSection: boolean = false;
  latexDialog: boolean = true;
  
  paragraph: any;
  paragraphTitle:any;

  constructor(
    public dialogRef: MatDialogRef<LatexDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: {paragraph:string, paragraphTitle:string},
    private fb: FormBuilder
  ) {
    this.paragraph = data.paragraph;
    this.paragraphTitle = data.paragraphTitle;
  }

  ngOnInit() {
    //console.log('dial content',this.content)
    this.latexdialogForm = this.fb.group({
      paragraph: [''],
      paragraphTitle:['']
    });
  }

  save() {
    const data = {
      paragraph: this.paragraph,
      paragraphTitle:this.paragraphTitle
    };
    this.dialogRef.close(data);
    //console.log('closeData from dialog', data)
  }

  closeDialog() {
    this.dialogRef.close()
  }

  onInputChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.paragraph = target.value; // latex to parent textarea
  }

  prependHyphen(newTitle: string) {
    if (newTitle && !newTitle.startsWith(' ')) {
      this.paragraphTitle = '' + newTitle;
    }
  }

}
