import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { EmailService } from '../email/email.service';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss']
})
export class DocumentComponent implements OnInit {
  docCategory: any;
  isDisplay: any = true;
  isHeader: boolean = false;
  activeParentBtn: any;
  activeChildBtn: any;
  product = environment.product;
  isFromEmail:boolean=false;
  role:any;
  filter: any;

  constructor(private httpservice: HttpService, private router: Router, private aroute: ActivatedRoute,
    private emailService:EmailService) {
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        //console.log("val " + val);
        if (val.urlAfterRedirects.indexOf('/view') > -1 || val.urlAfterRedirects.indexOf('/upload') > -1 || val.urlAfterRedirects.indexOf('/mergepdf') > -1) {
          this.isHeader = true;
        } else {
          this.isHeader = false;
        }
        this.activeParentBtn = window.location.pathname.split("/").splice(-2)[0];
        this.activeChildBtn=window.location.pathname.split("/").splice(-2)[1];
        this.getButtonActive(this.activeParentBtn);
        this.getButton(this.activeChildBtn);
      }
    });
  }

  ngOnInit(): void {
    let userAgent = navigator.userAgent;
    this.emailService.emailObservable.subscribe((result: any) => {
      if (result==true) {
        this.isFromEmail=result;
      }
      if(window.location.href.indexOf('upload')>-1)
      this.isFromEmail=false;
    });
    this.role = localStorage.getItem("role")

  }
  onActivate(event:any) {
    // window.scroll(0,0);
 
    window.scroll({ 
            top: 0, 
            left: 0, 
            behavior: 'smooth' 
     });
    }
  getButtonActive(buttonName: any) {
    // //console.log("docOption buttonName " + buttonName);
    this.docCategory = buttonName;

    let categoryList = Array.from(document.getElementsByClassName('docOption'))
    // //console.log("Hello ", categoryList);
    for (let i = 0; i < categoryList.length; i++) {
      if (categoryList[i].classList.contains(buttonName)) {
        categoryList[i].classList.add('active');
      } else {
        categoryList[i].classList.remove('active');
      }
    }
  }
  getButton(buttonName: any) {
    // //console.log("  details buttonName " + buttonName);
    const categoryList = document.getElementsByClassName("details");
    for (let i = 0; i < categoryList.length; i++) {
      if (categoryList[i].classList.contains(buttonName)) {
        categoryList[i].classList.add('active');
      } else {
        categoryList[i].classList.remove('active');
      }
    }
  }
  hideAndShow() {
    this.isDisplay = !this.isDisplay;
  }
  gotoDetail(item: any): void {
    // console.log('item',item)
    // console.log('docCategory',this.docCategory)
    this.router.navigate(['documents/' + this.docCategory, item]);
    localStorage.setItem('filter', item);
    // if(item === 'client'){
    //   const link='/documents/mergepdf/'+ item
    //   window.location.href = link
    // }
  }
  ngAfterViewInit() {

  }
  ngAfterContentChecked(){
    this.getButtonActive(this.activeParentBtn);
    this.getButton(this.activeChildBtn);
  }
  reload(){
    let filter = window.location.pathname.split("/").splice(-2)[1];
    //console.log('fil',filter)
    // this.filter = localStorage.getItem('filter');
    // if(this.filter ==='login' || this.filter === undefined){
    //   this.filter = 'client';
    //   this.filter = localStorage.setItem('filter',filter);
    // }
    if(filter === 'delete'){
      const delink = 'documents/mergepdf/client';
      window.location.href = delink;
      return 
    }
    const link = 'documents/mergepdf/' + filter;
    window.location.href = link;
  }
  reupload(){
    let filter = window.location.pathname.split("/").splice(-2)[1];
    const link = 'documents/upload/' + filter;
    window.location.href = link;
  }
  
}
