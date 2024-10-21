import { AdvicateModel } from './../../../../../shared/config-model';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
@Component({
    selector: 'add-adivicate',
    templateUrl: 'add-adivicate.component.html',
    styleUrls: ['add-adivicate.component.scss']
})
export class AddAdivicateComponent implements OnInit {
    @Output() childButtonEvent = new EventEmitter();
    @Input() editAdvocatesList: any;
    @Input() isAddDisable: boolean = false;
    advicate: any = [];
    memberDetail: any = FormGroup;
    submitted = false;
    enableAdvicate: boolean = false;
    name: any;
    email: any;
    phone: any;
    currentIndex: any;
    isEditing: boolean = false;

    constructor(private fb: FormBuilder) {
    }
    get f() {
        return this.memberDetail.controls;
    }
    ngOnInit(): void {
        //console.log('editAdvocatesList',this.editAdvocatesList)
        if (this.editAdvocatesList?.length > 0) {
            this.advicate = this.editAdvocatesList;
        }
        this.memberDetail = this.fb.group({
            name: ['', Validators.required],
            email: ['', Validators.required],
            phone: ['', Validators.required]
        })
    }
    // valueExist() {
    //     let x = this.advicate.filter((x: any) => (x.name == this.memberDetail.value.name) || (x.email == this.memberDetail.value.email) ||
    //         (x.phone == this.memberDetail.value.phone));
    //     if (x.length > 0) {
    //         if (x[0].name == this.memberDetail.value.name) {
    //             this.memberDetail.controls.name.setErrors({ 'alreadyExist': true });
    //         }
    //         if (x[0].email == this.memberDetail.value.email) {
    //             this.memberDetail.controls.email.setErrors({ 'alreadyExist': true });
    //         }
    //         if (x[0].phone == this.memberDetail.value.phone) {
    //             this.memberDetail.controls.phone.setErrors({ 'alreadyExist': true });
    //         }
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }

    // onSubmit() {
    //     this.submitted = true;
    //     this.currentIndex = null;
    //     if (this.memberDetail.invalid || this.valueExist()) {
    //         return;
    //     }
    //     if (this.enableAdvicate && this.advicate?.length > 0) {
    //         let index = this.advicate.findIndex((d: any) => (d.email === this.email) || (d.name === this.name) || (d.phone === this.phone)); //find index in your array
    //         if (index >= 0)
    //             this.advicate.splice(index, 1);
    //     }
    //     this.advicate.push(this.memberDetail.value);
    //     //console.log('json',JSON.stringify(this.advicate));
    //     this.childButtonEvent.emit(this.advicate);
    //     this.enableAdvicate = false;
    //     this.onReset();
    // }

    startEditing() {
        this.isEditing = true;
    }

    stopEditing() {
        this.isEditing = false;
    }

    addAdvicate() {
        if (this.isEditing) return;
        this.enableAdvicate = true;
        this.childButtonEvent.emit(null);
        this.onReset();
        this.startEditing();
    }

    removeOpponente(item: any) {
        let index = this.advicate.findIndex((d: any) => d.email === item.email); //find index in your array
        this.advicate.splice(index, 1);
        // Emit the saveBtn
        this.childButtonEvent.emit(this.advicate);
    }

    editOpponente(item: any, i: number) {
        this.currentIndex = i;
        this.enableAdvicate = true;
        this.name = item.name;
        this.email = item.email;
        this.phone = item.phone;
    }

    // valueExist(currentIndex: number | null): boolean {
    //     const { name, email, phone } = this.memberDetail.value;
    //     // Check for duplicates excluding the current index
    //     const index = this.advicate.findIndex((d: any, idx: number) =>
    //         (d.email === email || d.name === name || d.phone === phone) && idx !== currentIndex
    //     );
    //     if (index !== -1) {
    //         this.memberDetail.controls['name'].setErrors(index !== currentIndex ? { alreadyExist: true } : null);
    //         this.memberDetail.controls['email'].setErrors(index !== currentIndex ? { alreadyExist: true } : null);
    //         this.memberDetail.controls['phone'].setErrors(index !== currentIndex ? { alreadyExist: true } : null);
    //         return true;
    //     }
    //     return false;
    // }

    valueExist(currentIndex: number | null): boolean {
        const { name, email, phone } = this.memberDetail.value;
        let duplicateFound = false;
        // Check for duplicate name
        const nameIndex = this.advicate.findIndex((d: any, idx: number) =>
            d.name === name && idx !== currentIndex
        );
        if (nameIndex !== -1) {
            this.memberDetail.controls['name'].setErrors({ alreadyExist: true });
            duplicateFound = true;
        } else {
            this.memberDetail.controls['name'].setErrors(null);
        }
        // Check for duplicate email
        const emailIndex = this.advicate.findIndex((d: any, idx: number) =>
            d.email === email && idx !== currentIndex
        );
        if (emailIndex !== -1) {
            this.memberDetail.controls['email'].setErrors({ alreadyExist: true });
            duplicateFound = true;
        } else {
            this.memberDetail.controls['email'].setErrors(null);
        }
        // Check for duplicate phone
        const phoneIndex = this.advicate.findIndex((d: any, idx: number) =>
            d.phone === phone && idx !== currentIndex
        );
        if (phoneIndex !== -1) {
            this.memberDetail.controls['phone'].setErrors({ alreadyExist: true });
            duplicateFound = true;
        } else {
            this.memberDetail.controls['phone'].setErrors(null);
        }

        return duplicateFound;
    }


    onSubmit() {
        this.submitted = true;
        if (this.memberDetail.invalid || this.valueExist(this.currentIndex)) {
            return;
        }
        if (this.currentIndex !== null && this.currentIndex >= 0) {
            this.advicate[this.currentIndex] = this.memberDetail.value;
        } else {
            this.advicate.push(this.memberDetail.value);
        }
        // Emit the updated list of advocates
        this.childButtonEvent.emit(this.advicate);
        this.enableAdvicate = false;
        this.stopEditing();
        this.onReset();
    }

    onReset() {
        this.submitted = false;
        this.memberDetail.reset();
        this.currentIndex = null;
    }
    restricttextSpace(event: any) {
        let inputValue: string = event.target.value;
        inputValue = inputValue.replace(/^\s+/, '');
        inputValue = inputValue.replace(/\s{2,}/g, ' ');
        event.target.value = inputValue;
        return;
    }
    restrictToNumbers(event: any): void {
        const input = event.target;
        const inputValue = input.value;
        input.value = inputValue.replace(/[^0-9]/g, '');
    }

}
