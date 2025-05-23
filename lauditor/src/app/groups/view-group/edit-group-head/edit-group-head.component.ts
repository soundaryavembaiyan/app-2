import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/services/http.service';
import { URLUtils } from 'src/app/urlUtils';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
declare var bootstrap: any; // Import Bootstrap for modal triggering

@Component({
    selector: 'edit-group-head',
    templateUrl: 'edit-group-head.component.html',
    styleUrls: ['edit-group-head.component.scss']
})
export class EditGroupHeadComponent {
    
    @Input() groupData:any;
    @Output() event = new EventEmitter<string>();

    product = environment.product;
    searchText: string = '';
    groupHeads: any;
    membersList: any = [];
    selectedMem: any = {};
    existingId: string = '';
    isSaveEnable: boolean = false;
    
    constructor(private httpService: HttpService, private toast: ToastrService, 
                private router: Router){ 
        this.groupHeads=[];
     }

    ngOnInit(): void {
        // console.log('gh',this.groupData)
        this.existingId = this.groupData['groupHead']['id']
        this.membersList = this.groupData.members
        this.membersList.forEach((i: any, ix: number) => {
            if(i['id'] == this.existingId){
                this.membersList.splice(ix, 1)
            }
        })
    }
    change(data:any){

    }
    
    sel(member: any){
        this.selectedMem = member;
        this.isSaveEnable = true;
    }

    cancel(){
        this.event.emit("edit-group-head-close")
    }

    onCancel(): void {
        if (this.isSaveEnable) {
            const modal = document.getElementById('modalCancel');
            if (modal) {
                const bootstrapModal = new bootstrap.Modal(modal);
                bootstrapModal.show();
            }
        } else {
            this.cancel(); // Navigate back directly
        }
    }

    save(){
        var url = URLUtils.updateGroup(this.groupData)
        var body = {"groupHead": this.selectedMem.id}
        this.httpService.sendPatchRequest(url, body).subscribe((res:any)=>{
            this.event.emit('edit-group-head-done')
        },
        (error: HttpErrorResponse) => {
            if (error.status === 401 || error.status === 403) {
              const errorMessage = error.error.msg || 'Unauthorized';
              this.toast.error(errorMessage);
              console.log(error);
            }}
    )
    }

    loadMembers(){
       this.httpService.sendGetRequest(URLUtils.getMembers).subscribe((res:any)=>{
            this.membersList =  res.data.users;
            this.membersList.forEach((i: any, ix: number) => {
                if(i['id'] == this.existingId){
                    this.selectedMem = i
                }
            })
      })
    }
    restrictSpaces(event: any) {
        let inputValue: string = event.target.value;
        inputValue = inputValue.replace(/^\s+/, '');
        inputValue = inputValue.replace(/\s{2,}/g, ' ');
        event.target.value = inputValue;
        this.searchText = inputValue;
    }
      
}