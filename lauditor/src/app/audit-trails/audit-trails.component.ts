import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';
import { URLUtils } from '../urlUtils';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    moduleId: module.id,
    selector: 'audit-trails',
    templateUrl: 'audit-trails.component.html',
    styleUrls: ['audit-trails.component.scss']
})
export class AuditTrailsComponent {
    product = environment.product;
    p: any=1;
    members: any = [];
    membersList: any[] = [];
    searchText: any = "";
    ghname: string = "";
    logForm: any = FormGroup;
    submitted: boolean = false;
    pipe = new DatePipe('en-US');
    loglist: any[] = [];
    data: any = {};
    auditLogs: any;
    filterByCategory: any;
    isChecked: boolean = false;  // Boolean flag
    term: any;
    fromCount: any = 1;
    toCount: any = 10;
    isReverse: boolean = false;
    frombsValue: any;
    tobsValue: any;
    selectedCategory: string | null = null;

    //for Lauditor, Content, Connect
    categoryList: any = [
        { name: 'Authorization', value: 'AUTH' },
        { name: 'Groups', value: 'GROUPS' },
        { name: 'Team Members', value: "TEAM MEMBER" },
        { name: 'Relationships', value: 'RELATIONSHIP' },
        { name: 'Share', value: "SHARE" },
        { name: 'Documents', value: 'DOCUMENT' },
        { name: 'Merge PDF', value: 'MERGE PDF' },
        { name: 'Legal Matters', value: 'LEGAL MATTER' },
        { name: 'General Matters', value: 'GENERAL MATTER' },
        //{ name: 'Matters', value: 'MATTERS' },
        // { name: 'Timesheets', value: '' }
    ]

    categoryListAAM: any = [
        { name: 'Authorization', value: 'AUTH' },
        { name: 'Groups', value: 'GROUPS' },
        { name: 'Team Members', value: "TEAM MEMBER" },
    ]

    //for Corporate only
    categoryCorp: any = [
        { name: 'Authorization', value: 'AUTH' },
        { name: 'Departments', value: 'GROUPS' },
        { name: 'Team Members', value: "TEAM MEMBER" },
        { name: 'Relationships', value: 'RELATIONSHIP' },
        { name: 'Share', value: "SHARE" },
        { name: 'Documents', value: 'DOCUMENT' },
        { name: 'Merge PDF', value: 'MERGE PDF' },
        { name: 'Legal Matters', value: 'LEGAL MATTER' },
        { name: 'General Matters', value: 'GENERAL MATTER' },
        // { name: 'Timesheets', value: '' }
    ]

    //for Content GH-role only
    categoryContGH: any = [
        { name: 'Authorization', value: 'AUTH' },
        { name: 'Groups', value: 'GROUPS' },
        { name: 'Team Members', value: "TEAM MEMBER" },
        { name: 'Relationships', value: 'RELATIONSHIP' },
        { name: 'Share', value: "SHARE" },
        { name: 'Documents', value: 'DOCUMENT' },
        { name: 'Merge PDF', value: 'MERGE PDF' }
    ]

    //for Connect GH-role only
    categoryConnectGH: any = [
        { name: 'Authorization', value: 'AUTH' },
        { name: 'Groups', value: 'GROUPS' },
        { name: 'Team Members', value: "TEAM MEMBER" },
        { name: 'Relationships', value: 'RELATIONSHIP' },
        { name: 'Share', value: "SHARE" },
        { name: 'Documents', value: 'DOCUMENT' }
    ]
    name: string = "";
    roleId: string = "GH";
    role: string = "GH";

    constructor(private httpService: HttpService,
        private fb: FormBuilder, private spinnerService: NgxSpinnerService,
        private router: Router) {
        this.filterByCategory = [];
    }

    ngOnInit(): void {
        this.logForm = this.fb.group({
            // category: ['Authorization', Validators.required],
            // client: ['', Validators.required],
            // tm: ['', Validators.required],
            // search: [''],
            fromDate: [''],
            toDate: ['']
        });
        this.getAuditList();

        var role = localStorage.getItem("role")
        if (role != null) { this.roleId = role }
        if (role == 'SU') { this.role = 'SuperUser' }
        if (role == 'AAM') { this.role = 'Admin' }
        if (role == 'TM') { this.role = 'Team Member' }
        if (role == 'GH') { this.role = 'Group Head' }
    }

    selectCategory(item: { value: string; name: string }) {
        this.selectedCategory = item.name;
        this.getCategory(item.value);
    }

    isCheckBox(val: any) {
        this.isChecked = val;
    }
    get f() { return this.logForm.controls; }

    close() {
    }

    onSubmit() {
        let data = this.logForm.value
        data['fromDate'] = this.pipe.transform(data['fromDate'], 'dd-MM-yyyy');
        data['toDate'] = this.pipe.transform(data['toDate'], 'dd-MM-yyyy');
        this.httpService.sendPutRequest(URLUtils.getAudit, data).subscribe(
            (res: any) => {
                this.filterByCategory = res['data']
            })
    }
    getAuditList() {
        this.spinnerService.show();
        this.httpService.sendGetRequest(URLUtils.getAudit).subscribe(
            (res: any) => {
                this.auditLogs = res.data.reverse();
                //this.filterByCategory = this.auditLogs;
                this.filterByCategory = this.auditLogs.filter((log: any) => log.name.trim() !== 'MATTER');
                //console.log('Filtered Data:', this.filterByCategory);
                // Use timeout to avoid UI blocking
                setTimeout(() => {
                    this.filterByCategory = this.auditLogs.filter((log: any) => log.name.trim() !== 'MATTER');
                    this.spinnerService.hide();
                }, 0);
            });

    }
   
    getCategory(val: any) {
        let filterByCategory: any = [];
        this.selectedCategory = val.name;
        this.auditLogs.forEach((item: any) => {
           
            if (item.name == val.value) {
                filterByCategory.push(item);
               
            }
        });

        this.filterByCategory = filterByCategory;
        this.p=1;
        this.pageChanged(1);
        
    }
     pageChanged(val: any) {
         this.fromCount = (val * 10) - 9;
         this.toCount = val * 10;
         //console.log("page change " + val);
     }
    // getCurrent(val: any) {
    //     //console.log("current page change " + val);
    // }
    sortDocuments(val: any) {
        this.isReverse = !this.isReverse;
        if (this.isReverse) {
            this.filterByCategory = this.filterByCategory?.sort((p1: any, p2: any) => (p1[val] < p2[val]) ? 1 : (p1[val] > p2[val]) ? -1 : 0);
        } else {
            this.filterByCategory = this.filterByCategory?.sort((p1: any, p2: any) => (p1[val] > p2[val]) ? 1 : (p1[val] < p2[val]) ? -1 : 0);
        }
    }
    selectFromDuration(val: any) {
        this.frombsValue = val;
        this.selectedData();
    }
    selectToDuration(val: any) {
        this.tobsValue = val;
        this.selectedData();
    }
    selectedData(){
        let timeFilter: any = [];
        if (this.frombsValue && this.tobsValue) {
            this.filterByCategory.forEach((item: any) => {
                if (new Date(item.timestamp) >= this.frombsValue && new Date(item.timestamp) <= this.tobsValue) {
                    timeFilter.push(item)
                }
            })
            this.filterByCategory = timeFilter;
            this.pageChanged(1);
            this.p=1;
        }
    }
    ngAfterViewInit() {

    }
}

