import { ConfirmationDialogService } from '../../../confirmation-dialog/confirmation-dialog.service';
import { Router } from '@angular/router';
import { MatterService } from '../../matter.service';
import { URLUtils } from '../../../urlUtils';
import { HttpService } from '../../../services/http.service';
import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-viewgeneralmatter',
  templateUrl: './viewgenaralmatter.component.html',
  styleUrls: ['./viewgenaralmatter.component.scss']
})
export class ViewGeneralmatterComponent implements OnInit {
  @Input() data: any;
  generalMatters: any = [];
  isDesc: boolean = false;
  searchText: any = '';
  pipe = new DatePipe('en-US');
  hoveredGroups: any;
  product = environment.product;
  value: any = 1;
  options: any = [
    { name: "Internal Matters", value: 1 }, 
    { name: "External Matters", value: 2 }
  ];
  selectedOption: any;
  //matterCount:any;
  role: any;
  updateLM:any;
  
  constructor(private httpservice: HttpService, private matterService: MatterService, 
    private router: Router, private toast: ToastrService,
    private confirmationDialogService: ConfirmationDialogService, private spinnerService: NgxSpinnerService) { }

  ngOnInit() {
    // if(this.product == 'corporate'){
    //   this.selectedOption = 'External Matters'
    //   this.getExternalMatters();
    // }
    // else{
    //   this.selectedOption = 'Internal Matters'
      this.getGeneralMatters();
    // }
    var role = localStorage.getItem("role")
    this.role = role
  }

  getGeneralMatters() {
    this.spinnerService.show()
    this.httpservice.sendGetRequest(URLUtils.getGeneralMatter).subscribe((res: any) => {
      //this.generalMatters = res && res["matters"];
      if (res && res["matters"]) {
        this.generalMatters = res["matters"].map((matter: any) => {
          const uniqueMembers = new Map(); // Remove duplicate members
          matter.members.forEach((member: any) => {
            if (!uniqueMembers.has(member.id)) {
              uniqueMembers.set(member.id, member);
            }
          });
          matter.members = Array.from(uniqueMembers.values());
          
          matter.groups = matter.groups.filter((group: any) => 
            group.name !== 'AAM' && group.name !== 'SuperUser'
          );
          return matter;
        });
        //console.log('Filtered generalMatters:', this.generalMatters);
      }
      //this.matterCount = this.generalMatters.length;
      //console.log('this.generalMatters',this.generalMatters.length)
      this.spinnerService.hide()
    })
  }

  getExternalMatters() {
    this.spinnerService.show()
    this.httpservice.sendGetRequest(URLUtils.getGeneralExternalMatter).subscribe((res: any) => {
      this.generalMatters = res && res["matters"];
      //this.matterCount = this.generalMatters.length;
      this.spinnerService.hide()
    })
  }
   
  onOptionSelect(event: any) {
    this.selectedOption = event.target.value;
    // Perform additional actions based on the selected option
    // For example, you can call a function or update other variables
    //console.log('Selected option:', this.selectedOption);
    // Your additional actions here
    if(this.selectedOption=="External Matters"){
      this.getExternalMatters()
    }else{
      this.getGeneralMatters()
    }
  }

  sort(property: any) {
    this.isDesc = !this.isDesc; //change the direction    
    // this.column = property;
    let direction = this.isDesc ? 1 : -1;

    this.generalMatters.sort(function (a: any, b: any) {
      if (a[property] < b[property]) {
        return -1 * direction;
      }
      else if (a[property] > b[property]) {
        return 1 * direction;
      }
      else {
        return 0;
      }
    });
  };
  updateGroups(legalMatter: any) {
    this.httpservice.sendGetRequest(URLUtils.getGeneralMatterInfoDetails(legalMatter.id)).subscribe((res: any) => {
      const legal = { ...res.matter, groups:legalMatter.groups, id:legalMatter.id };
      this.matterService.editGeneralMatter(legal);
    })
    //this.matterService.editGeneralMatter(legalMatter);
    this.router.navigate(['/matter/generalmatter/updateGroups'])
  }
  loadEditMatterInfo(legalMatter: any) {
    //this.matterService.editGeneralMatter(legalMatter);
    this.httpservice.sendGetRequest(URLUtils.getGeneralMatterInfoDetails(legalMatter.id)).subscribe((res: any) => {
      const legal = { ...res.matter, groups:legalMatter.groups, id:legalMatter.id };
      this.matterService.editGeneralMatter(legal);
    })
    this.router.navigate(['/matter/generalmatter/matterEdit'])
  }
  loadViewDetails(legalMatter: any, type: any) {
    //  const legal = { ...legalMatter, type: type };
    //  this.matterService.editGeneralMatter(legal);
    this.httpservice.sendGetRequest(URLUtils.getGeneralMatterInfoDetails(legalMatter.id)).subscribe((res: any) => {
      const legal = { ...res.matter, type: type, groups:legalMatter.groups, id:legalMatter.id };
      this.matterService.editGeneralMatter(legal);
    })
    this.router.navigate(['/matter/generalmatter/viewDetails'])

    if (this.product == 'corporate' && this.selectedOption != 'External Matters') {
      this.router.navigate(['/matter/generalmatter/generalinternalviewdetails'])
    }
  }
  onMouseOver(grps: any) {
    let newList = [...grps]
    this.hoveredGroups = [];
    if (grps.length > 2) {
      let sliceArray = newList.splice(2, grps.length);
      this.hoveredGroups = sliceArray.map((item: any, i: number) => item.name);
    }
  }
  getDocuments(id: any) {
    this.httpservice.sendGetRequest(URLUtils.generalHistoryDocuments(id)).subscribe(
      (res: any) => {
        if (res) {
          return res.documents;
        }
      });
    return new Array();
  }
  updateMatterStatus(legalMatter: any, status: string) {
    let Documents = this.getDocuments(legalMatter.id);
    let s = status == 'Closed' ? 'close' : 'reopen';
    //let test = s + ' ' + legalMatter.title + ' matter ?';
    let test = s + ' this matter?';
    this.httpservice.sendGetRequest(URLUtils.getGeneralMatterInfoDetails(legalMatter.id)).subscribe((res: any) => {
      this.updateLM = { ...res.matter, groups:legalMatter.groups, id:legalMatter.id };
      this.matterService.editGeneralMatter(this.updateLM);
    })

    this.confirmationDialogService.confirm('Confirmation', 'Are you sure you want to ' + test, true, 'Yes', 'No')
      .then((confirmed) => {
        if (confirmed) {
          let obj = {
            "title": this.updateLM.title,
            "matter_number": this.updateLM.matterNumber,
            "startdate": this.updateLM.startdate && this.pipe.transform(this.updateLM.startdate, 'dd-MM-yyyy'),
            "closedate": this.updateLM.closedate && this.pipe.transform(this.updateLM.closedate, 'dd-MM-yyyy'),
            "description": this.updateLM.description,
            "matter_type": this.updateLM.matterType,
            "priority": this.updateLM.priority,
            "status": status,
            "affidavit_isfiled": "na",
            "affidavit_filing_date": "",
            "clients": this.updateLM.clients.map((obj: any) => ({ "id": obj.id, "type": obj.type })),
            "group_acls": this.updateLM.groupAcls,
            // "owner": legalMatter.owner.map((obj: any) => ({ "id": obj.id, "name": obj.name })),
            "owner": this.updateLM.owner,
            "members": this.updateLM.members.map((obj: any) => ({ "id": obj.id })),
            "documents": this.updateLM.documents.map((obj: any) => ({
              "docid": obj.docid,
              "doctype": obj.doctype,
              "user_id": obj.user_id
            }))
          }
          this.httpservice.sendUpdateRequest(URLUtils.updateGeneralMatter(legalMatter.id), obj).subscribe((res: any) => {
            if (!res.error) {
              let s = status == 'Closed' ? 'closed' : 'reopened';
              //let test = s + ' the ' + legalMatter.title + ' matter.';
              let test = s + ' this '  + ' matter.';
              this.confirmationDialogService.confirm('Success', 'Congratulations! You have successfully ' + test, false, 'View Matter List', 'Cancel', true)
                .then((confirmed) => {
                  if (confirmed) {
                    this.getGeneralMatters();
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
          });
        }
      })
  }
  delete(legalMatter: any) {
    this.confirmationDialogService.confirm('Confirmation', legalMatter.title + ' matter contains ' + legalMatter.documents?.length + ' documents. Are you sure do you want to delete this matter?', true, 'Yes')
      .then((confirmed) => {
        if (confirmed) {
          this.httpservice.sendDeleteRequest(URLUtils.deleteGeneralMatter(legalMatter.id)).subscribe((res: any) => {
            //console.log(legalMatter.id + 'is deleted');
            if (!res.error) {
              this.confirmationDialogService.confirm('Success', 'Congratulations! You have successfully deleted ' + legalMatter.title, false, 'View Matter List', 'Cancel', true)
                .then((confirmed) => {
                  if (confirmed) {
                    this.getGeneralMatters();
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
          });
        }
      })

  }
}
