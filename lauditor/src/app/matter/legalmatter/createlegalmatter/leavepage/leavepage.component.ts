import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-leavepage',
  templateUrl: './leavepage.component.html',
  styleUrls: ['./leavepage.component.scss']
})
export class LeavepageComponent {
  constructor( private router: Router,
    public dialogRef: MatDialogRef<LeavepageComponent>
  ) { }

  ngOnInit(): void {

  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  leavePage(): void {
    this.router.navigate(['/matter/legalmatter/view']);
    this.dialogRef.close();
  }
}
