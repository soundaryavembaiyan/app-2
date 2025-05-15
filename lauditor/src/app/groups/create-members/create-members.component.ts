import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { HttpService } from 'src/app/services/http.service';
import { URLUtils } from 'src/app/urlUtils';
import { GroupModel } from '../group.model';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
declare var bootstrap: any; // Import Bootstrap for modal triggering

@Component({
  selector: 'app-create-members',
  templateUrl: './create-members.component.html',
  styleUrls: ['./create-members.component.scss']
})
export class CreateMembersComponent implements OnInit {

  //isShowDiv = false;
  product = environment.product;
  createMemberForm: any = FormGroup;
  submitted = false;
  postMember: any = GroupModel;
  memDetails: boolean = true;
  assignToGrp: boolean = false;
  groupList: any[] = [];
  selectedGroups: any[] = [];
  showForm: boolean = true;
  showMemlist: boolean = false;
  successModel: boolean = false;
  successMemName: string = "";
  successGrpCount: string = "";
  searchText: string = "";
  mismatch: boolean = false;
  currencyList = ["USDollar(USD)",
                  "Euro(EUR)",
                  "JapaneseYen(JPY)",
                  "Pound(GBP)",
                  "AustralianDollar(AUD)",
                  "CanadianDollar(CAD)",
                  "SwissFranc(CHF)",
                  "KuwaitiDinar(KWD)",
                  "BahrainiDinar(BHD)", 
                  "IndianRupee(INR)" ]
  msg: string | undefined;
  isSaveDisabled:boolean = true;
  error:string = '';
  memberCount:any;
  viewMembers:any;
  disablePage: boolean = false;
  confmismatch = false;
  isPaidSub:any;
  
  constructor(private formBuilder: FormBuilder,
              private httpService: HttpService, 
              private toast: ToastrService,
              private router: Router) { }

  ngOnInit() {
    this.createMemberForm = this.formBuilder.group({
      name: ['', Validators.required],
      designation: ['', Validators.required],
      email:['', [Validators.required, Validators.pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)]],
      emailConfirm:['', [Validators.required, Validators.pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)]],
      currency:['USDollar(USD)',Validators.required],
      defaultRate:['',Validators.required]
    });
    this.loadGroups();
    this.getMembers();
  }

  // convenience getter for easy access to form fields
  get f() { return this.createMemberForm.controls; }

  getMembers(){
    this.httpService.sendGetRequest(URLUtils.getMembers).subscribe((res:any)=>{
        this.viewMembers = res.data.users;
        this.memberCount = res.data;
        //this.isPaidSub = JSON.parse(localStorage.getItem('isPaidSub') || 'true');
        // console.log('isPaidSub',this.isPaidSub); 
        // console.log('viewMembers', this.viewMembers);
        // console.log('memcount', this.memberCount);
        // console.log('count',this.memberCount?.count)
        // console.log('total',this.memberCount?.total)
      
        if(this.memberCount?.count === this.memberCount?.total && this.product === 'lauditor'){
          this.disablePage = true;
        }
        //console.log('disablePage',this.disablePage)
    })
  }

  // resetEmailConf(){
  //   //this.createMemberForm.controls['emailConfirm'].setErrors(null)
  // }

  resetEmailConf() {
    const email = this.createMemberForm.get('email')?.value?.trim().toLowerCase();
    const emailConfirm = this.createMemberForm.get('emailConfirm')?.value?.trim().toLowerCase();
  
    if (email && emailConfirm && email !== emailConfirm) {
      this.createMemberForm.get('emailConfirm')?.setErrors({ mismatch: true });
      this.confmismatch = true;
    } else {
      this.createMemberForm.get('emailConfirm')?.setErrors(null);
      this.confmismatch = false;
    }
    this.createMemberForm.markAsDirty(); // Mark the form as dirty if there are changes
  }
  
  onSubmit() {
    this.submitted = true;
    this.mismatch = false;

    //console.log('form', this.createMemberForm)
    // let form = this.createMemberForm
    // if(form.value['email'] != form.value['emailConfirm']){
    //   form.controls['emailConfirm'].setErrors({'mismatch': true})
    // }
    // if (this.createMemberForm.invalid) { return; }

    const form = this.createMemberForm;
    const email = form.value['email']?.trim().toLowerCase();
    const emailConfirm = form.value['emailConfirm']?.trim().toLowerCase();
  
    if (email !== emailConfirm) {
      form.controls['emailConfirm'].setErrors({ 'mismatch': true });
    }
    if (this.createMemberForm.invalid) {
      return;
    }
  
    const payload = {
      ...this.createMemberForm.value,
      email, // Normalize email to lowercase
      emailConfirm, // Normalize emailConfirm to lowercase
      groups: this.selectedGroups?.map((obj: any) => obj.id),
    };
    payload["groups"] = this.selectedGroups?.map((obj: any) => obj.id);

    this.httpService.sendPostRequest(URLUtils.addMember, payload).subscribe((res: any) => {
          this.successModel = true;
          this.successMemName = payload['name'];
          this.successGrpCount = payload['groups'].length;
    }, (error: HttpErrorResponse) => {
      if (error.status == 400) {
        this.backToInfo()
        this.mismatch = true
      }
      if (error.status === 401 || error.status === 403) {
        const errorMessage = error.error.msg || 'Unauthorized';
        this.error = errorMessage;
        this.disablePage = this.memberCount?.count === this.memberCount?.total;

        // this.toast.error(errorMessage);
        // console.log(error);
      }
    })
  }
  
  
  closeForm(){

  }
  
  loadGroups(){
     this.httpService.sendGetRequest(URLUtils.getGroups).subscribe((res: any) => {
      this.groupList = res?.data;
    })
  }
  onSearch(elm: any){
    this.searchText = elm.target.value
  }
  backToInfo(){
     this.showMemlist = false
     this.showForm = true
  }
  onReset() {
    this.submitted = false;
    this.createMemberForm.reset();
    this.router.navigate(['/view-member'])
  }

  selMembers(){

    const form = this.createMemberForm;
    const email = form.value['email']?.trim().toLowerCase();
    const emailConfirm = form.value['emailConfirm']?.trim().toLowerCase();
  
    if (email !== emailConfirm) {
      form.controls['emailConfirm'].setErrors({ 'mismatch': true });
    }

    // let form = this.createMemberForm
    // if(form.value['email'] != form.value['emailConfirm']){
    //   form.controls['emailConfirm'].setErrors({'mismatch': true})
    // }
    this.submitted = true;
    if (this.createMemberForm.invalid) {return; }
    this.showForm = false
    this.showMemlist = true
  }
  
  selectGrp(grp: any, checked: boolean){
    let index = this.selectedGroups.indexOf(grp)
    if(checked && index == -1){
      this.selectedGroups.push(grp)
    } else {
      this.selectedGroups.splice(index, 1)
    }
    this.isSaveDisabled = this.selectedGroups.length === 0;
  }
  successResp(action: string){
    if(action == 'view'){
       this.router.navigate(['/view-member'])
    }
    if(action == 'add'){
      this.successMemName = ""
      this.successGrpCount = ""
      this.successModel = false
      this.showForm = true
      this.createMemberForm.reset()
      this.selectedGroups = []
      this.showMemlist = false
    }
  }
  restricttextSpace(event: any) {
    let inputValue: string = event.target.value;
    inputValue = inputValue.replace(/^\s+/, '');
    inputValue = inputValue.replace(/\s{2,}/g, ' ');
    event.target.value = inputValue;
    return;
  }
  closeModal(): void {
    this.successModel = false;
  }

  cancel() {
    const formValues = this.createMemberForm.value;
    const fieldsToCheck = ['name', 'designation', 'email', 'emailConfirm', 'defaultRate'];
  
    // Check if any of the specified fields have a non-empty value
    const hasValues = fieldsToCheck.some(field => {
      const value = formValues[field];
      return typeof value === 'string' ? value.trim() !== '' : value !== null && value !== undefined;
    });
  
    if (hasValues) {
      const modalElement = document.getElementById('modalCancel');
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    } else {
      this.router.navigate(['/view-member'])
      //console.log('fields are empty');
    }
  }
  restrictToNumbers(event: Event) {
    const target = event.target as HTMLInputElement;
    target.value = target.value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
  }
  
}




