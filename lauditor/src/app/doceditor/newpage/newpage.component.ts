import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SaveasBoxComponent } from '../doceditor.component';
import { ModalService } from 'src/app/model/model.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-newpage',
  templateUrl: './newpage.component.html',
  styleUrls: ['./newpage.component.scss']
})
export class NewpageComponent {


  constructor(private router: Router, public dialog: MatDialog, private toast: ToastrService,
    private modalService: ModalService, public dialogRef: MatDialogRef<NewpageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { saveDocument: () => void }
  ) { }

  ngOnInit(): void {

  }
  onNoClick(): void {
    const link = `/doceditor`;
    window.location.href = link;
    this.dialogRef.close();
  }
  yes(): void {
    //this.dialogRef.close();
    if (this.data?.saveDocument) {
      this.data.saveDocument(); // Call the passed function
      this.dialogRef.close();
    }
  }
}