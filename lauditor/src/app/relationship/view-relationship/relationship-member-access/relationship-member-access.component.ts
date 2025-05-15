import { Component, OnDestroy, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { URLUtils } from 'src/app/urlUtils';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmationDialogService } from 'src/app/confirmation-dialog/confirmation-dialog.service';
declare var bootstrap: any;

@Component({
  selector: 'app-relationship-member-access',
  templateUrl: './relationship-member-access.component.html',
  styleUrls: ['./relationship-member-access.component.scss']
})
export class RelationshipMemberAccessComponent {

  @Input() reldata: any = {};
  @Input() activeTab: any;
  @Input() showMemberForm: any;
  @Output() event = new EventEmitter<string>();

  product = environment.product;
  groupList: any[] = [];
  selectedIds: string[] = [];
  selectedDel: string[] = [];
  relname: string = "";
  showConfirm: boolean = false;
  isDisable = false;

  isSaveDisabled: boolean = true;
  searchText: any = '';
  groupsList: any;
  filteredData: any;
  selectedGroups: any = [];
  cantDeleteItems: any;
  isEdit: boolean = false;
  isSaveEnable: boolean = false;
  editDoc: any;
  selectedtoupdateGroups: any = [];
  removegrpId: any;
  memData: any;
  assignGrp: any;
  initialSelectedGroups: any[] = [];
  delId: any
  selId: any;
  doCounts: any;
  deletedId: any;
  canDelete:any;
  canAssign:any;

  constructor(private formBuilder: FormBuilder, private toast: ToastrService, private cdr: ChangeDetectorRef,
    private httpService: HttpService, private fb: FormBuilder, private confirmationDialogService: ConfirmationDialogService) {
  }

  ngOnInit() {
    this.selectedIds = this.reldata.groups.map((obj: any) => { return obj.id })
    //this.selectedGroups = this.reldata.groups.map((obj: any) => { return obj })
    // this.selectedGroups = this.reldata.members.filter((group: any) => group.name); // selected member
    this.selectedGroups = this.reldata?.members?.filter((group: any) => group.name) || [];

    this.selectedDel = this.reldata.groups.map((obj: any) => { return obj.can_delete })
    this.loadGroups();
    this.relname = this.reldata.name
    // console.log('selectedGroups',this.selectedGroups)
    // console.log('reldata',this.reldata)
  }

  loadGroups() {
      this.httpService.sendGetRequest(URLUtils.getMembersList).subscribe((res: any) => {
        this.groupList = res?.data.users;
        this.filteredData = [...this.groupList]

        //Hide the selected member on assign side
        if (this.reldata.members) {
          const selectedGroupIds = new Set(this.reldata.members.map((group: any) => group.id));
          this.groupList = this.groupList.filter((group: any) => !selectedGroupIds.has(group.id));
          this.filteredData = this.groupList.filter((group: any) => !selectedGroupIds.has(group.id));
        }

        this.isSaveDisabled = this.groupList?.length === 1; //disable the Save btn
        //console.log('member filteredData', this.filteredData)
    })
  }
  
  cancel() {
    //this.event.emit('group-access-close')
    // this.event.emit(this.showMemberForm) //before

    if (this.selId || (this.memData && this.memData.id)) {
      this.confirmationDialogService.confirm('Alert', 'Changes you made will not be saved. Do you want to save?', true, 'Yes', 'No')
        .then((confirmed) => {
          if (confirmed) {
            this.save();
          }
          else {
            this.event.emit(this.showMemberForm)
          }
        });
    }
    else {
      this.event.emit(this.showMemberForm)
    }
  }

  confirmSave() {
    this.showConfirm = true;
  }
  
  save() {
    //this.reldata = false
    //this.isDisabled = this.reldata.invalid;
    let data = { "members": this.selectedGroups.map((obj: any) => obj.id) };
    let payload = { "acls": this.selectedIds };

    // Common error handling for all API's
    const handleError = (error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        const errorMessage = error.error.msg || 'Unauthorized';
        this.toast.error(errorMessage);
      }
    };

    this.httpService.sendPutRequest(URLUtils.updateRelationshipMember(this.reldata.id), data).subscribe((res: any) => {
      this.event.emit("member-access-done")
      this.toast.success('Members updated successfully');
    }, handleError)
  }

  isDisabled(grp: any): boolean {
    this.toast.error('Groups are associated with clients')
    return !grp.can_delete && this.selectedIds.includes(grp.id) && this.selectedDel.includes(grp.can_delete) && this.product === 'lauditor';
  }

  selectCorporateGrp(grp: any, checked: boolean){
    this.isSaveEnable = true;
    if(checked){
      this.selectedIds.push(grp.id);
    } 
    else {
      this.selectedIds.splice(this.selectedIds.indexOf(grp.id), 1)
    }
    //Update the save button state
    this.isSaveDisabled = this.selectedIds.length === 0;
  }
  keyup() {
    //console.log('keyu', this.searchText)
    if (this.searchText == ' ') {
      this.searchText = this.searchText.replace(/\s/g, "");
    }
    // Convert memData to an array if it's not already
    if (this.memData.id) {
      this.filteredData = this.memData.filter((item: any) => item.name.toLocaleLowerCase().includes(this.searchText));
    }

    this.filteredData = this.groupList.filter((item: any) => item.name.toLocaleLowerCase().includes(this.searchText));

    let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
    if (checkbox != null) {
      checkbox.checked = false;
    }
  }

  onKeydown(e: any) {

  }

  selectAll(event: any) {
    //this.isSaveEnable = true;
    if (event?.target?.checked) {
      if (this.groupList?.length > 0) {
        if (this.filteredData?.length > 0) {
          this.selectedGroups = this.selectedGroups.concat(this.filteredData);
          this.groupList = this.groupList.filter((el: any) => {
            return !this.selectedGroups.find((element: any) => {
              return element.id === el.id;
            });
          });
        }
        else {
          this.selectedGroups = this.selectedGroups.concat(this.groupList);
          this.groupList = [];
        }
      }
    } else {
      if (this.isEdit) {
        let cantDeleteItems = this.selectedGroups.filter((item: any) => this.cantDeleteItems.indexOf(item.id) > -1)
        let canDeleteItems = this.selectedGroups.filter((item: any) => this.cantDeleteItems.indexOf(item.id) <= -1)
        this.groupList = canDeleteItems.concat(this.groupList);
        this.selectedGroups = cantDeleteItems;
      } else {
        this.groupList = this.selectedGroups.concat(this.groupList);
        this.selectedGroups = [];
      }
    }
  }

  getGroups(){
    this.httpService.sendGetRequest(URLUtils.getGroups).subscribe((res: any) => {
      this.filteredData = res?.data.filter((group: any) => group.name !== 'AAM' && group.name !== 'SuperUser');
      if (this.reldata.groups) {
        const selectedGroupIds = new Set(this.reldata.groups.map((group: any) => group.id));
        this.groupList = this.groupList.filter((group: any) => !selectedGroupIds.has(group.id));
        this.filteredData = this.groupList.filter((group: any) => !selectedGroupIds.has(group.id));
      }  
    });
  }

  selectGrp(group: any, checked: boolean, value?: any) {
    this.selId = group.id;
    this.isSaveEnable = true;
    //console.log('selId',this.selId)

    if (checked) {
      this.selectedGroups.push(group);
      this.selectedIds.push(group.id);
    }
    else {
      this.selectedIds.splice(this.selectedIds.indexOf(group.id), 1)
    }

    //Update the save button state
    this.isSaveDisabled = this.selectedIds.length === 0;

    let index = this.groupList.findIndex((d: any) => d.id === group.id); //find index in your array
    this.groupList.splice(index, 1);
    let indexo = this.filteredData.findIndex((d: any) => d.id === group.id); //find index in your array
    this.filteredData.splice(indexo, 1);

    if (this.groupList.length == 0 || this.filteredData.length == 0) {
      let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
      if (checkbox != null)
        checkbox.checked = true;
    }
  }

  //   selectGrp(grp: any, checked: boolean) {
  //   if (!grp.can_delete && this.selectedIds.includes(grp.id) && this.selectedDel.includes(grp.can_delete) && this.product === 'lauditor') {
  //     this.toast.error('Groups are associated with clients')
  //     return
  //   }
  //   if (checked) {
  //     this.selectedIds.push(grp.id);
  //   }
  //   else {
  //     this.selectedIds.splice(this.selectedIds.indexOf(grp.id), 1)
  //   }
  //   // Update the save button state
  //   this.isSaveDisabled = this.selectedIds.length === 0;
  //   this.selectedGroups.push(grp);
  // }

  // removeGroup(group: any) {
  //   if (!group.can_delete && this.selectedIds.includes(group.id) && this.selectedDel.includes(group.can_delete) && this.product === 'lauditor') {
  //     this.toast.error('Groups are associated with clients')
  //     return
  //   }

  //   if ((this.isEdit && (group.canDelete == undefined || group.canDelete == true)) || (!this.isEdit)) {
  //     this.isSaveEnable = true;
  //     let index = this.selectedGroups.findIndex((d: any) => d.id === group.id); //find index in your array
  //     this.selectedGroups.splice(index, 1);
  //     this.groupList.push(group);
  //     if (this.selectedGroups.length == 0 || this.groupList.length == 1) {
  //       let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
  //       if (checkbox != null)
  //         checkbox.checked = false;
  //     }
  //   }
  // }

  removeGroup(group: any) {
    this.memData = group;
    // console.log('group',group)
    this.delId = group.id;
    // console.log('selId',this.selId)
    // console.log('delId',this.delId)
    // console.log('Rem-deletedId',this.deletedId)
    this.canDelete = group?.can_delete;
    this.canAssign = group?.can_assign_docs;
    // console.log('canDelete',this.canDelete)
    // console.log('canAssign',this.canAssign)

    if (this.product !== 'corporate' && group.can_delete === true && group.can_assign_docs === true) {
      //this.getGroups(); // get all groups if list is empty
      this.editDoc = JSON.parse(JSON.stringify(group));
      this.selectedtoupdateGroups = [];
      this.httpService.sendGetRequest(URLUtils.updateRelationshipAccess(this.reldata.client_id, group.id)).subscribe((res: any) => {
        this.removegrpId = res.counts;
      })
      setTimeout(() => {
        // Trigger the modal
        let modalElement = document.getElementById('editInfoModal1') as HTMLElement;
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          modalInstance.show();
        }
      }, 0);
      return;
    }
    else if (this.product !== 'corporate' && (group.can_delete === false && (group.can_assign_docs === false || group.can_assign_docs === true))) {
      this.confirmationDialogService.confirm('Alert', 'Matters are associated with this Group. So you cannot delete this group', false, 'OK', 'Cancel', true)
    }
    else if (this.product !== 'corporate' && group.isdisabled == false || (group.can_delete === true && group.can_assign_docs === false) || (this.delId !== this.deletedId)) {
      this.isSaveEnable = true;
      let index = this.selectedGroups.findIndex((d: any) => d.id === group.id); //find index in your array
      if (index > -1) {
        this.selectedGroups.splice(index, 1);
        this.filteredData.push(group);
      }
      if (this.selectedGroups.length == 0 || this.filteredData.length == 1) {
        let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
        if (checkbox != null) checkbox.checked = false;
      }
      this.isSaveDisabled = this.selectedIds.length === 0;
    }
    else if (this.product === 'corporate'){
      this.isSaveEnable = true;
      let index = this.selectedGroups.findIndex((d: any) => d.id === group.id); //find index in your array
      if (index > -1) {
        this.selectedGroups.splice(index, 1);
        this.filteredData.push(group);
      }
      if (this.selectedGroups.length == 0 || this.filteredData.length == 1) {
        let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
        if (checkbox != null) checkbox.checked = false;
      }
      this.isSaveDisabled = this.selectedIds.length === 0;
    }
    else {
      //this.toast.error('cant remove!')
    }
  }

  handleGroupRemoval(group: any) {
    //if ((this.isEdit && (group.isdisabled == undefined || group.isdisabled == true)) || (!this.isEdit)) {
    if (group.isdisabled == false || this.selId === this.delId && group.isdisabled == false) {
      this.isSaveEnable = true;
      let index = this.selectedGroups.findIndex((d: any) => d.id === group.id); //find index in your array
      if (index > -1) {
        this.selectedGroups.splice(index, 1);
        this.filteredData.push(group);
      }
      if (this.selectedGroups.length == 0 || this.filteredData.length == 1) {
        let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
        if (checkbox != null) checkbox.checked = false;
      }
    }
    this.isSaveDisabled = this.selectedIds.length === 0;
  }

  //Remove grps from the dialog
  removeDialogGroup(group: any) {
    // console.log('diaRem', group)
    if ((this.isEdit && (group.isdisabled == undefined || group.isdisabled == true)) || (!this.isEdit)) {
      this.isSaveEnable = true;
      let index = this.selectedtoupdateGroups.findIndex((d: any) => d.id === group.id); //find index in your array
      this.selectedtoupdateGroups[index].can_delete = true; // update while removed
      this.selectedtoupdateGroups[index].can_assign_docs = false;
      this.selectedtoupdateGroups.splice(index, 1);
      this.filteredData.push(group);

      if (this.selectedtoupdateGroups.length == 0 || this.groupList.length == 1) {
        let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
        if (checkbox != null)
          checkbox.checked = false;
      }
    }
    this.isSaveDisabled = this.selectedIds.length === 0;
  }

  getRelationship(){
    let url  = URLUtils.getRelationshipFiltered(this.activeTab)
    this.httpService.getFeaturesdata(url).subscribe(
        (res: any) => {
            console.log('Business-rel:',res)
        })
  }
  deleteGroup() {
    this.delId = this.selectedtoupdateGroups.map((group: any) => group.id);
    const payload = { "new_groups": this.delId };
    this.deletedId = this.delId;
    //console.log('delDelId',this.delId)
    // console.log('payload',payload)

    this.httpService.sendPatchRequest(URLUtils.updateRelationshipAccess(this.reldata.client_id, this.memData.id), payload)
      .subscribe((res: any) => {
        if (this.product !== 'corporate') {
          this.toast.success("Successfully reassigned to another active Groups")
        }
        else {
          this.toast.success(res.msg)
        }

        // Remove the selected group from selectedGroups array
        const indexToRemove = this.selectedGroups.findIndex((g: any) => g.id === this.memData.id);
        if (indexToRemove !== -1) {
          //console.log('selG',this.selectedGroups[indexToRemove])
          this.selectedGroups[indexToRemove].can_delete = true;
          this.selectedGroups[indexToRemove].can_assign_docs = false;
          this.selectedGroups.splice(indexToRemove, 1);
        }
        // Update selectedGroups based on API response
        this.selectedtoupdateGroups.forEach((group: any) => {
          const index = this.selectedGroups.findIndex((g: any) => g.id === group.id);
          if (index === -1) {
            this.selectedGroups.push(group); // Add reassigned groups to selectedGroups if not already present
          }
        });

        this.selectedtoupdateGroups = [];
        this.filteredData.push(this.memData); //removed grp on AG

        // After reassignment, update the selected groups with canDelete and canAssign values
        //   this.selectedGroups.forEach((group: any) => {
        //     group.can_delete = this.canDelete;
        //     group.can_assign_docs = this.canAssign;
        //   });

        //Patch call updating after Delete call
        let data = { "acls": this.selectedGroups.map((obj: any) => obj.id) };
        if (this.activeTab == 'corporate') {
          this.httpService.sendPatchRequest(URLUtils.relationshipGroupAclsCorp(this.reldata),
            data).subscribe((res: any) => {
              //this.event.emit("group-access-done")
            })
        }
        else {
          this.httpService.sendPutRequest(URLUtils.relationshipGroupAcls(this.reldata), data).subscribe((res: any) => {
            // this.toast.success('Patch updated')
            // console.log('res',res)
          })
        }
        //this.getRelationship();
      },
        (error: HttpErrorResponse) => {
          if (error.status === 400 || error.status === 401 || error.status === 403 || error.status === 500) {
            const errorMessage = error.error.msg || 'Unauthorized';
            this.toast.error(errorMessage);
            //return;
          }
        }
      );
    this.isSaveDisabled = this.selectedIds.length === 0;
  }

  selecttoUpdateGroup(group: any, value?: any) {
    this.isSaveEnable = true;

    // Use canDelete and canAssign from the previously stored values
    group.can_delete = this.canDelete;
    group.can_assign_docs = this.canAssign;

    this.selectedtoupdateGroups.push(group);
    let index = this.filteredData.findIndex((d: any) => d.id === group.id); //find index in your array
    this.filteredData.splice(index, 1);
    if (this.filteredData.length == 0) {
      let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
      if (checkbox != null)
        checkbox.checked = true;
    }
    this.isSaveDisabled = this.selectedIds.length === 0;
  }

  remGroups() {
    this.initialSelectedGroups = [...this.selectedGroups];
    // Assuming selected-Groups to groupList individually
    this.selectedtoupdateGroups.forEach((group: any) => {
      group.can_delete = true;
      group.can_assign_docs = false;
      this.filteredData.push(group);
    });

    this.selectedtoupdateGroups = [];
  }
}

