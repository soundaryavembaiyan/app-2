import { FormBuilder, FormGroup, Validators,FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-edit-calender-dialog',
  templateUrl: './edit-calender-dialog.component.html',
  styleUrls: ['./edit-calender-dialog.component.scss']
})
export class EditCalenderDialogComponent implements OnInit {
  public form:FormGroup;
  @Output() emitService = new EventEmitter();
  deleteEvent: any;
  recurrentEvent:any;

  
  constructor(private activeModal: NgbActiveModal,
    fb: FormBuilder) { 
      this.form = fb.group({
        editcalenderevent: ['', Validators.required]
      });
    }

  ngOnInit() {
    this.deleteEvent = localStorage.getItem('delevent');
    this.recurrentEvent = localStorage.getItem('repeat_interval');
    //console.log('dialog recurrentEvent', this.recurrentEvent)
    // console.log('dialog deleteEvent', this.deleteEvent)
  }

  public cancel() {
    this.activeModal.close('');
    localStorage.removeItem('delevent')
    localStorage.removeItem('delevent')
    // localStorage.removeItem('recurrOk')
  }

  public submit() {
    // if (this.form.value.editcalenderevent === "forward") {
    //   this.form.controls['editcalenderevent'].setValue('');
    // }
    this.emitService.next(this.form.value);
    this.activeModal.close('');
    let okay = 'okay';
    localStorage.setItem('recurrOk', okay);
    localStorage.removeItem('delevent')
    localStorage.removeItem('repeat_interval')
  }
}
