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
  selector: 'app-relationship-group-access',
  templateUrl: 'relationship-group-access.component.html',
  styleUrls: ['relationship-group-access.component.scss']
})
export class RelationshipGroupAccessComponent implements OnInit {

  @Input() reldata: any = {};
  @Input() activeTab: any;
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
  assignGrp:any;
  initialSelectedGroups: any[] = [];
  delId:any
  doCounts:any;

  constructor(private formBuilder: FormBuilder, private toast: ToastrService, private cdr: ChangeDetectorRef,
    private httpService: HttpService, private fb: FormBuilder, private confirmationDialogService: ConfirmationDialogService) {
  }

  ngOnInit() {
    this.selectedIds = this.reldata.groups.map((obj: any) => { return obj.id })
    this.selectedGroups = this.reldata.groups.map((obj: any) => { return obj })
    this.selectedDel = this.reldata.groups.map((obj: any) => { return obj.can_delete })
    this.loadGroups();
    this.relname = this.reldata.name
  }

  // loadGroups(){
  //    	this.httpService.sendGetRequest(URLUtils.getGroups).subscribe((res: any) => {
  //     		this.groupList = res?.data;
  //         console.log('Grp-list',this.groupList)
  //         if(this.reldata.groups){
  //           const canDeleteMap = new Map(this.reldata?.groups.map((item:any) => [item.id, item.can_delete]));

  //         // Combine the two lists
  //         this.groupList = this.groupList?.map((group:any) => ({
  //             ...group,
  //             can_delete: canDeleteMap.get(group.id)
  //         }));
  //         }
  //         //console.log('groupList', this.groupList)
  //   	})
  //   }

  loadGroups() {
    this.httpService.sendGetRequest(URLUtils.getGroups).subscribe((res: any) => {
      // this.groupList = res?.data;
      // this.filteredData = res?.data;
      this.groupList = res?.data.filter((group: any) => group.name !== 'AAM' && group.name !== 'SuperUser');
      this.filteredData = res?.data.filter((group: any) => group.name !== 'AAM' && group.name !== 'SuperUser');
      if (this.reldata.groups) {
        const selectedGroupIds = new Set(this.reldata.groups.map((group: any) => group.id));
        this.groupList = this.groupList.filter((group: any) => !selectedGroupIds.has(group.id));
        this.filteredData = this.groupList.filter((group: any) => !selectedGroupIds.has(group.id));
      }
    });
  }

  cancel() {
    this.event.emit('group-access-close')
  }

  confirmSave() {
    this.showConfirm = true;
  }

  save() {
    //this.reldata = false
    //this.isDisabled = this.reldata.invalid;

    var payload = { "acls": this.selectedIds }
    let data = { "acls": this.selectedGroups.map((obj: any) => obj.id) };

    //Corporate
    if (this.activeTab == 'corporate' || environment.product == 'corporate') {
      this.httpService.sendPatchRequest(URLUtils.relationshipGroupAclsCorp(this.reldata),
        data).subscribe((res: any) => {
          this.event.emit("group-access-done")
        },
          (error: HttpErrorResponse) => {
            if (error.status === 401 || error.status === 403) {
              const errorMessage = error.error.msg || 'Unauthorized';
              this.toast.error(errorMessage);
              //console.log(error);
            }
          })
    }
    //All
    else {
      this.httpService.sendPutRequest(URLUtils.relationshipGroupAcls(this.reldata),
        data).subscribe((res: any) => {
          this.event.emit("group-access-done")
        },
          (error: HttpErrorResponse) => {
            if (error.status === 401 || error.status === 403) {
              const errorMessage = error.error.msg || 'Unauthorized';
              this.toast.error(errorMessage);
              //console.log(error);
            }
          }
        )
    }
  }

  isDisabled(grp: any): boolean {
    this.toast.error('Groups are associated with clients')
    return !grp.can_delete && this.selectedIds.includes(grp.id) && this.selectedDel.includes(grp.can_delete) && this.product === 'lauditor';
  }

  // selectGrp(grp: any, checked: boolean) {
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

  selectGrp(group: any, checked: boolean, value?: any) {
    this.isSaveEnable = true;

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

  keyup() {
    if (this.searchText == ' ') {
      this.searchText = this.searchText.replace(/\s/g, "");
    }
    this.filteredData = this.groupList.filter((item: any) => item.name.toLocaleLowerCase().includes(this.searchText));
    let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
    if (checkbox != null) {
      checkbox.checked = false;
    }
  }

  onKeydown(e:any){

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

  // selectAll(event: any) {
  //   //this.isSaveEnable = true;
  //   if (event?.target?.checked) {
  //       if (this.groupList?.length > 0) {
  //           if (this.filteredData?.length > 0) {
  //               this.selectedGroups = this.selectedGroups.concat(this.filteredData);
  //               this.groupList = this.groupList.filter((el: any) => {
  //                   return !this.selectedGroups.find((element: any) => {
  //                       return element.id === el.id;
  //                   });
  //               });
  //           } else {
  //               this.selectedGroups = this.selectedGroups.concat(this.groupList);
  //               this.groupList = [];
  //           }
  //       }
  //   } else {
  //       if (this.isEdit) {
  //           let cantDeleteItems = this.selectedGroups.filter((item: any) => this.cantDeleteItems.indexOf(item.id) > -1);
  //           let canDeleteItems = this.selectedGroups.filter((item: any) => this.cantDeleteItems.indexOf(item.id) <= -1);
  //           this.groupList = canDeleteItems.concat(this.groupList);
  //           this.selectedGroups = cantDeleteItems;
  //       } else {
  //           // newly selected groups
  //           const existingSelectedGroupIds = new Set(this.reldata.groups.map((group: any) => group.id));
  //           const newlySelectedGroups = this.selectedGroups.filter((group: any) => !existingSelectedGroupIds.has(group.id));
  //           // Add newly selected groups & keep initial selectedGroups intact
  //           this.groupList = this.groupList.concat(newlySelectedGroups);
  //           this.selectedGroups = this.reldata.groups.filter((group: any) => existingSelectedGroupIds.has(group.id));
  //       }
  //   }
  // }

  removeGroup(group: any) {
    this.memData = group;
    // console.log('group',group)
    // console.log('..doCounts',this.doCounts)
   
    if ((group.can_delete === true && group.can_assign_docs === true && this.product !== 'corporate')) {
      this.editDoc = JSON.parse(JSON.stringify(group));
      this.selectedtoupdateGroups = [];
      this.httpService.sendGetRequest(URLUtils.updateRelationshipAccess(this.reldata.client_id, group.id)).subscribe((res: any) => {
        this.removegrpId = res.counts;
        // this.doCounts = res.counts.documents;
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
    // else if (group.isdisabled === false && this.product !== 'corporate') {
    //   this.toast.error('doc-2')
    //   this.editDoc = JSON.parse(JSON.stringify(group));
    //   this.selectedtoupdateGroups = [];
    //   this.httpService.sendGetRequest(URLUtils.updateRelationshipAccess(this.reldata.client_id, group.id)).subscribe((res: any) => {
    //     this.removegrpId = res.counts;
    //     this.doCounts = res.counts.documents;
    //     console.log('removegrpId-2',this.doCounts)
    //   })

    //   setTimeout(() => {
    //     // Trigger the modal
    //     let modalElement = document.getElementById('editInfoModal1') as HTMLElement;
    //     if (modalElement) {
    //       const modalInstance = new bootstrap.Modal(modalElement);
    //       modalInstance.show();
    //     }
    //   }, 0);
    //   return;
    //   // this.assignGrp = this.groupList.push(group); //removed grp on AG
    // } 
    else if(this.product !== 'corporate' &&
      (group.can_delete === false ||
      (group.can_assign_docs === false || group.can_assign_docs === true) && 
      (group.can_delete == false && group.can_assign_docs == false) &&
      this.selectedIds.includes(group.id) && 
      this.selectedDel.includes(group.can_assign_docs || group.can_delete))
      ){
        this.confirmationDialogService.confirm('Alert', 'Matters are associated with this Group. So you cannot delete this group', false, 'OK', 'Cancel', true)
    }
    else {
      this.handleGroupRemoval(group);
    }
  }

  handleGroupRemoval(group: any) {
    if ((this.isEdit && (group.canDelete == undefined || group.canDelete == true)) || (!this.isEdit)) {
      this.isSaveEnable = true;
      if (group.canDelete == undefined || group.canDelete == true) {
        let index = this.selectedGroups.findIndex((d: any) => d.id === group.id); //find index in your array
        if (index > -1) {
          this.selectedGroups.splice(index, 1);
          this.filteredData.push(group);
        }
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
    if ((this.isEdit && (group.canDelete == undefined || group.canDelete == true)) || (!this.isEdit)) {
      this.isSaveEnable = true;
      let index = this.selectedtoupdateGroups.findIndex((d: any) => d.id === group.id); //find index in your array
      this.selectedtoupdateGroups.splice(index, 1);
      this.groupList.push(group);
      if (this.selectedtoupdateGroups.length == 0 || this.groupList.length == 1) {
        let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
        if (checkbox != null)
          checkbox.checked = false;
      }
    }
    this.isSaveDisabled = this.selectedIds.length === 0;
  }

  deleteGroup() {
    this.delId = this.selectedtoupdateGroups.map((group: any) => group.id);
    const payload = { "new_groups": this.delId };

    this.httpService.sendPatchRequest(URLUtils.updateRelationshipAccess(this.reldata.client_id, this.memData.id), payload)
      .subscribe((res: any) => {
        if (this.product !== 'corporate') {
          this.toast.success("Successfully reassigned to another active Groups")
        }
        // else if (this.product === 'corporate') {
        //   this.toast.success("Successfully reassigned to another active Department")
        // }
        else {
          this.toast.success(res.msg)
        }

        // Remove the selected group from selectedGroups array
        const indexToRemove = this.selectedGroups.findIndex((g: any) => g.id === this.memData.id);
        if (indexToRemove !== -1) {
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
        this.groupList.push(this.memData); //removed grp on AG
      },
      (error: HttpErrorResponse) => {
        if (error.status === 400 || error.status === 401 || error.status === 403 || error.status === 500) {
          const errorMessage = error.error.msg || 'Unauthorized';
          this.toast.error(errorMessage);
        }
      }
      );
    this.isSaveDisabled = this.selectedIds.length === 0;
  }

  selecttoUpdateGroup(group: any, value?: any) {
    this.isSaveEnable = true;
    this.selectedtoupdateGroups.push(group);
    let index = this.groupList.findIndex((d: any) => d.id === group.id); //find index in your array
    this.groupList.splice(index, 1);
    if (this.groupList.length == 0) {
      let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
      if (checkbox != null)
        checkbox.checked = true;
    }
    this.isSaveDisabled = this.selectedIds.length === 0;
  }

  remGroups() {
    this.initialSelectedGroups = [...this.selectedGroups];
    // Assuming selected-Groups to groupList individually
    this.selectedtoupdateGroups.forEach((group:any) => {
      this.groupList.push(group);
    });
    this.selectedtoupdateGroups = [];
  }
  

}

