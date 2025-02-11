import { URLUtils } from 'src/app/urlUtils';
import { HttpService } from 'src/app/services/http.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LeavepageComponent } from '../leavepage/leavepage.component';
import { GeneralleavepageComponent } from 'src/app/matter/genaralmatter/creategeneralmatter/generalleavepage/generalleavepage.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({

    selector: 'matter-team-members',
    templateUrl: 'matter-team-members.component.html',
    styleUrls: ['matter-team-members.component.scss']
})
export class MatterTeamMembersComponent {
    
    @Output() selectedTmsEvent: EventEmitter<any> = new EventEmitter();
    @Input() data: any = {};
    @Input() teammembers: any = {};
    @Input() groups: any[] = [];
    @Input() clients: any = {};
    // @Input() tmGrp:any ={}
    groupName:any;
    
    teammembersList: any = [];
    selectedTeammembers: any = [];
    searchText: any = '';
    ownerName:any;
    filteredData:any;
    //@Input()grouplist:any=[]
    isSelectAllVisible = true;
    showAllItems = false;
    pathName: string = "legalmatter";
    product = environment.product;
    originalClientsList:any[]=[];
    
    constructor(private httpservice: HttpService,private dialog: MatDialog, private router: Router,) { }

    ngOnInit() {
        this.ownerName=localStorage.getItem('name');
        //this.getTeammembers();
        if (this.product == 'corporate') {
            this.getCorpTeammembers();
        }
        else {
            this.getTeammembers();
        }
    }
    getTeammembers() {
        this.groupName = this.groups.map((obj: any) => obj.name);
        //console.log('grp',this.groupName)
        let grps = this.groups.map((obj: any) => obj.id);
        this.httpservice.sendPutRequest(URLUtils.getFilterTypeAttachements,{'group_acls': grps, 'attachment_type': 'members'}).subscribe(
            (res: any) => {
                if (!res['error'] && res['members']?.length > 0){
                    this.teammembersList = res['members'];
                    this.originalClientsList = this.teammembersList;
                    let index = this.teammembersList.findIndex((d: any) => d.name === this.ownerName); //find index in your array
                    if (index > -1) {
                        this.teammembersList.splice(index, 1); //to remove the owner name in 1st index
                    }
                    if (this.teammembers && this.teammembers.length > 0) {
                        // this.selectedTeammembers = [...this.teammembers];
                        // let res = this.teammembersList.filter((el: any) => {
                        //     return !this.selectedTeammembers.find((element: any) => {
                        //         return element.id === el.id;
                        //     });
                        // });
                        // this.teammembersList = res
                        this.selectedTeammembers = this.teammembers.filter((group: any) =>
                            this.teammembersList.some((g: any) => g.id === group.id)
                        );
                        //console.log('Updated teammembersList:', this.selectedTeammembers);
                        this.teammembersList = this.teammembersList.filter(
                            (group: any) => !this.selectedTeammembers.some((selected: any) => selected.id === group.id)
                        );
                        this.originalClientsList = [...this.teammembersList];
                    }
                    if (this.selectedTeammembers.length == 0) {
                        let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
                        if (checkbox != null)
                          checkbox.checked = false;
                      }
                    if (this.teammembersList.length === 0) {
                        let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
                        if (checkbox != null)
                            checkbox.checked = true;
                    }
                }
        })
    }

    getCorpTeammembers() {
        this.groupName = this.groups.map((obj: any) => obj.name);
        //console.log('grp',this.groupName)
        let grps = this.groups.map((obj: any) => obj.id);
        this.httpservice.sendPutRequest(URLUtils.getFilterTypeAttachements, { 'group_acls': grps, 'attachment_type': 'members' }).subscribe(
            (res: any) => {

                this.selectedTeammembers = [];
                this.teammembersList = res['members'];
                this.originalClientsList = this.teammembersList;
                let index = this.teammembersList.findIndex((d: any) => d.name === this.ownerName); //find index in your array
                if (index > -1) {
                    this.teammembersList.splice(index, 1); //to remove the owner name in 1st index
                }
                if (this.teammembers && this.teammembers.length > 0) {
                    this.teammembers.forEach((client: any) => {
                        const matchedClient = this.teammembersList.find((el: any) => el.id === client.id);
                        if (matchedClient) {
                            this.selectedTeammembers.push(matchedClient);
                        }
                    });
                    // Filter the clientsList to remove already selected clients
                    this.teammembersList = this.teammembersList.filter((el: any) => {
                        return !this.selectedTeammembers.find((selectedClient: any) => selectedClient.id === el.id);
                    });
                }
                if (this.selectedTeammembers.length == 0) {
                    let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
                    if (checkbox != null)
                        checkbox.checked = false;
                }
            })
    }

    selectAll(event: any) {
        if (event?.target?.checked) {
            if (this.teammembersList?.length > 0) {
                // if(this.filteredData?.length>0){
                //     this.selectedTeammembers = this.selectedTeammembers.concat(this.teammembersList);
                //     this.teammembersList = this.teammembersList.filter((el: any) => {
                //       return !this.selectedTeammembers.find((element: any) => {
                //         return element.id === el.id;
                //       });
                //     });
                //   }
                //   else{
                // this.selectedTeammembers = this.selectedTeammembers.concat(this.teammembersList);
                // this.teammembersList = [];
                //   }
                const filteredClients = this.teammembersList.filter((client: any) =>
                client.name.toLowerCase().includes(this.searchText.toLowerCase())
              );
              if (filteredClients?.length > 0) {
                this.selectedTeammembers = this.selectedTeammembers.concat(filteredClients);
                this.teammembersList = this.teammembersList.filter((el: any) => {
                  return !this.selectedTeammembers.find((element: any) => {
                    return element.id === el.id;
                  });
                });
              }
              else {
                this.teammembersList = this.selectedTeammembers.concat(this.teammembersList);
                this.selectedTeammembers = [];
              }
            }
        } else {
            this.teammembersList = this.selectedTeammembers.concat(this.teammembersList);
            this.selectedTeammembers = [];
        }
        this.searchText = '';
    }
    // selectTeammember(group: any, value?: any) {
    //     this.selectedTeammembers.push(group);
    //     let index = this.teammembersList.findIndex((d: any) => d.id === group.id); //find index in your array
    //     this.teammembersList.splice(index, 1);
    //     if (this.teammembersList.length==0) {
    //         let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
    //         if (checkbox != null)
    //           checkbox.checked = true;
    //       }
    //     //this.searchText = '';
    // }

    selectTeammember(client: any, isChecked?: any) {  
        this.isSelectAllVisible = true;  
        
        if (isChecked) {
          this.selectedTeammembers.push(client);
          let index = this.teammembersList.findIndex((d: any) => d.id === client.id); // Find index in your array
          if (index !== -1) {
            this.teammembersList.splice(index, 1);
          }
        } else {
          // Handle unselecting a single client
          let index = this.selectedTeammembers.findIndex((d: any) => d.id === client.id);
          if (index !== -1) {
            this.selectedTeammembers.splice(index, 1);
            this.teammembersList.push(client);
          }
        }
    
        if (this.teammembersList.length == 0) {
          let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
          if (checkbox != null) {
            checkbox.checked = true;
          }
        }
      }
    removeTeammember(group: any) {
        let index = this.selectedTeammembers.findIndex((d: any) => d.id === group.id); //find index in your array
        this.selectedTeammembers.splice(index, 1);
        this.teammembersList.push(group);
        if (this.selectedTeammembers.length == 0|| this.teammembersList.length==1) {
            let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
            if (checkbox != null)
                checkbox.checked = false;
        }
    }
    saveTeammembers() {
        this.selectedTmsEvent.emit(this.selectedTeammembers);
    }
    OnCancel() {
        // this.teammembersList = this.teammembersList.concat(this.selectedTeammembers);
        // this.selectedTeammembers = [];
        this.pathName = window.location.pathname.includes("legalmatter") ? "legalmatter" : "generalmatter";
        if (this.selectedTeammembers.length > 0) {
            if(this.pathName === "legalmatter"){
                this.dialog.open(LeavepageComponent, {
                    width: '350px',  // Set the width here
                    height: '180px',
                    hasBackdrop: true,
                    panelClass: 'hello',
                    disableClose: true
                });
                return;
                }
                else if(this.pathName === "generalmatter"){
                    this.dialog.open(GeneralleavepageComponent, {
                        width: '350px',  // Set the width here
                        height: '180px',
                        hasBackdrop: true,
                        panelClass: 'hello',
                        disableClose: true
                    });
                    return; 
                }
                else{}
        }
        const checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
        if (checkbox) {
            checkbox.checked = false;
        }
    }
    // keyup(){
    //     if(this.searchText == ' ')
    //     this.searchText=this.searchText.replace(/\s/g, "");
    //     this.filteredData = this.teammembersList.filter((item:any) =>item.name.toLocaleLowerCase().includes(this.searchText));
    //     let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
    //     if (checkbox != null)
    //       checkbox.checked = false;
    //   }
    keyup() {
        if (this.searchText == ' ') {
            this.searchText = this.searchText.replace(/\s/g, '');
        }
        // this.filteredData = this.teammembersList.filter((item: any) => item.name.toLocaleLowerCase().includes(this.searchText));
        const searchLower = this.searchText.toLowerCase();
        this.filteredData = this.teammembersList.filter((item: any) => item.name.toLowerCase().includes(searchLower));
        this.filteredData = this.originalClientsList.filter((item: any) =>
            item.name.toLocaleLowerCase().includes(this.searchText.toLocaleLowerCase()) &&
            !this.selectedTeammembers.includes(item)
        );

        // Update visibility based on the filtered data
        this.isSelectAllVisible = this.teammembersList.length > 0;

        let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
        if (checkbox != null) {
            checkbox.checked = false;
        }
    }
      truncateString(text: string): string {
        if (text.length > 25) {
          return text.slice(0, 25) + '...';
        }
        return text;
    }
    // Function to toggle the view state
    toggleView() {
        this.showAllItems = !this.showAllItems;
    }

}
