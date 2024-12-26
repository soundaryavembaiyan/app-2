import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/services/http.service';
import { URLUtils } from 'src/app/urlUtils';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
declare var bootstrap: any; // Import Bootstrap for modal triggering

@Component({
    selector: 'edit-members',
    templateUrl: 'edit-members.component.html',
    styleUrls: ['edit-members.component.scss']
})
export class EditMembersComponent implements OnInit {
    
    @Input() editMember: any;
    @Output() event = new EventEmitter<string>();

    product = environment.product;
    members: any = [];
    membersList: any[] = [];
    searchText: any = "";
    ghname: string = "";
    gname: string = "";
    isSaveEnable: boolean = false;
    
    constructor(private httpservice: HttpService, private toast: ToastrService,
                private router: Router){ }
    
    ngOnInit(): void {
        this.ghname = this.editMember['groupHead']['name']
        this.gname = this.editMember["name"]
        this.httpservice.sendGetRequest(URLUtils.getMembers).subscribe((res:any)=>{
            let existingMems = this.editMember.members.map((obj: any) => obj.id);
            res.data.users.forEach((item: any, index: number) => {
                if(existingMems.includes(item.id)){
                    if(this.editMember['groupHead']['id'] != item.id){
                        this.members.push(item)
                    }
                } else {
                    this.membersList.push(item)
                }

            })
        })
        // console.log('gh',this.ghname)
        // console.log('gh',this.gname)
    }
    addMember(mData: any, index: number) {
        this.isSaveEnable = true;
        this.membersList.splice(index, 1);
        this.members.push(mData);
    }
    
    removeMember(mdata: any, index: number) {
        this.isSaveEnable = true;
        this.members.splice(index, 1);
        this.membersList.push(mdata);
    }
    
    removeAllMembers(){
        this.members.forEach((item: any, index: number) => {
            this.membersList.push(item)
        })
        this.members = []
    }
    saveMembers() {
        this.members.push(this.editMember['groupHead']);

        var body = { "members": this.members?.map((obj: any) => obj.id) }
        this.httpservice.sendPatchRequest(URLUtils.updateGroup(this.editMember),
            body).subscribe((res: any) => {
                this.event.emit('edit-members-done')
            }, (error) => {
                if (error.status === 401 || error.status === 403) {
                    const errorMessage = error.error.msg || 'Unauthorized';
                    this.toast.error(errorMessage);
                    //console.log(error);
                }
        })
    }
    closeClickMembers() {
        this.event.emit('edit-members-close')
    }
    onCancel(): void {
        if (this.isSaveEnable) {
          const modal = document.getElementById('modalConfirm');
          if (modal) {
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
          }
        } else {
          this.closeClickMembers(); // Navigate back directly
        }
      }
}
