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
import { GeneralleavepageComponent } from '../generalleavepage/generalleavepage.component';
import { MatDialog } from '@angular/material/dialog';
  

@Component({

  selector: 'general-matter-info',
  templateUrl: 'general-matter-info.component.html',
  styleUrls: ['general-matter-info.component.scss']
})
export class GeneralMatterInfoComponent implements OnInit {
  @Input() type: string = 'create';
  @Input() data: any;
  @Output() childButtonEvent = new EventEmitter();
  events: string[] = [];
  advicates: any
  generalForm: any = FormGroup;
  desc: any;
  //memberDetail:any=FormGroup;
  submitted = false;
  opponent_advocates: any = [];
  pipe = new DatePipe('en-US');
  isEdit: boolean = false;
  selectedPriority: string = "High";
  selectedStatus: string = "Active";
  editeMatterInfo: any;
  minDateEnd: any = new Date();
  Documents: any;
  isAddDisable: boolean = false;
  matterid:any;
  readonly NoWhitespaceRegExp: RegExp = new RegExp("\\S");

  constructor(private fb: FormBuilder, private oa: FormBuilder, private matterService: MatterService,private toast: ToastrService,
    private httpService: HttpService, private dialog: MatDialog, private router: Router, private confirmationDialogService: ConfirmationDialogService) { }

  ngOnInit() {
    this.generalForm = this.fb.group({
      title: ['',[Validators.required,Validators.pattern(this.NoWhitespaceRegExp)]],
      matterNumber: ['',[ Validators.required,Validators.pattern(this.NoWhitespaceRegExp)]],
      startdate: [''],
      closedate: [''],
      description: [''],
      matterType: [''],
      status: ['Active'],
      priority: ['High']
    })
    if (this.data) {
      this.generalForm.patchValue(this.data);
      if (this.data?.startdate && this.data.startdate != "") {
        this.generalForm.controls["startdate"].setValue(new Date(this.data.startdate));
        this.minDateEnd = new Date(this.data.startdate)
      }
      if (this.data?.closedate && this.data.closedate != ""){
        this.generalForm.controls["closedate"].setValue(new Date(this.data.closedate));
      }
      if (this.data.status) {
        this.generalForm.controls["status"].setValue((this.data.status));
      }
      if (this.data.priority) {
        this.generalForm.controls["priority"].setValue((this.data.priority));
      }
      this.selectedStatus = this.data.status;
      this.selectedPriority = this.data.priority;
    }
    if (window.location.pathname.indexOf("matterEdit") > -1) {
      this.matterService.editGeneralMatterObservable.subscribe((result: any) => {
        if (result) {
          this.editeMatterInfo = result;
          this.matterid = result.id;
          //console.log('editeMatterInfo',this.editeMatterInfo)
          this.isEdit = true;
          this.generalForm.patchValue(this.editeMatterInfo);
          if (this.editeMatterInfo?.startdate && this.editeMatterInfo.startdate != "") {
            this.generalForm.controls["startdate"].setValue(new Date(this.editeMatterInfo.startdate));
            this.minDateEnd = new Date(this.editeMatterInfo.startdate)
          }
          if (this.editeMatterInfo?.closedate && this.editeMatterInfo.closedate != "")
            this.generalForm.controls["closedate"].setValue(new Date(this.editeMatterInfo.closedate));
          this.selectedStatus = this.editeMatterInfo.status;
          this.selectedPriority = this.editeMatterInfo.priority;
          this.getDocuments();
        }
      })
    }
    // Subscribe to form value changes
     this.generalForm.valueChanges.subscribe(() => {
      this.isAddDisable = this.checkIfFormHasValue();
     });
  }

  checkIfFormHasValue(): boolean {
    const controls = Object.values(this.generalForm.controls) as AbstractControl[];
    return controls.some(control => {
        return control.value && control.value.trim().length > 0;
    });
  }

  get f() {
    return this.generalForm.controls;
  }
  // get member_name(){
  //   return this.generalForm.memberDetail.get('member_name') as FormControl;
  // }
  receiveAutoMsgHandler(details: any) {
    this.advicates = details;
    //console.log(" this.advicates------------>" + this.advicates)
  }
  getPriority(data: any) {
    this.generalForm.controls.priority.patchValue(data ? data : "High");

  }
  getStatus(data: any) {
    this.generalForm.controls.status.patchValue(data ? data : "Active");
  }
  addOpponenteAdvicate() {

  }
  onSubmit() {
    this.submitted = true;
    if (this.generalForm.invalid) {
      return;
    }
    let matter = this.generalForm.value
    let body = {"title":matter.title, "matter_number": matter.matterNumber, "type": "general"} 
    let editbody = {"title":matter.title, "matter_number": matter.matterNumber, "matter_id": this.matterid, "type": "general"}

    // if(!this.isEdit){
    // this.generalForm.value.startdate = this.pipe.transform(this.generalForm.value.startdate, 'dd-MM-yyyy');
    // this.generalForm.value.closedate = this.pipe.transform(this.generalForm.value.closedate, 'dd-MM-yyyy');
    // }
    //this.generalForm.value.status = this.generalForm.status == "INVALID" || this.generalForm.status == "VALID" ? "Active" : this.generalForm.status;
    // this.generalForm.value.priority = this.generalForm?.priority ? this.generalForm.priority : "High";
    if (this.isEdit) {
      let data = {
        "title": this.generalForm.value.title,
        "matter_number": this.generalForm.value.matterNumber,
        "startdate": this.pipe.transform(this.generalForm.value.startdate, 'dd-MM-yyyy'),
        "closedate": this.pipe.transform(this.generalForm.value.closedate, 'dd-MM-yyyy'),
        "description": this.generalForm.value.description,
        "matter_type": this.generalForm.value.matterType,
        "priority": this.generalForm.value.priority,
        "status": this.generalForm.value.status,
        "affidavit_isfiled": "na",
        "affidavit_filing_date": "",
        "clients": this.editeMatterInfo?.clients.map((obj: any) => ({ "id": obj.id, "type": obj.type })),
        "group_acls": this.editeMatterInfo.groupAcls,
        //"members": this.editeMatterInfo?.members.map((obj: any) => ({ "id": obj.id })),
        "members": this.editeMatterInfo?.members.map((obj: any) => ({ "id": obj.id })).filter((member: any, index: any, self: any[]) => index === self.findIndex((m) => m.id === member.id)),
        "documents": this.Documents?.map((obj: any) => ({
          "docid": obj.docid,
          "doctype": obj.doctype,
          "user_id": obj.user_id
        }))
      }
      //console.log(data)

      this.httpService.sendPostRequest(URLUtils.checkMatterUnique, editbody).subscribe((res: any) => {
        if(res.error){
          this.confirmationDialogService.confirm('Alert', res.msg, false, 'OK','Cancel', true)
          .then((confirmed) => {
            if (confirmed) {
            }
          })
        }
        else{
          this.httpService.sendPutRequest(URLUtils.updateGeneralMatter(this.editeMatterInfo.id), data).subscribe((res: any) => {
            if (!res.error) {
              this.confirmationDialogService.confirm('Success', 'Congratulations! You have successfully updated the matter information.',false, 'View Matter List', 'Cancel', true)
                .then((confirmed) => {
                  if (confirmed) {
                    this.router.navigate(['/matter/generalmatter/view']);
                  }
                })
            }
          },(error: HttpErrorResponse) => {
            if (error.status === 401 || error.status === 403) {
              const errorMessage = error.error.msg || 'Unauthorized';
              this.toast.error(errorMessage);
            }
          })
        }
      })
    }
    else {
      this.httpService.sendPostRequest(URLUtils.checkMatterUnique, body).subscribe((res: any) => {
        if(res.error){
          // this.toast.error(res.msg);
          // return;
          this.confirmationDialogService.confirm('Alert', res.msg, false, 'OK','Cancel', true)
          .then((confirmed) => {
            if (confirmed) {
            }
          })
        }
        else{
          this.childButtonEvent.emit(this.generalForm.value);
        }
      })
      //this.childButtonEvent.emit(this.generalForm.value);
    }
    // this.isGroups=true;
  }


  addEvent(type: string, event: any) {
    //  this.events.push(`${type}: ${event.value}`);
    //console.log("Date --->" + this.events);
  }
  addEventStart(type: string, event: any) {
    this.minDateEnd = event.value;
    //console.log(event.value);
  }
  OnCancel() {
    let caseReg = this.generalForm.value
    const hasValidInput =
      (this.generalForm.get('title')?.touched && caseReg.title?.trim().length > 0) ||
      (this.generalForm.get('description')?.touched && caseReg.case_number?.trim().length > 0) ||
      (this.generalForm.get('startdate')?.touched && caseReg.case_type?.trim().length > 0) ||
      (this.generalForm.get('closedate')?.touched && caseReg.court_name?.trim().length > 0) ||
      (this.generalForm.get('matterNumber')?.touched && caseReg.date_of_filling?.trim().length > 0) ||
      (this.generalForm.get('matterType')?.touched && caseReg.description?.trim().length > 0) ||
      (this.generalForm.get('priority')?.touched && caseReg.priority?.trim().length > 0) ||
      (this.generalForm.get('status')?.touched && caseReg.status?.trim().length > 0);

    if (this.isEdit) {
      this.router.navigate(['/matter/generalmatter/view']);
    }
    else {
      if (hasValidInput || this.data) {
        this.dialog.open(GeneralleavepageComponent, {
          width: '350px',  // Set the width here
          height: '180px',
          hasBackdrop: true,
          panelClass: 'hello',
          disableClose: true
        });
      }
      else {
        this.router.navigate(['/matter/generalmatter/view']);
      }
    }
    // else {
    //   //this.generalForm.reset();
    //   this.generalForm.patchValue({
    //     title: '',
    //     matterNumber: '',
    //     startdate: '',
    //     closedate: '',
    //     description: '',
    //     matterType: '',
    //     status: ['Active'],
    //     priority: ['High']
    //   });
    // }
  }
  getDocuments() {
    this.httpService.sendGetRequest(URLUtils.generalHistoryDocuments(this.editeMatterInfo.id)).subscribe(
      (res: any) => {
        if (res) {
          this.Documents = res.documents;
        }
      });
  }
  restricttextSpace(event: any) {
    let inputValue: string = event.target.value;
    inputValue = inputValue.replace(/^\s+/, '');
    inputValue = inputValue.replace(/\s{2,}/g, ' ');
    event.target.value = inputValue;
    return;
  }
}
