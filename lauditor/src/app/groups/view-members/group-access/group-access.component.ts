import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { URLUtils } from 'src/app/urlUtils';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationDialogService } from 'src/app/confirmation-dialog/confirmation-dialog.service';
 

@Component({
  selector: 'app-group-access',
  templateUrl: './group-access.component.html',
  styleUrls: ['./group-access.component.scss']
})
export class GroupAccessComponent implements OnInit {


  @Input() memData: any;
  @Input() showGroupAccessForm = false;
  @Output() event = new EventEmitter<string>();

  product = environment.product;
  groupList: any[] = [];
  selectedIds: string[] = [];
  isSaveEnable: boolean = false;
  updateSuccessModal: boolean = false;

  constructor(private formBuilder: FormBuilder, private toast: ToastrService, private confirmationDialogService: ConfirmationDialogService,
              private httpService: HttpService) { }
  
  ngOnInit(){
    this.loadGroups()
    this.selectedIds = this.memData.groups.map((x: any) => x.id)
  }

  scrollToTop() {
    window.scrollTo({
      top: 0, 
      behavior: 'smooth' // Optional for smooth scrolling
    });
  } 

  cancel(){
    this.scrollToTop();
    this.event.emit('group-access-close')
  }
  
  loadGroups(){
     this.httpService.sendGetRequest(URLUtils.getGroups).subscribe((res: any) => {
      this.groupList = res?.data;
    })
  }

  getMember() {
    this.httpService.sendGetRequest(URLUtils.getMembers).subscribe((res: any) => {
      this.event.emit('group-access-done')
    })
    this.scrollToTop();
  }

  save() {
    var payload = { "groups": this.selectedIds }
    this.httpService.sendPatchRequest(URLUtils.updateMember(this.memData),
      payload).subscribe((res: any) => {
        //this.event.emit('group-access-done')
        this.updateSuccessModal = true;
      },
        (error: HttpErrorResponse) => {
          if (error.status === 401 || error.status === 403) {
            const errorMessage = error.error.msg || 'Unauthorized';
            this.toast.error(errorMessage);
            //console.log(error);
          }
        })
    // this.scrollToTop();
  }

  selectGrp(grp: any, checked: boolean){
    this.isSaveEnable = true;
    if(checked){
      this.selectedIds.push(grp.id)
    } else {
      this.selectedIds.splice(this.selectedIds.indexOf(grp.id), 1)
    }
  }

}