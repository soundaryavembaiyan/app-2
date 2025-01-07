import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { URLUtils } from 'src/app/urlUtils';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
declare var bootstrap: any; // Import Bootstrap for modal triggering

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.scss']
})
export class MemberEditComponent implements OnInit {

  @Output() event = new EventEmitter<string>();
  @Input() memData: any;

  submitted: boolean = false;
  confmismatch = false;
  createMemberForm: any = FormGroup;
  currencyList = ["USDollar(USD)",
                  "Euro(EUR)",
                  "JapaneseYen(JPY)",
                  "Pound(GBP)",
                  "AustralianDollar(AUD)",
                  "CanadianDollar(CAD)",
                  "SwissFranc(CHF)",
                  "KuwaitiDinar(KWD)",
                  "BahrainiDinar(BHD)",
                  "IndianRupee(INR)"]
  

  constructor(private formBuilder: FormBuilder, private toast: ToastrService,
              private httpService: HttpService,  private router: Router) {
   this.createMemberForm = this.formBuilder.group({
            name: ['', Validators.required],
            designation: ['', Validators.required],
            email:['',[Validators.required, Validators.pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)]],
            emailConfirm:['',[Validators.required, Validators.pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)]],
            currency:['',Validators.required],
            defaultRate:['',Validators.required]
    });
  }

  ngOnInit(){
    var fields = ['name', 'email', 'designation', 'currency','defaultRate']
    fields.forEach((item: any, index: number) => {
      this.createMemberForm.controls[item].setValue(this.memData[item])
    })
    this.createMemberForm.controls['emailConfirm'].setValue(this.memData['email'])
  }
  
  get f() { return this.createMemberForm.controls; }
  
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
    // let form = this.createMemberForm;
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
    //var payload = this.createMemberForm.value;
    const payload = {
      ...this.createMemberForm.value,
      email, // Normalize email to lowercase
      emailConfirm, // Normalize emailConfirm to lowercase
    };

    this.httpService.sendPatchRequest(URLUtils.updateMember(this.memData),
        payload).subscribe((res: any) => {
          this.event.emit("edit-member-done")
      },(error) => {
      if(error.status == 400){
        form.controls['email'].setErrors({'duplicate': true})
      }
      if (error.status === 400) {
        this.toast.error('Email already in use with this firm');
        //console.log(error);
      }
      if (error.status === 401 || error.status === 403) {
        const errorMessage = error.error.msg || 'Unauthorized';
        this.toast.error(errorMessage);
        //console.log(error);
      }
        
    })
  }
  // cancel(){
  //   this.event.emit('edit-member-close')
  // }

  cancel() {
    if (this.createMemberForm.dirty) {
      const cancelModal = new bootstrap.Modal(document.getElementById('modalCancel'), {});
      cancelModal.show(); // Trigger the confirmation dialog
    } else {
      this.event.emit('edit-member-close'); // Emit the event to navigate back without showing the dialog
    }
  }
  
  closeDialog() {
    this.event.emit('edit-member-close');
  }

  restricttextSpace(event: any) {
    let inputValue: string = event.target.value;
    inputValue = inputValue.replace(/^\s+/, '');
    inputValue = inputValue.replace(/\s{2,}/g, ' ');
    event.target.value = inputValue;
    return;
  }
  
  restrictToNumbers(event: Event) {
    const target = event.target as HTMLInputElement;
    target.value = target.value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
  }
}