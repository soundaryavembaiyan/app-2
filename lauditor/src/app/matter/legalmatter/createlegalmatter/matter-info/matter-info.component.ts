import { ConfirmationDialogService } from './../../../../confirmation-dialog/confirmation-dialog.service';
import { Router } from '@angular/router';
import { URLUtils } from 'src/app/urlUtils';
import { HttpService } from 'src/app/services/http.service';
import { MatterService } from './../../../matter.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { LeavepageComponent } from '../leavepage/leavepage.component';
import { MatDialog } from '@angular/material/dialog';
  

@Component({

  selector: 'matter-info',
  templateUrl: 'matter-info.component.html',
  styleUrls: ['matter-info.component.scss']
})
export class MatterInfoComponent implements OnInit {
  @Input() type: string = 'create';
  @Input() data: any;
  @Output() childButtonEvent = new EventEmitter();
  events: string[] = [];
  advicates: any
  caseRegister: any = FormGroup;
  desc: any;
  //memberDetail:any=FormGroup;
  submitted = false;
  opponent_advocates: any = [];
  pipe = new DatePipe('en-US');
  isEdit: boolean = false;
  selectedPriority: string = "High";
  selectedStatus: string = "Active";
  editeMatterInfo: any;
  Documents: any;
  isAddDisable: boolean = false;
  readonly NoWhitespaceRegExp: RegExp = new RegExp("\\S");
  //minDate:any=new Date();
  constructor(private fb: FormBuilder, private oa: FormBuilder, private matterService: MatterService, private toast: ToastrService,
    private httpService: HttpService, private dialog: MatDialog, private router: Router, private confirmationDialogService: ConfirmationDialogService) { }

  ngOnInit() {
    console.log('data',this.data)
    this.caseRegister = this.fb.group({
      title: ['',[Validators.required,Validators.pattern(this.NoWhitespaceRegExp)]],
      case_number: ['',[ Validators.required,Validators.pattern(this.NoWhitespaceRegExp)]],
      date_of_filling: [''],
      description: [''],
      tags:[''],
      case_type: [''],
      court_name: [''],
      judges: [''],
      status: ['Active'],
      priority: ['High']
    })
    if (this.data) {
      this.caseRegister.patchValue(this.data);
      if (this.data.date_of_filling) {
        this.caseRegister.controls["date_of_filling"].setValue(new Date(this.data.date_of_filling));
      }
      if (this.data.status) {
        this.caseRegister.controls["status"].setValue((this.data.status));
      }
      if (this.data.priority) {
        this.caseRegister.controls["priority"].setValue((this.data.priority));
      }
      this.selectedStatus = this.data.status;
      this.selectedPriority = this.data.priority;
    }
    if (window.location.pathname.indexOf("matterEdit") > -1) {
      this.matterService.editLegalMatterObservable.subscribe((result: any) => {
        if (result) {
          this.editeMatterInfo = result;
          this.isEdit = true;

          let transformedTags = '';
          if (this.editeMatterInfo.tags) {
            transformedTags = this.editeMatterInfo.tags.name || '';
          }
    
          // Patch the form value with the transformed tags
          this.caseRegister.patchValue({
            ...this.editeMatterInfo,
            tags: transformedTags
          });
          //this.caseRegister.patchValue(this.editeMatterInfo);
          if (this.editeMatterInfo.date_of_filling) {
          this.caseRegister.controls["date_of_filling"].setValue(new Date(this.editeMatterInfo.date_of_filling));
          }
          this.selectedStatus = this.editeMatterInfo.status;
          this.selectedPriority = this.editeMatterInfo.priority;
          this.caseRegister.controls["case_number"].setValue(this.editeMatterInfo.caseNumber);
          this.caseRegister.controls["case_type"].setValue(this.editeMatterInfo.caseType);
          this.caseRegister.controls["court_name"].setValue(this.editeMatterInfo.courtName);
          this.getDocuments();
        }
        else if(result.error)
        this.toast.error(result.msg)
      }
      )
    }
     // Subscribe to form value changes
     this.caseRegister.valueChanges.subscribe(() => {
      this.isAddDisable = this.checkIfFormHasValue();
     });
  }

  // openDialog() {
  //   this.dialog.open(LeavepageComponent);
  // }

  checkIfFormHasValue(): boolean {
    const controls = Object.values(this.caseRegister.controls) as AbstractControl[];
    return controls.some(control => {
        return control.value && control.value.trim().length > 0;
    });
  }

  get f() {
    return this.caseRegister.controls;
  }
  getDocuments() {
    this.httpService.sendGetRequest(URLUtils.legalHistoryDocuments(this.editeMatterInfo.id)).subscribe(
      (res: any) => {
        if (res) {
          this.Documents = res.documents;
        }
      });
  }
  // get member_name(){
  //   return this.caseRegister.memberDetail.get('member_name') as FormControl;
  // }
  receiveAutoMsgHandler(details: any) {
    if (details == null) {
      this.isAddDisable = true;
    } else {
      this.isAddDisable= true;
      this.advicates = details;
    }
    //console.log(" this.advicates------------>" + this.advicates)
  }
  getPriority(data: any) {
    this.caseRegister.controls.priority.patchValue(data ? data : "High");

  }
  getStatus(data: any) {
    this.caseRegister.controls.status.patchValue(data ? data : "Active");
  }
  addOpponenteAdvicate() {

  }
  onSubmit() {
    this.submitted = true;
    if (this.caseRegister.invalid) {
      return;
    }
    this.caseRegister.value.opponent_advocates = this.advicates;
    // this.caseRegister.value.status = 'Active'
    // this.caseRegister.value.priority = 'High'
    //this.caseRegister.value.status =this.caseRegister.status=="INVALID" || this.caseRegister.status=="VALID" ?"Active":this.caseRegister.status;
    //this.caseRegister.value.priority = this.caseRegister?.priority? this.caseRegister.priority:"High";
    //console.log(JSON.stringify(this.caseRegister.value));
    if (this.isEdit) {
      // this.caseRegister.value.date_of_filling = this.pipe.transform(this.caseRegister.value.date_of_filling, 'dd-MM-yyyy');
      let data = {
        "title": this.caseRegister.value.title,
        "case_number": this.caseRegister.value.case_number,
        //"date_of_filling": this.pipe.transform(this.caseRegister.value.date_of_filling, 'dd-MM-yyyy'),
        "date_of_filling": this.caseRegister.value.date_of_filling ? this.pipe.transform(this.caseRegister.value.date_of_filling, 'dd-MM-yyyy') : null,
        "description": this.caseRegister.value.description,
        "case_type": this.caseRegister.value.case_type,
        "court_name": this.caseRegister.value.court_name,
        "judges": this.caseRegister.value.judges,
        "priority": this.caseRegister.value.priority,
        "status": this.caseRegister.value.status,
        "affidavit_isfiled": "na",
        "affidavit_filing_date": "",
        "opponent_advocates": this.advicates?.length > 0 ? this.advicates : this.editeMatterInfo.opponentAdvocates,
        "clients": this.editeMatterInfo?.clients.map((obj: any) => ({ "id": obj.id, "type": obj.type })),
        "group_acls": this.editeMatterInfo.groupAcls,
        //"members": this.editeMatterInfo?.members.map((obj: any) => ({ "id": obj.id })),
        "members": this.editeMatterInfo?.members.map((obj: any) => ({ "id": obj.id })).filter((member: any, index: any, self: any[]) => index === self.findIndex((m) => m.id === member.id)),
        "documents": this.Documents.map((obj: any) => ({
          "docid": obj.docid,
          "doctype": obj.doctype,
          "user_id": obj.user_id
        }))
      }
      //console.log('data',data)

      this.httpService.sendPutRequest(URLUtils.updateLegalMatter(this.editeMatterInfo.id), data).subscribe((res: any) => {
        console.log('up',res);
        if(!res.error){
          this.confirmationDialogService.confirm('Success', 'Congratulations! You have successfully updated the matter information.',false,'View Matter List','Cancel',true)
          .then((confirmed) => {
            if (confirmed) {
              this.router.navigate(['/matter/legalmatter/view']);
            }
          })
        }
      },
      (error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          const errorMessage = error.error.msg || 'Unauthorized';
          this.toast.error(errorMessage);
          console.log(error);
        }
      }
      )
    }
    else {
      this.childButtonEvent.emit(this.caseRegister.value);
    }
    // this.isGroups=true;
    // console.log('submit form',this.caseRegister.value)
  }


  addEvent(type: string, event: any) {
    this.events.push(`${type}: ${event.value}`);
    //console.log("Date --->" + this.events);
  }
  OnCancel() {
    let caseReg = this.caseRegister.value
    const hasValidInput =
      (this.caseRegister.get('title').touched && caseReg.title.trim().length > 0) ||
      (this.caseRegister.get('case_number').touched && caseReg.case_number.trim().length > 0) ||
      (this.caseRegister.get('case_type').touched && caseReg.case_type.trim().length > 0) ||
      (this.caseRegister.get('court_name').touched && caseReg.court_name.trim().length > 0) ||
      (this.caseRegister.get('date_of_filling').touched && caseReg.date_of_filling.trim().length > 0) ||
      (this.caseRegister.get('description').touched && caseReg.description.trim().length > 0) ||
      (this.caseRegister.get('judges').touched && caseReg.judges.trim().length > 0) ||
      (this.caseRegister.get('priority').touched && caseReg.priority.trim().length > 0) ||
      (this.caseRegister.get('status').touched && caseReg.status.trim().length > 0) ||
      (this.caseRegister.get('tags').touched && caseReg.tags.trim().length > 0);

    if (this.isEdit) {
      this.router.navigate(['/matter/legalmatter/view']);
    }
    else {
      if (hasValidInput || this.data) {
        this.dialog.open(LeavepageComponent, {
          width: '350px',  // Set the width here
          height: '180px',
          hasBackdrop: true,
          panelClass: 'hello',
          disableClose: true
        });
        return;
      }
    }
    //else {
      //this.caseRegister.reset();
      // this.caseRegister.patchValue({
      //   title: '',
      //   case_number: '',
      //   date_of_filling: '',
      //   description: '',
      //   tags: '',
      //   case_type: '',
      //   court_name: '',
      //   judges: '',
      //   status: ['Active'],
      //   priority: ['High']
      //});
    //}
  }
  restricttextSpace(event: any) {
    let inputValue: string = event.target.value;
    inputValue = inputValue.replace(/^\s+/, '');
    inputValue = inputValue.replace(/\s{2,}/g, ' ');
    event.target.value = inputValue;
    return;
  }
}
