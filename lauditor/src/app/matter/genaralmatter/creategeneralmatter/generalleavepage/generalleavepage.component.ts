import { Component } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-generalleavepage',
  templateUrl: './generalleavepage.component.html',
  styleUrls: ['./generalleavepage.component.scss']
})
export class GeneralleavepageComponent {
  constructor( private router: Router,
    public dialogRef: MatDialogRef<GeneralleavepageComponent>
  ) { }

  ngOnInit(): void {

  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  leavePage(): void {
    this.router.navigate(['/matter/generalmatter/view']);
    this.dialogRef.close();
  }
}
