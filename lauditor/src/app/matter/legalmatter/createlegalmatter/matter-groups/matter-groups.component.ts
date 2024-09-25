import { ConfirmationDialogService } from './../../../../confirmation-dialog/confirmation-dialog.service';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/services/http.service';
import { MatterService } from './../../../matter.service';
import { URLUtils } from 'src/app/urlUtils';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ModalService } from 'src/app/model/model.service';
import { MatDialog } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
declare var bootstrap: any;
import { LeavepageComponent } from '../leavepage/leavepage.component';
import { GeneralleavepageComponent } from 'src/app/matter/genaralmatter/creategeneralmatter/generalleavepage/generalleavepage.component';


@Component({
  selector: 'matter-groups',
  templateUrl: 'matter-groups.component.html',
  styleUrls: ['matter-groups.component.scss']
})
export class MatterGroupsComponent implements OnInit {

  @Output() selectedGroupsEvent: EventEmitter<any> = new EventEmitter();
  @Output() selectedClientsEvent: EventEmitter<any> = new EventEmitter();
  @Output() selectedTmsEvent: EventEmitter<any> = new EventEmitter();

  selectedClients: any = [];
  @Input() data: any = {};

  @Input() clients: any = {};
  @Input() groups: any[] = [];

  groupsList: any = [];
  selectedGroups: any = [];
  selectedtoupdateGroups: any = [];
  selectedIds: any[] = [];
  selectedDel: any[] = [];
  searchText: any = '';
  editGroupIds: any = [];
  isEdit: boolean = false;
  editMatter: any;
  pathName: string = "legalmatter";
  isSaveEnable: boolean = false;
  filteredData: any;
  cantDeleteItems: any;
  product = environment.product;

  grouplist: any = [];
  clientId: any = [];
  client: any;
  filter: any;
  matterList: any;
  selectedGroupItems: any = [];
  groupId: any = [];
  groupViewItems: any;
  groupsLists: any = [];
  editDoc: any;
  removegrpId: any;
  memData: any;
  initialSelectedGroups: any[] = [];
  delDoc = false;
  isSelectAllVisible = true;
  isCreate = false;
  mattername: any;
  cdRef: any;
  deletedId: any;
  delId: any;
  selId: any;
  canDelete:any;

  constructor(private httpservice: HttpService,
    private matterService: MatterService,
    private router: Router, private toast: ToastrService, private modalService: ModalService,
    private confirmationDialogService: ConfirmationDialogService, private dialog: MatDialog) { }

  ngOnInit() {
    this.pathName = window.location.pathname.includes("legalmatter") ? "legalmatter" : "generalmatter";
    const path = window.location.pathname;

    if (path.indexOf("updateGroups") > -1) {
      if (path.includes("legal")) {
        this.isCreate = !this.isCreate;
        if (this.product === 'corporate') {
          this.matterService.editLegalMatterObservable.subscribe((result: any) => {
            if (result) {
              this.editMatter = result;
              this.mattername = result;
              this.editGroupIds = result.groups;
              this.isEdit = true;
              this.cantDeleteItems = this.editGroupIds.filter((item: any) => item.canDelete == false).map((obj: any) => obj.id);
            }
          });
        }
        else {
          this.matterService.editLegalMatterObservable.subscribe((result: any) => {
            const clientIds = result.clients.map((client: any) => client);
            const corpIds = result.corporate.map((client: any) => client);
            this.mattername = result
            //console.log('res',this.mattername)

            if (result) {
              this.selectedGroups = result?.groups?.map((g: any) => g);
              if (result.clients.length > 0) {
                this.httpservice.sendPutRequest(URLUtils.getFilterTypeAttachements, { "attachment_type": "groups", "clients": clientIds }).subscribe(
                  (res: any) => {
                    //this.groupsList = res?.groups?.map((client: any) => client);
                    this.groupsList = res?.groups.filter((group: any) => group.name !== 'AAM' && group.name !== 'SuperUser');
                    this.filterGroupsList();
                  }
                );
              } else if (result.corporate.length > 0) {
                this.httpservice.sendPutRequest(URLUtils.getFilterTypeAttachements, { "attachment_type": "groups", "clients": corpIds }).subscribe(
                  (res: any) => {
                    //this.groupsList = res?.groups?.map((client: any) => client);
                    this.groupsList = res?.groups.filter((group: any) => group.name !== 'AAM' && group.name !== 'SuperUser');
                    this.filterGroupsList();
                  }
                );
              }
              else if (clientIds && corpIds) {
                this.httpservice.sendPutRequest(URLUtils.getFilterTypeAttachements, { "attachment_type": "groups", "clients": corpIds }).subscribe(
                  (res: any) => {
                    //this.groupsList = res?.groups?.map((client: any) => client);
                    this.groupsList = res?.groups.filter((group: any) => group.name !== 'AAM' && group.name !== 'SuperUser');
                    this.filterGroupsList();
                  }
                );
                this.httpservice.sendPutRequest(URLUtils.getFilterTypeAttachements, { "attachment_type": "groups", "clients": clientIds }).subscribe(
                  (res: any) => {
                    //this.groupsList = res?.groups?.map((client: any) => client);
                    this.groupsList = res?.groups.filter((group: any) => group.name !== 'AAM' && group.name !== 'SuperUser');
                    this.filterGroupsList();
                  }
                );
              }
              else { }

              this.editMatter = result;
              this.editGroupIds = result.groups;
              this.isEdit = true;
              this.cantDeleteItems = this.editGroupIds.filter((item: any) => item.canDelete == false).map((obj: any) => obj.id);
            }
          });
        }

      }
      else if (path.includes("general")) {
        this.isCreate = !this.isCreate;
        if (this.product === 'corporate') {
          this.matterService.editGeneralMatterObservable.subscribe((result: any) => {
            if (result) {
              this.editMatter = result;
              this.mattername = result;
              this.editGroupIds = result.groups;
              this.isEdit = true;
              this.cantDeleteItems = this.editGroupIds.filter((item: any) => item.canDelete == false).map((obj: any) => obj.id);
            }
          })
        }
        else {
          this.matterService.editGeneralMatterObservable.subscribe((result: any) => {
            const clientIds = result.clients.map((client: any) => client);
            const corpIds = result.corporate.map((client: any) => client);
            this.mattername = result
            //console.log('res',this.mattername)

            if (result) {
              this.selectedGroups = result?.groups?.map((g: any) => g);
              if (result.clients.length > 0) {
                this.httpservice.sendPutRequest(URLUtils.getFilterTypeAttachements, { "attachment_type": "groups", "clients": clientIds }).subscribe(
                  (res: any) => {
                    //this.groupsList = res?.groups?.map((client: any) => client);
                    this.groupsList = res?.groups.filter((group: any) => group.name !== 'AAM' && group.name !== 'SuperUser');
                    this.filterGroupsList();
                  }
                );
              } else if (result.corporate.length > 0) {
                this.httpservice.sendPutRequest(URLUtils.getFilterTypeAttachements, { "attachment_type": "groups", "clients": corpIds }).subscribe(
                  (res: any) => {
                    //this.groupsList = res?.groups?.map((client: any) => client);
                    this.groupsList = res?.groups.filter((group: any) => group.name !== 'AAM' && group.name !== 'SuperUser');
                    this.filterGroupsList();
                  }
                );
              }
              else if (clientIds && corpIds) {
                this.httpservice.sendPutRequest(URLUtils.getFilterTypeAttachements, { "attachment_type": "groups", "clients": corpIds }).subscribe(
                  (res: any) => {
                    //this.groupsList = res?.groups?.map((client: any) => client);
                    this.groupsList = res?.groups.filter((group: any) => group.name !== 'AAM' && group.name !== 'SuperUser');
                    this.filterGroupsList();
                  }
                );
                this.httpservice.sendPutRequest(URLUtils.getFilterTypeAttachements, { "attachment_type": "groups", "clients": clientIds }).subscribe(
                  (res: any) => {
                    //this.groupsList = res?.groups?.map((client: any) => client);
                    this.groupsList = res?.groups.filter((group: any) => group.name !== 'AAM' && group.name !== 'SuperUser');
                    this.filterGroupsList();
                  }
                );
              }
              else { }

              this.editMatter = result;
              this.editGroupIds = result.groups;
              this.isEdit = true;
              this.cantDeleteItems = this.editGroupIds.filter((item: any) => item.canDelete == false).map((obj: any) => obj.id);
            }
          });
        }
      }
    }
    // if (window.location.pathname.indexOf("updateGroups") > -1) {
    //   this.matterService.editLegalMatterObservable.subscribe((result: any) => {
    //     if (result) {
    //       this.editMatter = result;
    //       console.log('ngL-editMatter',this.editMatter)
    //       this.editGroupIds = result.groups;
    //       this.isEdit = true;
    //     this.cantDeleteItems=this.editGroupIds.filter((item: any) => item.canDelete==false).map((obj: any) => obj.id);
    //     }
    //   });
    //   this.matterService.editGeneralMatterObservable.subscribe((result: any) => {
    //     if (result) {
    //       this.editMatter = result;
    //       console.log('ngG-editMatter',this.editMatter)
    //       this.editGroupIds = result.groups;
    //       this.isEdit = true;
    //       this.cantDeleteItems=this.editGroupIds.filter((item: any) => item.canDelete==false).map((obj: any) => obj.id);
    //     }
    //   })
    // }
    //this.getGrouplists();
    if (this.product === 'corporate' && !this.isCreate) {
      this.getGroupsCC();
    }
    else if (this.product === 'corporate' && this.isCreate) {
      this.getGroupsCU();
    }
    else {
      this.getGrouplists();
    }
    this.selectedIds = this.editMatter.groups.map((obj: any) => { return obj.id })
    this.selectedDel = this.editMatter.groups.map((obj: any) => { return obj.canDelete })
     // console.log('editMatter of selectedId', this.selectedIds)
    // console.log('this.editMatter', this.editMatter);
  }

  filterGroupsList() {
    if (this.groupsList && this.selectedGroups && this.selectedGroups.length > 0) {
      this.groupsList = this.groupsList.filter((group: any) => {
        return !this.selectedGroups.find((selectedGroup: any) => {
          return selectedGroup.id === group.id;
        });
      });
    }

    if (this.selectedGroups.length === 0) {
      let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
      if (checkbox != null) {
        checkbox.checked = false;
      }
    }
  }

  // != corporate
  getGrouplists() {
    if (Array.isArray(this.clients)) {
      this.client = this.clients.map((client: any) => ({ id: client.id, type: client.type }));
      this.clientId.push(this.client.map((c: any) => c.id));

      let clientData = {
        "attachment_type": "groups",
        "clients": this.client
      };

      this.httpservice.sendPutRequest(URLUtils.getFilterTypeAttachements, clientData).subscribe(
        (res: any) => {
          //console.log('g-res', res)
          //this.groupsList = res?.groups?.map((client: any) => client);
          this.groupsList = res?.groups.filter((group: any) => group.name !== 'AAM' && group.name !== 'SuperUser');
          //console.log('g-groupsList', this.groupsList)
          if (this.groups && this.groups.length > 0) {
            this.selectedGroups = [...this.groups];
            let res = this.groupsList.filter((el: any) => {
              return !this.selectedGroups.find((element: any) => {
                return element.id === el.id;
              });
            });
            this.groupsList = res
          }
          if (this.selectedGroups.length == 0) {
            let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
            if (checkbox != null)
              checkbox.checked = false;
          }

        })
    } else {
      //console.error('this.clients is not an array', this.clients);
    }
  }
  // selectCorporateGrp(grp: any, checked: boolean){
  //   this.isSaveEnable = true;
  //    if(checked){
  //     this.selectedIds.push(grp.id);
  //   }
  //   else{
  //     this.selectedIds.splice(this.selectedIds.indexOf(grp.id), 1)
  //   }
  // }

  selectCorporateGrp(grp: any, checked: boolean, inputEl: HTMLInputElement) {
    this.isSaveEnable = true;
    // console.log('grp', grp);
    // console.log('editMatter', this.editMatter);

    const groupInEditMatter = this.editMatter.groups.find((g: any) => g.id === grp.id);
    // Check if the group exists and if canDelete is false
    if (groupInEditMatter && !groupInEditMatter.canDelete) {
      this.confirmationDialogService.confirm(
        'Alert', 'External Counsels are associated with this Department. So you cannot delete this department', false, 'OK', 'Cancel', true
      ).then((result: any) => {
        if (result === 'OK') {
          //this.selectedIds.splice(this.selectedIds.indexOf(grp.id), 1); // Allow the uncheck action
          inputEl.checked = true;
        } else {
          inputEl.checked = true; // Prevent the uncheck
        }
      })
      .catch(() => {
        inputEl.checked = true;
      });
      return; 
    }
    // If canDelete is true or the group is not found
    if (checked) {
      //this.selectedIds.push(grp.id);
      if (!this.selectedIds.includes(grp.id)) {
        this.selectedIds.push(grp.id);
      }
    } else {
      const index = this.selectedIds.indexOf(grp.id);
      if (index > -1) {
        this.selectedIds.splice(index, 1);
      }
    }
  }

  remGroups() {
    this.initialSelectedGroups = [...this.selectedGroups];
    this.selectedtoupdateGroups.forEach((group: any) => {
      group.canDelete = true;
      this.groupsList.push(group);
    });
    this.selectedtoupdateGroups = [];
  }
    
  // == corporate getGroups - Create lists
  getGroupsCC() {
    this.httpservice.sendGetRequest(URLUtils.getGroups).subscribe((res: any) => {
      if (res && res['data'] && res['data']?.length > 0)
        //this.groupsList = res['data'];
        this.groupsList = res['data'].filter((group: any) => group.name !== 'AAM' && group.name !== 'SuperUser');
      if (this.editGroupIds && this.editGroupIds.length > 0) {
        this.groups = this.editGroupIds;
        // this.groups = this.groupsList.filter((item: any) => this.editGroupIds.indexOf(item.id) > -1);
      }
      if (this.groups && this.groups.length > 0) {
        this.selectedGroups = [...this.groups];
        let res = this.groupsList.filter((el: any) => {
          return !this.selectedGroups.find((element: any) => {
            return element.id === el.id;
          });
        });
        //const selectedGroupIds = new Set(this.editMatter.groups.map((group: any) => group.id));
        //this.selectedGroups = this.groupsList.filter((group: any) => selectedGroupIds.has(group.id));
        this.groupsList = res;
      }
      if (this.selectedGroups.length == 0) {
        let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
        if (checkbox != null)
          checkbox.checked = false;
      }
    })
  }
  // == corporate getGroups - Update lists
  getGroupsCU() {
    this.httpservice.sendGetRequest(URLUtils.getGroups).subscribe((res: any) => {
      if (res && res['data'] && res['data']?.length > 0) {
        //this.groupsList = res['data'];
        this.groupsList = res['data'].filter((group: any) => group.name !== 'AAM' && group.name !== 'SuperUser');
        //console.log('getGroups', this.groupsList);
  
        if (this.editGroupIds && this.editGroupIds.length > 0) {
          this.groups = this.editGroupIds;
        }
       
        if (this.groups && this.groups.length > 0) {
          this.selectedGroups = [...this.groups];
          // Filter out groups from groupsList that are already selected
          let remGroups = this.groupsList.filter((el: any) => {
            return !this.selectedGroups.find((selected: any) => selected.id === el.id);
          });
          // Combine selectedGroups and remainingGroups into filteredData
          this.filteredData = [...this.selectedGroups, ...remGroups];
          const selectedGroupIds = new Set(this.groups.map((group: any) => group.id));
          this.filteredData = this.groupsList.filter((group: any) => selectedGroupIds.has(group.id));
          //console.log('filteredData', this.filteredData);
          this.selectedIds = [...selectedGroupIds];
        }   
        // console.log('selectedIds', this.selectedIds);     
        // console.log('selectedGroups', this.selectedGroups);
        // console.log('filteredData', this.filteredData);
      }
      if (this.selectedGroups.length === 0) {
        let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
        if (checkbox != null) {
          checkbox.checked = false;
        }
      }
    });
  }
  
  selectAll(event: any) {
    this.isSaveEnable = true;
    if (event?.target?.checked) {
      if (this.groupsList?.length > 0) {
        if (this.filteredData?.length > 0) {
          this.selectedGroups = this.selectedGroups.concat(this.groupsList);
          this.groupsList = this.groupsList.filter((el: any) => {
            return !this.selectedGroups.find((element: any) => {
              return element.id === el.id;
            });
          });
        }
        else {
          this.selectedGroups = this.selectedGroups.concat(this.groupsList);
          this.groupsList = [];
        }
      }
    } else {
      if (this.isEdit) {
        let cantDeleteItems = this.selectedGroups.filter((item: any) => this.cantDeleteItems.indexOf(item.id) > -1)
        let canDeleteItems = this.selectedGroups.filter((item: any) => this.cantDeleteItems.indexOf(item.id) <= -1)
        this.groupsList = canDeleteItems.concat(this.groupsList);
        this.selectedGroups = cantDeleteItems;
      } else {
        this.groupsList = this.selectedGroups.concat(this.groupsList);
        this.selectedGroups = [];
      }
    }
    this.searchText = '';
  }

  selectGroup(group: any, value?: any) {
    this.isSaveEnable = true;
    this.selId = group.id;
    //console.log('selid', this.selId)
    this.selectedGroups.push(group);
    let index = this.groupsList.findIndex((d: any) => d.id === group.id); //find index in your array
    this.groupsList.splice(index, 1);
    if (this.groupsList.length == 0) {
      let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
      if (checkbox != null)
        checkbox.checked = true;
    }
    //this.searchText = '';
  }

  selecttoUpdateGroup(group: any, value?: any) {
    this.isSaveEnable = true;
    
    group.canDelete = this.canDelete; //Assign conditions
    this.selectedtoupdateGroups.push(group);
    let index = this.groupsList.findIndex((d: any) => d.id === group.id); //find index in your array
    this.groupsList.splice(index, 1);
    if (this.groupsList.length == 0) {
      let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
      if (checkbox != null)
        checkbox.checked = true;
    }
    this.searchText = '';
  }

  removeGroup(group: any) {
    this.memData = group;
    // console.log('group', group);
    // console.log('isCretae', this.isCreate);
    this.delId = group.id;
    this.canDelete = group?.canDelete;
    const path = window.location.pathname.indexOf("updateGroups") > -1; //&& group.canDelete === false

    // Only for Corporate prod. condition
    if (this.product === 'corporate' && group.canDelete === false) {
      this.confirmationDialogService.confirm('Alert', 'External Counsels are associated with this Department. So you cannot delete this department', false, 'OK', 'Cancel', true)
    }
    // Resource dialog condition
    if ((this.product != 'corporate' && group.canDelete === false && this.groupsList.length > 0)) {
      this.editDoc = JSON.parse(JSON.stringify(group));
      this.selectedtoupdateGroups = [];
      this.httpservice.sendGetRequest(URLUtils.updateMatterAccess(this.editMatter.id, group.id)).subscribe((res: any) => {
        this.removegrpId = res.counts;
      });
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
    // Alert for no Groups condition
       if ((this.product != 'corporate' && this.groupsList.length === 0 && group.canDelete === false && path && this.isCreate === true)){
        this.openDialog();
        return;
      }
    //}
    // Remove the Groups condition
    if ((group.canDelete === undefined && (this.isCreate === false || this.isCreate === true)) || (group.canDelete === true && this.isCreate === true)) {
      this.isSaveEnable = true;
      let index = this.selectedGroups.findIndex((d: any) => d.id === group.id); // find index in your array
      // Check if the group is found in the selectedGroups array
      if (index !== -1) {
        this.selectedGroups.splice(index, 1);
        this.groupsList.push(group);
        if (this.selectedGroups.length === 0 || this.groupsList.length === 1) {
          let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
          if (checkbox != null) {
            checkbox.checked = false;
          }
        }
      }
      return;
    }
  }

  openDialog() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { delDoc: this.delDoc, product: environment.product },
      width: '500px',
      height: '290px',
      hasBackdrop: true,
      panelClass: 'hello',
      disableClose: true
    });
  }

  //Remove grps from the dialog
  removeDialogGroup(group: any) {
    //console.log('up-group', group);
    this.isSaveEnable = true;
    let index = this.selectedtoupdateGroups.findIndex((d: any) => d.id === group.id); //find index in your array
    this.selectedtoupdateGroups[index].canDelete = true;
    this.selectedtoupdateGroups.splice(index, 1);
    this.groupsList.push(group);
    if (this.selectedtoupdateGroups.length == 0 || this.groupsList.length == 1) {
      let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
      if (checkbox != null)
        checkbox.checked = false;
    }
  }

  deleteGroup() {
    // const idsArray = this.selectedtoupdateGroups.map((group: any) => group.id);
    // const payload = { "new_groups": idsArray };
    this.delId = this.selectedtoupdateGroups.map((group: any) => group.id);
    const payload = { "new_groups": this.delId };
    this.deletedId = this.delId;
    //console.log('--del-delId',this.delId)

    this.httpservice.sendPatchRequest(URLUtils.updateMatterAccess(this.editMatter.id, this.memData.id), payload)
      .subscribe((res: any) => {
        if (this.product !== 'corporate') {
          this.toast.success("Successfully reassigned to another active Groups")
        }
        else if (this.product === 'corporate') {
          this.toast.success("Successfully reassigned to another active Department")
        }
        else {
          this.toast.success(res.msg)
        }
        // Remove the selected group from selectedGroups array
        const indexToRemove = this.selectedGroups.findIndex((g: any) => g.id === this.memData.id);
        if (indexToRemove !== -1) {
          //console.log('selG',this.selectedGroups[indexToRemove])
          this.selectedGroups[indexToRemove].canDelete = true;
          this.selectedGroups.splice(indexToRemove, 1);
        }
        // Update selectedGroups based on API response
        this.selectedtoupdateGroups.forEach((group: any) => {
          const index = this.selectedGroups.findIndex((g: any) => g.id === group.id);
          if (index === -1) {
            this.selectedGroups.push(group); // Add reassigned groups to selectedGroups if not already present
          }
        });

        this.groupsList.push(this.memData); // Update groupsList based on API response, if needed
        this.selectedtoupdateGroups = [];

        // After reassignment, update the selected groups with canDelete value
        // this.selectedGroups.forEach((group: any) => {
        //   group.canDelete = this.canDelete;
        // });

        //Patch call updating after Delete call
        let url = this.pathName == 'legalmatter' ? URLUtils.updateLegalAcls(this.editMatter.id) : URLUtils.updateGeneralAcls(this.editMatter.id);
        let data = { "group_acls": this.selectedGroups.map((obj: any) => obj.id) };
        this.httpservice.sendPutRequest(url, data).subscribe((res: any) => {
          //this.toast.success('Patch updated')
        })
      });
  }

  saveGroups() {
    if (this.isEdit) {
      let url = this.pathName == 'legalmatter' ? URLUtils.updateLegalAcls(this.editMatter.id) : URLUtils.updateGeneralAcls(this.editMatter.id);
      let data = { "group_acls": this.selectedGroups.map((obj: any) => obj.id) };
      let payload = { "group_acls": this.selectedIds };
      //console.log('data',data)

      if (this.product === 'corporate') {
        this.confirmationDialogService.confirm('Confirmation', 'Are you sure do you want to update Department(s) for this matter?', true, 'Yes', 'No')
          .then((confirmed) => {
            if (confirmed) {
              this.httpservice.sendPutRequest(url, payload).subscribe((res: any) => {
                if (!res.error) {
                  this.confirmationDialogService.confirm('Success', 'Congratulations! You have successfully updated Department(s) for this matter.', false, 'View Matter List', 'Cancel', true)
                    .then((confirmed) => {
                      if (confirmed) {
                        this.router.navigate(['/matter/' + this.pathName + '/view']);
                      }
                    })
                }
              },
                (error: HttpErrorResponse) => {
                  if (error.status === 401 || error.status === 403) {
                    const errorMessage = error.error.msg || 'Unauthorized';
                    this.toast.error(errorMessage);
                    //console.log(error);
                  }
                }
              );
            }
          })
      }
      else{
        //        this.confirmationDialogService.confirm('Confirmation', 'Are you sure do you want to update Group(s) for ' + this.editMatter.title + ' matter ?', true, 'Yes', 'No')
        this.confirmationDialogService.confirm('Confirmation', 'Are you sure do you want to update Group(s) for this matter?', true, 'Yes', 'No')
          .then((confirmed) => {
            if (confirmed) {
              this.httpservice.sendPutRequest(url, data).subscribe((res: any) => {
                if (!res.error) {
                  this.confirmationDialogService.confirm('Success', 'Congratulations! You have successfully updated Group(s) for this matter.', false, 'View Matter List', 'Cancel', true)
                    .then((confirmed) => {
                      if (confirmed) {
                        this.router.navigate(['/matter/' + this.pathName + '/view']);
                      }
                    })
                }
              },
                (error: HttpErrorResponse) => {
                  if (error.status === 401 || error.status === 403) {
                    const errorMessage = error.error.msg || 'Unauthorized';
                    this.toast.error(errorMessage);
                    //console.log(error);
                  }
                }
              );
            }
          })
       }

    } else {
      this.selectedGroupsEvent.emit(this.selectedGroups);
    }
  }

  OnCancel() {
    if (this.isEdit) {
      //console.log('ifDelId',this.deletedId) //If deletedId
      // if (this.deletedId) {
      //   //this.toast.error('Please save the selected groups to proceed.')
      //   let index = this.selectedGroups.findIndex((d: any) => d.id === this.memData.id); // find index in your array
      //   this.selectedGroups.splice(index, 1);
      //   this.selectedGroups.push(this.memData);
      // }
      this.router.navigate(['/matter/' + this.pathName + '/view']);
    }
    else {
      // this.groupsList = this.groupsList.concat(this.selectedGroups);
      // this.selectedGroups = [];
      this.pathName = window.location.pathname.includes("legalmatter") ? "legalmatter" : "generalmatter";
      if (this.selectedGroups.length > 0) {
        if (this.pathName === "legalmatter") {
          this.dialog.open(LeavepageComponent, {
            width: '350px',  // Set the width here
            height: '180px',
            hasBackdrop: true,
            panelClass: 'hello',
            disableClose: true
          });
          return;
        }
        else if (this.pathName === "generalmatter") {
          this.dialog.open(GeneralleavepageComponent, {
            width: '350px',  // Set the width here
            height: '180px',
            hasBackdrop: true,
            panelClass: 'hello',
            disableClose: true
          });
          return;
        }
        else { }
      }
    }
    const checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
    if (checkbox) {
      checkbox.checked = false;
    }
  }
  // keyup() {
  //   if (this.searchText == ' '){
  //     this.searchText = this.searchText.replace(/\s/g, "");
  //   }
  //   this.filteredData = this.groupsList.filter((item: any) => item.name.toLocaleLowerCase().includes(this.searchText));
  //   let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
  //   if (checkbox != null)
  //     checkbox.checked = false;
  // }

  keyup() {
    if (this.searchText == ' ') {
      this.isEdit = false;
      this.searchText = this.searchText.replace(/\s/g, '');
    }
    this.filteredData = this.groupsList.filter((item: any) => item.name.toLocaleLowerCase().includes(this.searchText));
    // Update visibility based on the filtered data
    this.isSelectAllVisible = this.filteredData.length > 0;

    let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
    if (checkbox != null) {
      checkbox.checked = false;
    }
  }

  editDocInfo(doc: any, tabsel?: any) {
    //console.log('form', this.editDocform)
    this.editDoc = JSON.parse(JSON.stringify(doc));
  }

  closeModal(id: any) {
    this.modalService.close(id);
  }
  
  truncateString(text: string): string {
    if (text.length > 25) {
      return text.slice(0, 25) + '...';
    }
    return text;
  }
}

@Component({
  selector: 'app-confirmation-dialog',
  template: `
  <div mat-dialog-content>
  <div class="closeDialog">
        <i class="fa fa-times closeBtn" (click)="closeDialog()" aria-hidden="true"></i>
    </div>

   <h1 mat-dialog-title class="mailoption">Alert</h1>
      <div>
      <p *ngIf="data.product !== 'corporate'" class="alertxt">To update matter groups, the client should be linked to more than one group.<br> Please assign the client to more groups. </p>
      </div>
      <div mat-dialog-actions class="overviewSave savefilenameBtn">
           <button type="submit" class="btn btn-default savefile" (click)="continue()">OK</button>
      </div>
  </div>
`,
  styleUrls: ['matter-groups.component.scss']
})
export class ConfirmationDialogComponent {
  editDoc: any;
  product = environment.product;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>
  ) { }

  ngOnInit() {

  }

  continue() {
    this.dialogRef.close('continue');
  }
  closeDialog() {
    this.dialogRef.close()
  }
}

