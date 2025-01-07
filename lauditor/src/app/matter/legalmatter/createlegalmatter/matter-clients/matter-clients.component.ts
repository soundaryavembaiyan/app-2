import { ConfirmationDialogService } from './../../../../confirmation-dialog/confirmation-dialog.service';
import { URLUtils } from 'src/app/urlUtils';
import { HttpService } from 'src/app/services/http.service';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ValidatorFn } from '@angular/forms';
import { LeavepageComponent } from '../leavepage/leavepage.component';
import { GeneralleavepageComponent } from 'src/app/matter/genaralmatter/creategeneralmatter/generalleavepage/generalleavepage.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({

    selector: 'matter-clients',
    templateUrl: 'matter-clients.component.html',
    styleUrls: ['matter-clients.component.scss']
})
export class MatterClientsComponent implements OnInit {

    @Output() selectedClientsEvent: EventEmitter<any> = new EventEmitter();
    @Output() corporateClientsEvent: EventEmitter<any> = new EventEmitter();
    @Input() data: any = {};
    @Input() clients: any = {};
    @Input() corpClients: any = {};
    @Input() groups: any[] = [];
    @Output() temporaryClientsEvent: EventEmitter<any> = new EventEmitter();
    @Output() childButtonEvent: EventEmitter<any> = new EventEmitter();
    @ViewChild('searchInput') searchInput!: ElementRef;

    displayMouseOver: boolean = false;
    clientsList: any = [];
    selectedClients: any = [];
    searchText: any = '';
    tooltipgroupslist: any;
    tempList: any = [];
    tempClient: any = FormGroup;
    individualClient: any = FormGroup;
    entityClient: any = FormGroup;
    corporateClient: any = FormGroup;
    filteredData: any;
    inputsubmit: any;
    selectedType: string = 'individual';
    selectedClient: string = 'addclient';
    submitted = false;
    entitysubmitted: boolean = false;
    tempClients: any = [];
    ClientType: string = 'individual';
    CorpType: string = 'corporate';
    csvContent: any = [];

    corporateList: any = [];
    corporateData: boolean = false;
    //corpClients: any = [];
    selectedOption = "";
    selectedprod = 'clients';
    selectedprodCorp = 'corporate';
    product = environment.product;
    showTempForm: boolean = false;

    relationshipSubscribe: any;
    reldata: any[] = [];
    clidata: any;
    corpData: any[] = [];
    isSelectAllVisible = true;
    successModel: boolean = false;
    formType: any;
    keyModel: boolean = false;
    isSaveEnable: boolean = false;
    pathName: string = "legalmatter";
    groupName:any;
    showAllItems = false;
    originalClientsList:any[]=[];

    constructor(private httpservice: HttpService, private fb: FormBuilder,
        private confirmationDialogService: ConfirmationDialogService,
        private httpService: HttpService,private dialog: MatDialog, private router: Router,
        public toastr: ToastrService) { }

    ngOnInit() {
        this.httpservice.sendGetRequest(URLUtils.getCountry).subscribe((res: any) => {
            res.data.countries.forEach((item: any) => {
                // console.log("item is "+JSON.stringify(item[0]));
                this.csvContent.push(item[0]);
            })
            this.csvContent.shift();

        });
        let tmClient: any = localStorage.getItem('tempClients');
        tmClient = JSON.parse(tmClient);
        if (tmClient != "null")
            this.tempClients = tmClient?.length > 0 ? tmClient : [];
        this.tempClient = this.fb.group({
            name: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            confirmemail: ['', [Validators.required, Validators.email]],
            country: ['', Validators.required],
            phonenumber: [''],
            type: ['individual', Validators.required]
        }, { validator: this.emailMatchValidator() });

        //this.getClients();
        this.entityClient = this.fb.group({
            fullname: ['', Validators.required],
            contact_person: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            confirmemail: ['', [Validators.required, Validators.email]],
            country: ['', Validators.required],
            phonenumber: [''],
        }, { validator: this.emailMatchValidator() });

        //this.getClientsData(); //doc. list clients
        if (this.product == 'corporate') {
            this.getClients();
        }
        else {
            this.getClientsData();
        }
    }

    // getClientsData() {
    //     this.relationshipSubscribe = this.httpservice.getFeaturesdata(URLUtils.getAllRelationship).subscribe((res: any) => {
    //         this.clientsList = res?.data?.relationships;
    //         //console.log('rel-cli',this.reldata)
    //         this.httpservice.getFeaturesdata(URLUtils.getCalenderExternal).subscribe((res: any) => {
    //             this.corporateList = res?.relationships.map((obj: any) => ({ "id": obj.id, "type": "corporate", "name": obj.name }))
    //             this.clients = this.clientsList.concat(this.corporateList)
    //         });

    //         this.tempList.length = this.clientsList.length;
    //         this.corporateList.length = this.clientsList.length;

    //         // console.log('rel-clients',this.clients)
    //         // console.log('rel-corp',this.corpClients)
    //         // console.log('rel-selectedcli',this.selectedClients)

    //         if (this.clients && this.clients.length > 0) {
    //             this.selectedClients = [...this.clients];
    //             //console.log('selectedClients....',this.selectedClients)
    //             let res = this.clientsList.filter((el: any) => {
    //                 return !this.selectedClients.find((element: any) => {
    //                     return element.id === el.id;
    //                 });
    //             });
    //             this.clientsList = res;
    //         }

    //         if (this.corpClients && this.corpClients.length > 0) {
    //             this.selectedClients = [...this.corpClients];
    //             //console.log('selectedClients....',this.selectedClients)
    //             let res = this.clientsList.filter((el: any) => {
    //                 return !this.selectedClients.find((element: any) => {
    //                     return element.id === el.id;
    //                 });
    //             });
    //             this.clientsList = res;
    //         }

    //         if (this.selectedClients.length == 0) {
    //             let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
    //             if (checkbox != null)
    //                 checkbox.checked = false;
    //         }
    //     });

    // }

    getClientsData() {
        this.relationshipSubscribe = this.httpservice.getFeaturesdata(URLUtils.getAllRelationship).subscribe((res: any) => {
            this.clientsList = res?.data?.relationships;
            this.originalClientsList = this.clientsList;

            this.httpservice.getFeaturesdata(URLUtils.getCalenderExternal).subscribe((res: any) => {
                this.corporateList = res?.relationships.map((obj: any) => ({ "id": obj.id, "type": "corporate", "name": obj.name }));

                // Filter selected clients from clientsList and corporateList
                const selectedClientIds = this.selectedClients.map((client: { id: any; }) => client.id);
                this.clientsList = this.clientsList.filter((client: { id: any; }) => !selectedClientIds.includes(client.id));
                this.corporateList = this.corporateList.filter((client: { id: any; }) => !selectedClientIds.includes(client.id));

                // Combine clientsList and corporateList into clients
                this.clients = [...this.clientsList, ...this.corporateList];
            });

            this.tempList.length = this.clientsList.length;
            this.corporateList.length = this.corporateList.length;

            if (this.clients && this.clients.length > 0) {
                this.selectedClients = [...this.clients];

                // Update clientsList to exclude selected clients
                this.clientsList = this.clientsList.filter((el: any) => {
                    return !this.selectedClients.find((element: any) => element.id === el.id);
                });
            }

            if (this.corpClients && this.corpClients.length > 0) {
                this.selectedClients = [...this.corpClients];

                // Update corporateList to exclude selected clients
                this.corporateList = this.corporateList.filter((el: any) => {
                    return !this.selectedClients.find((element: any) => element.id === el.id);
                });
            }
            // Final update of combined clients list
            this.clients = [...this.clientsList, ...this.corporateList];
            this.originalClientsList = [...this.clientsList];

            if (this.selectedClients.length == 0) {
                let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
                if (checkbox != null)
                    checkbox.checked = false;
            }
            if (this.clients.length === 0) {
                let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
                if (checkbox != null)
                    checkbox.checked = true;
            }
        });
    }

    // Check emails of two fields match
    emailMatchValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const formGroup = control as FormGroup;
            const email = formGroup.get('email')?.value;
            const confirmEmail = formGroup.get('confirmemail')?.value;
            return email && confirmEmail && email !== confirmEmail ? { emailMismatch: true } : null;
        };
    }

    get f() {
        return this.tempClient.controls;
    }
    get f1() {
        return this.entityClient.controls;
    }

    getClients() {
        let grps = this.groups.map((obj: any) => obj.id);
        let newGroups = [...this.groups];

        this.groupName = this.groups.map((obj: any) => obj.name);
        // console.log('grp',this.groupName)

        if (newGroups && newGroups.length > 2) {
            let tooltipGroupsArray = newGroups.splice(2, this.groups.length);
            // if (tooltipGroupsArray && tooltipGroupsArray.length > 0) {
            //     tooltipGroupsArray.forEach((element: any) => {
            //         this.tooltipgroupslist = this.tooltipgroupslist + ',' + element.name;
            //     });
            // this.tooltipgroupslist = this.tooltipgroupslist.slice(1);
            this.tooltipgroupslist = tooltipGroupsArray.map((item: any, i: number) => item.name);
        }
        var payload
        if (this.product == "corporate") {
            payload = { 'group_acls': grps, 'attachment_type': 'corporate', 'product': this.product }

        } else {
            payload = { 'group_acls': grps, 'attachment_type': 'clients' }
        }
        this.httpservice.sendPutRequest(URLUtils.getFilterTypeAttachements, payload).subscribe(
            (res: any) => {
                this.selectedClients = [];
                this.clientsList = res['corporate'];
                // console.log('clientsList', this.clientsList);
                // console.log('selectedClients', this.selectedClients);
                if (this.clients && this.clients.length > 0) {
                    this.clients.forEach((client: any) => {
                        const matchedClient = this.clientsList.find((el: any) => el.id === client.id);
                        if (matchedClient) {
                            this.selectedClients.push(matchedClient);
                        }
                    });
                    // Filter the clientsList to remove already selected clients
                    this.clientsList = this.clientsList.filter((el: any) => {
                        return !this.selectedClients.find((selectedClient: any) => selectedClient.id === el.id);
                    });                    
                    // console.log('Filtered clientsList', this.clientsList);
                    // console.log('Updated selectedClients', this.selectedClients);
                }
        
                // Handle the 'selectAll' checkbox
                if (this.selectedClients.length == 0) {
                    let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
                    if (checkbox != null) {
                        checkbox.checked = false;
                    }
                }
            }
        );
        // this.httpservice.sendPutRequest(URLUtils.getFilterTypeAttachements, payload).subscribe(
        //     (res: any) => {
        //         if (!res['error'] && res['clients']?.length > 0) {
        //             this.clientsList = res['clients'];
        //         } else if (!res['error'] && res['corporate']?.length > 0) {
        //             this.clientsList = res['corporate'];
        //         }
        //         this.tempList.length = this.clientsList.length;
        //         if (this.clients && this.clients.length > 0) {
        //             this.selectedClients = [...this.clients];
        //             let res = this.clientsList.filter((el: any) => {
        //                 return !this.selectedClients.find((element: any) => {
        //                     return element.id === el.id;
        //                 });
        //             });
        //             this.clientsList = res;

        //         }
        //         if (this.selectedClients.length == 0) {
        //             let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
        //             if (checkbox != null)
        //                 checkbox.checked = false;
        //         }
        //     }
        // )
        // this.httpservice.sendPutRequest(URLUtils.getFilterTypeAttachements, payload).subscribe(
        //     (res: any) => {
        //         if (!res['error'] && res['corporate']?.length > 0)
        //             this.corporateList = res['corporate'];
        //         this.tempList.length = this.corporateList.length;
        //         if (this.clients && this.clients.length > 0) {
        //             this.selectedClients = [...this.clients];
        //             let res = this.corporateList.filter((el: any) => {
        //                 return !this.selectedClients.find((element: any) => {
        //                     return element.id === el.id;
        //                 });
        //             });
        //             this.corporateList = res;
        //         }

        //         if (this.selectedClients.length == 0) {
        //             let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
        //             if (checkbox != null)
        //                 checkbox.checked = false;
        //         }
        //     }
        // )
    }

    onFilterValueChange() {
        this.tempList = this.clientsList.filter((data: any) => data?.name?.toLowerCase().includes(this.searchText?.toLowerCase()));
        this.clientsList = this.tempList.filter((data: any) => data?.name?.toLowerCase().includes(this.searchText?.toLowerCase()));
        this.tempList = this.corporateList.filter((data: any) => data?.name?.toLowerCase().includes(this.searchText?.toLowerCase()));
        //console.log('Onnnthis.filtered',this.clientsList )
    }

    selectAll(event: any) {
        this.isSaveEnable = true;
        if (event?.target?.checked) {
            this.tempList = !this.tempList;
            // if (this.clientsList?.length > 0) {
            //     if (this.filteredData?.length > 0) {
            //         //this.selectedClients = this.selectedClients.concat(this.filteredData);
            //         this.selectedClients = this.selectedClients.concat(this.clientsList);
            //         this.clientsList = this.clientsList.filter((el: any) => {
            //             return !this.selectedClients.find((element: any) => {
            //                 return element.id === el.id;
            //             });
            //         });
            //     } else {
            //         this.selectedClients = this.selectedClients.concat(this.clientsList);
            //         this.clientsList = [];
            //     }
            // }

            // Filter clientsList based on searchText
            const filteredClients = this.clientsList.filter((client: any) =>
                client.name.toLowerCase().includes(this.searchText.toLowerCase())
            );
            if (filteredClients?.length > 0) {
                this.selectedClients = this.selectedClients.concat(filteredClients);
                this.clientsList = this.clientsList.filter((el: any) => {
                    return !this.selectedClients.find((element: any) => {
                        return element.id === el.id;
                    });
                });
            }
        } else {
            this.clientsList = this.selectedClients.concat(this.clientsList);
            this.selectedClients = [];
        }
        this.searchText = '';
    }

    selectCorp(event: any) {
        //console.log(this.corporateList)
        if (event?.target?.checked) {
            if (this.corporateList?.length > 0) {
                //console.log('CC',this.corporateList)
                if (this.filteredData?.length > 0) {
                    this.selectedClients = this.selectedClients.concat(this.filteredData);
                    this.corporateList = this.corporateList.filter((el: any) => {
                        return !this.selectedClients.find((element: any) => {
                            return element.id === el.id;
                        });
                    });
                } else {
                    this.selectedClients = this.selectedClients.concat(this.corporateList);
                    this.corporateList = [];
                }
            }
        } else {
            this.corporateList = this.selectedClients.concat(this.corporateList);
            this.selectedClients = [];
        }
    }

    // selectClient(group: any, value?: any) {
    //     this.selectedClients.push(group);
    //     this.tempList = !this.tempList;
    //     let index = this.clientsList.findIndex((d: any) => d.id === group.id); //find index in your array
    //     this.clientsList.splice(index, 1);
    //     if (this.clientsList.length == 0) {
    //         let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
    //         if (checkbox != null)
    //             checkbox.checked = true;
    //     }
    // }

    selectClient(client: any, isChecked: boolean) {
        this.isSaveEnable = true;
        if (isChecked) {
            this.selectedClients.push(client);
            let index = this.clientsList.findIndex((d: any) => d.id === client.id); // Find index in your array
            if (index !== -1) {
                this.clientsList.splice(index, 1);
            }
        } else {
            // Handle unselecting a single client
            let index = this.selectedClients.findIndex((d: any) => d.id === client.id);
            if (index !== -1) {
                this.selectedClients.splice(index, 1);
                this.clientsList.push(client);
            }
        }

        if (this.clientsList.length == 0) {
            let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
            if (checkbox != null) {
                checkbox.checked = true;
            }
        }
    }

    selectCorporate(group: any, value?: any) {
        this.isSaveEnable = true;
        this.selectedClients.push(group);
        let index = this.corporateList.findIndex((d: any) => d.id === group.id); //find index in your array
        this.corporateList.splice(index, 1);
        if (this.corporateList.length == 0) {
            let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
            if (checkbox != null)
                checkbox.checked = true;
        }
        //console.log("Corp selected clients "+JSON.stringify(this.selectedClients));
    }

    removeClient(group: any) {
        // let index = this.selectedClients.findIndex((d: any) => d.id === group.id); //find index in your array
        // this.selectedClients.splice(index, 1);
        // this.clientsList.push(group);
        this.selectedOption = ""; // Reset the dropdown selection
        this.isSaveEnable = true;
        //console.log('grp',group)
        let index = this.selectedClients.findIndex((d: any) => d.id === group.id);
        if (index > -1) {
            this.selectedClients.splice(index, 1);
        }
        // If the type is corp/notcorporate, push back to its respective List
        if (group.type !== 'corporate') {
            this.clientsList.push(group);
        }
        if (group.type === 'corporate') {
            this.corporateList.push(group);
            this.httpservice.getFeaturesdata(URLUtils.getCalenderExternal).subscribe((res: any) => {
                this.corporateList = res?.relationships.map((obj: any) => ({ "id": obj.id, "type": "corporate", "name": obj.name }));
            });
        }
        if (this.selectedClients.length == 0 || this.clientsList.length == 1) {
            let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
            if (checkbox != null)
                checkbox.checked = false;
        }
    }

    saveClients() {
        const tempVal = (this.tempClient.value.name?.length > 1 || 
            this.tempClient.value.lastName?.length > 1 || 
            this.tempClient.value.email?.length > 1 || 
            this.tempClient.value.country?.length > 1);

        const entityVal = (this.entityClient.value.fullname?.length > 1 || 
              this.entityClient.value.contact_person?.length > 1 || 
              this.entityClient.value.email?.length > 1 || 
              this.entityClient.value.country?.length > 1);

        if (tempVal || entityVal) {
            this.toastr.error('Please save your changes to proceed');
            return;
        }
        else{
            let selectedIds = this.tempClients.map((s: any) => s.id);
            this.temporaryClientsEvent.emit(selectedIds)
    
            let clients = this.selectedClients.filter((element: any) => element);
            this.selectedClientsEvent.emit(clients);
        }
        // let selectedIds = this.tempClients.map((s: any) => s.id);
        // this.temporaryClientsEvent.emit(selectedIds)
        // let clients = this.selectedClients.filter((element: any) => element);
        // this.selectedClientsEvent.emit(clients)
        //console.log('clientsclients',clients)
        
        // let clients = this.selectedClients.filter((element: any) => element.type !== "corporate");
        // this.selectedClientsEvent.emit(clients);
        // let corp = this.selectedClients.find((element: any) => element.type === "corporate");
        // this.corporateClientsEvent.emit(corp.id);
    }

    onClickCorp() {
        this.isSaveEnable = true;
        let flag = false;
        for (let i = 0; i < this.selectedClients.length; i++) {
            //console.log("Corp selected clients",this.selectedClients)
            if (this.selectedClients[i].type === "corporate") {
                this.selectedClients[i] = this.selectedOption;
                flag = true;
                break;
            }
        }
        if (!flag) {
            this.selectedClients.push(this.selectedOption);
        }
    }

    OnCancel() {
        // this.clientsList = this.clientsList.concat(this.selectedClients);
        // this.selectedClients = [];
        this.pathName = window.location.pathname.includes("legalmatter") ? "legalmatter" : "generalmatter";
        if (this.selectedClients.length > 0) {
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
    OnFormCancel() {
        const tempVal = this.tempClient.value.name.length > 1 || this.tempClient.value.lastName.length > 1 || this.tempClient.value.email.length > 1 || this.tempClient.value.country.length > 1;
        const entityVal = this.entityClient.value.fullname.length > 1 || this.entityClient.value.contact_person.length > 1 || this.entityClient.value.email.length > 1 || this.entityClient.value.country.length > 1;

        if (tempVal) {
            this.keyModel = true;
            return;
        }
        else if (entityVal) {
            this.keyModel = true;
            return;
        }
        else{        
        this.tempList = false;
        this.isSelectAllVisible = true;
        this.showTempForm = false;
        this.entityClient.reset();
        this.tempClient.reset();
        //this.onFilterValueChange();
        this.submitted = false;
        this.entitysubmitted = false;
        //this.clientsList = this.clientsList.concat(this.selectedClients);
        this.clientsList = this.originalClientsList.filter((client: any) =>
                !this.selectedClients.includes(client)
        ); // get back the client list
        this.showTempForm = false;
        //this.selectedClients;
        //this.getClients();
        //this.getClientsData();
        this.childButtonEvent.emit(this.clients);
        this.searchText = '';
        // this.clientsList = this.clientsList.concat(this.selectedClients);
        // this.selectedClients =[];}
        }
    }

    // keyup() {
    //     if (this.searchText.trim() === '') {
    //         this.searchText = this.searchText.trim();
    //     }
    //     this.showTempForm = false;
    //     this.onReset();
    //     this.onResetentity();
    //     // Convert search text to lowercase for case-insensitive search
    //     const searchLower = this.searchText.toLowerCase();
    //     this.filteredData = this.clientsList.filter((item: any) => item.name.toLowerCase().includes(searchLower));

    //     // Update visibility based on the filtered data
    //     if (this.filteredData.length === 0) {
    //         this.showTempForm = true;
    //     }

    //     this.isSelectAllVisible = this.filteredData.length > 0;

    //     const checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
    //     if (checkbox) {
    //         checkbox.checked = false;
    //     }
    // }

    keyup() {
        if (this.searchText.trim() === '') {
            this.searchText = this.searchText.trim();
        }
        this.showTempForm = false;
        this.onReset();
        this.onResetentity();

        if (this.searchText === '') {
            this.filteredData = this.clientsList.filter((item: any) => item.name.toLocaleLowerCase().includes(this.searchText));
            this.filteredData = this.originalClientsList.filter((client: any) =>
                !this.selectedClients.includes(client)
            );
            this.showTempForm = false; // Hide the temporary form
        } else {
            // Filter the clients list based on the search text, excluding selected clients
            this.filteredData = this.clientsList.filter((item: any) => item.name.toLocaleLowerCase().includes(this.searchText));
            this.filteredData = this.originalClientsList.filter((item: any) =>
                item.name.toLocaleLowerCase().includes(this.searchText.toLocaleLowerCase()) &&
                !this.selectedClients.includes(item)
            );
            this.showTempForm = this.filteredData.length === 0; // if no clients match
            //this.showTempForm = true;
        }

        this.isSelectAllVisible = this.clientsList.length > 0; // Update "Select All" visibility

        let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
        if (checkbox) {
            checkbox.checked = false;
        }
    }
    
    //if form is incomplete
    isFormIncomplete(): boolean {
        return (
            this.tempClient.dirty ||
            this.tempClient.touched ||
            this.entityClient.dirty ||
            this.entityClient.touched
        );
    }

    getType(e: any, type: any) {
        // console.log('tempClient',this.tempClient.value)
        // console.log('entityClient',this.entityClient.value)
        // || this.tempClient.dirty ||  this.tempClient.touched || this.entityClient.dirty ||  this.entityClient.touched 

        const tempVal = (this.tempClient.value.name.length > 1 || this.tempClient.value.lastName.length > 1 || this.tempClient.value.email.length > 1 || this.tempClient.value.country.length > 1);
        const entityVal = (this.entityClient.value.fullname.length > 1 || this.entityClient.value.contact_person.length > 1 || this.entityClient.value.email.length > 1 || this.entityClient.value.country.length > 1);

        if (tempVal) {
            this.successModel = true;
            return;
        }
        else if (entityVal) {
            this.successModel = true;
            return;
        }
        else{
        this.selectedType = type;
        this.successModel = false;
        this.ClientType = e.target.name;
        this.CorpType
        this.tempClient.controls.type.patchValue(type);
        }
    }

    // getType(e: any, type: any) {
    //     if (this.tempClient.dirty) {
    //         this.toastr.error('Please save your changes to proceed');
    //         return;
    //     }
    //     else if (this.entityClient.dirty) {
    //         this.toastr.error('Please save your changes to proceed');
    //         return;
    //     }
    //     else{}
    //         this.ClientType = e.target.name;
    //         this.CorpType
    //         this.tempClient.controls.type.patchValue(type);
    // }

    //For Firm tab dialog
    successResp(action: string) {
        if (action == 'yes') {
            this.successModel = false;
            if (this.selectedType == 'individual') {
                this.ClientType = 'entity';
            }
            else {
                this.ClientType = 'individual';
            }
        }
        this.onReset();
        this.onResetentity();
    }
    noResp(action: string) {
        if (action == 'no') {
            this.successModel = false;
            this.selectedType = this.selectedType;
        }
    }

    //For cancel button dialog
    keyResp(action: string) {
        if (action == 'yes') {
            this.keyModel = false;
            this.searchText = '';
            this.tempList = false;
            this.isSelectAllVisible = true;
            this.showTempForm = false;
            this.entityClient.reset();
            this.tempClient.reset();
            this.submitted = false;
            this.entitysubmitted = false;
            this.childButtonEvent.emit(this.clients);
            this.clientsList = this.originalClientsList.filter((client: any) =>
                    !this.selectedClients.includes(client)
            ); // get back the client list
        }
    }
    nokeyResp(action: string) {
        if (action == 'no') {
            this.keyModel = false
        }
    }

    toggleType() {
        this.selectedType = this.selectedType === 'individual' ? 'entity' : 'individual';
    }

    oneEntitySubmit(submitType: string) {
        this.inputsubmit = submitType; 
        this.isSaveEnable = true;
        this.entitysubmitted = true;
        // if (this.entityClient.invalid) {
        //     return;
        // }
        // Check if email and confirmemail do not match
        if (this.entityClient.value.confirmemail !== this.entityClient.value.email) {
            return;
        }
        if (this.inputsubmit == 'entity') {
            let object = {
                "fullname": this.entityClient.value.fullname,
                "contact_person": this.entityClient.value.contact_person,
                "email": this.entityClient.value.email,
                "contact_phone": this.entityClient.value.phonenumber,
                "country": this.entityClient.value.country,
                "group_acls": this.groups.map((obj: any) => obj.id)
            }

            this.httpService.sendPostRequest(URLUtils.matterEntity, object).subscribe((res: any) => {
                if (!res.error) {
                    let dObj = {
                        id: res?.createdId,
                        name: res?.name,
                        type: 'entity'
                    }
                    this.selectedClients.push(dObj);
                    this.toastr.success('Temporary client added successfully.')
                    this.onResetentity();
                    this.OnFormCancel();
                    this.getClientsData();
                    // this.confirmationDialogService.confirm('Success for Entity', `Congratulations! You have successfully created Entity  ${this.tempClient.value.name} to  ${this.data.Title}`, false, 'Add Team Members', 'Cancel', true)
                    //     .then((confirmed) => {
                    //         this.onResetentity();
                    //         this.OnFormCancel();
                    //     })
                }
            },
                (error: HttpErrorResponse) => {
                    if (error.status === 401) {
                        const errorMessage = error.error.msg || 'Unauthorized';
                        this.toastr.error(errorMessage);
                    } else if (error.status === 400) {
                        if (error.error.errors) {
                            error.error.errors.forEach((err: { field: string; msg: string }) => {
                                if(this.entityClient.value.email.length > 1 && (err.msg === "Account already exists with this email" || err.msg === "Account already exists with this Firm Name")){
                                    this.toastr.error(`${err.msg}`);
                                }
                            });
                        } else {
                            this.toastr.error('Bad Request');
                        }
                    } else {
                        this.toastr.error('An unexpected error occurred');
                    }
                }
            )
        }
        //this.onResetentity();
    }
    onindividualSubmit(submitType: string) {
        //console.log('confirmemail',this.tempClient.value)
        this.inputsubmit = submitType; 
        this.isSaveEnable = true;
        this.submitted = true;
        // if (this.tempClient.invalid) {
        //     return;
        // }
        // Check if email and confirmemail do not match
        if (this.tempClient.value.confirmemail !== this.tempClient.value.email) {
            return;
        }

        if (this.inputsubmit == 'temp') {
            let obj = {
                "first_name": this.tempClient.value.name,
                "last_name": this.tempClient.value.lastName,
                "email": this.tempClient.value.email,
                "country": this.tempClient.value.country,
                "phone": this.tempClient.value.phonenumber,
                "group_acls": this.groups.map((obj: any) => obj.id)
            }
            this.httpService.sendPostRequest(URLUtils.matterIndiviuals, obj).subscribe((res: any) => {
                if (!res.error) {
                    let dObj = {
                        id: res?.createdId,
                        name: res?.name,
                        type: 'consumer'
                    }
                    this.selectedClients.push(dObj);
                    this.toastr.success('Temporary client added successfully.')
                    this.onReset();
                    this.OnFormCancel();
                    this.getClientsData();
                    // this.confirmationDialogService.confirm('Success', 'Congratulations! You have successfully sent relationship request ', false, 'Add Team Members', 'Cancel', true)
                    //     .then((confirmed) => {
                    //         this.onReset();
                    //         this.OnFormCancel();
                    //     })
                }
                // else{
                //     this.confirmationDialogService.confirm('failed', 'sorry! You have sent duplicate  request ', false, 'Add Team Members', 'Cancel', true)
                // }
            },
                (error: HttpErrorResponse) => {
                    if (error.status === 401) {
                        const errorMessage = error.error.msg || 'Unauthorized';
                        this.toastr.error(errorMessage);
                    } else if (error.status === 400) {
                        if (error.error.errors) {
                            error.error.errors.forEach((err: { field: string; msg: string }) => {
                                if(this.tempClient.value.email.length > 1 && err.msg === "Account already exists with this email"){
                                this.toastr.error(`${err.msg}`);
                                }
                            });
                        } else {
                            this.toastr.error('Bad Request');
                        }
                    } else {
                        this.toastr.error('An unexpected error occurred');
                    }
                }
            );
        }
        //this.onReset();
    }

    // onSubmit() {
    //     this.submitted = true;
    //     console.log(this.tempClient);
    //     if (this.inputsubmit == 'invite') {
    //         if (this.tempClient.value.type === 'entity') {
    //             let obj = {
    //                 "entityName": this.tempClient.value.name,
    //                 "fullname": this.tempClient.value.name,
    //                 "contact_person": this.tempClient.value.name,
    //                 "email": this.tempClient.value.email,
    //                 "contactPhone": this.tempClient.value.phonenumber,
    //                 "country": "USA",
    //                 "groups": this.groups.map((obj: any) => obj.id)
    //             }
    //              this.httpService.sendPostRequest(URLUtils.inviteEntity, obj).subscribe((res: any) => {
    //                 if (!res.error) {
    //                      this.confirmationDialogService.confirm('Success', 'Congratulations! You have successfully sent relationship request ', false, 'Add Team Members', 'Cancel', true)
    //                          .then((confirmed) => {
    //                              this.OnFormCancel();
    //                         })
    //                  }
    //              })
    //         } else {
    //             let obj = {
    //                 "first_name": this.tempClient.value.name,
    //                 "last_name": this.tempClient.value.name,
    //                 "email": this.tempClient.value.email,
    //                 "country": "USA",
    //                 "groups": this.groups.map((obj: any) => obj.id)
    //             }
    //              this.httpService.sendPostRequest(URLUtils.inviteConsumer, obj).subscribe((res: any) => {
    //                  if (!res.error) {
    //                     this.confirmationDialogService.confirm('Success', `Congratulations! You have successfully created temp client  ${this.tempClient.value.name} to  ${this.data.Title}`, false, 'Add Team Members', 'Cancel', true)
    //                          .then((confirmed) => {
    //                             this.OnFormCancel();
    //                          })
    //                  }
    //              })
    //         }
    //     } else if (this.inputsubmit == 'temp') {

    //         let obj = {
    //             "name": this.tempClient.value.name,
    //             "lastName": this.tempClient.value.lastName,
    //             "email": this.tempClient.value.email,
    //             "phone": this.tempClient.value.phonenumber,
    //             "clientType": this.tempClient.value.type,
    //             "country": "USA"
    //         }
    //         this.httpService.sendPostRequest(URLUtils.tempClientPost, obj).subscribe((res: any) => {
    //             //console.log("error "+JSON.stringify(res)); 
    //             this.tempClients.push(res);
    //             localStorage.setItem('tempClients', JSON.stringify(this.tempClients));
    //             this.onReset();
    //  this.tempClient.reset();

    // if (!res.error) {
    //     this.confirmationDialogService.confirm('Success', `${res.msg}`, false, 'Add Team Members', 'Cancel', true)
    //         .then((confirmed) => {
    //             this.OnFormCancel();
    //         })
    // }
    //         }, error => {
    //             //console.log("error "+JSON.stringify(error)); 
    //             this.toastr.error(error.error.errors[0].msg)
    //         },)
    //     }
    // }
    onReset() {
        this.submitted = false;
        this.tempClient.controls['name'].setValue('');
        this.tempClient.controls['lastName'].setValue('');
        this.tempClient.controls['email'].setValue('');
        this.tempClient.controls['confirmemail'].setValue('');
        this.tempClient.controls['country'].setValue('');
        this.tempClient.controls['phonenumber'].setValue('');
    }
    onResetentity() {
        this.entitysubmitted = false;
        this.entityClient.controls['fullname'].setValue('');
        this.entityClient.controls['contact_person'].setValue('');
        this.entityClient.controls['email'].setValue('');
        this.entityClient.controls['confirmemail'].setValue('');
        this.entityClient.controls['country'].setValue('');
        this.entityClient.controls['phonenumber'].setValue('');
    }

    removeTempClient(val: any) {
        this.isSaveEnable = true;
        let index = this.tempClients.findIndex((d: any) => d.id === val.id); //find index in your array
        this.tempClients.splice(index, 1);
        localStorage.setItem('tempClients', JSON.stringify(this.tempClients));
    }


    getCorp() {
        this.corporateData = true;
        this.selectedOption = "";
    }

    getClient() {
        this.corporateData = false;
        this.tempList == true
    }
    restricttextSpace(event: any) {
        let inputValue: string = event.target.value;
        inputValue = inputValue.replace(/^\s+/, '');
        inputValue = inputValue.replace(/\s{2,}/g, ' ');
        event.target.value = inputValue;
    }

    truncateString(text: string): string {
        if (text.length > 25) {
            return text.slice(0, 25) + '...';
        }
        return text;
    }
    toggleView() {
        this.showAllItems = !this.showAllItems;
    }
}
