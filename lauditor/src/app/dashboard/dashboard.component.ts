import { Component, OnChanges, AfterViewInit, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { HttpService } from '../services/http.service';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { URLUtils } from '../urlUtils';
declare var bootstrap: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnChanges, AfterViewInit {

  categoryName:  string = "Dashboard";
  name: string = "";
  role: string = "";
  roleId: string = "TM";
  product = environment.product;
  key:any;
  activeItemId: string | null = null;
  selectedItem: string | null = null;

  dateSet: any = new Date();
  day: any = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
  dateTime: any = this.dateSet.getHours();
  date: any = this.day[this.dateSet.getDate()];
  time = new Date();
  minute: any = this.dateSet.getMinutes();
  ampm: string = this.time.getHours() >= 12 ? 'PM' : 'AM';
  timer: any;
  isCardVisible = false;
  groups:any;
  profile:any;
  
  navItem = [
    {
      name: 'Firm Profile',
      roles: ['AAM'],
      id: 'firm profile', link: '/profile', image: 'assets/img/Firmprofile.svg', class: ''
      //id: 'firm Profile'
    },
    {
      name: 'Matters',
      roles: ['TM', 'GH', 'SU'],
      id: 'matters', link: '/matter/legalmatter/create', image: 'assets/img/Matters.svg', class: ''
    },
    {
      name: 'Documents',
      roles: ['TM', 'GH', 'SU'],
      id: 'documents', link: '/documents', image: 'assets/img/Document.svg', class: ''
    },
    {
      name: 'Doc Editor',
      roles: ['TM', 'GH', 'SU'],
      id: 'doc editor', link: '/doceditor', image: 'assets/img/docedi.svg', class: ''
    },
    {
      name: 'Relationships',
      roles: ['TM', 'GH', 'SU'],
      id: 'relationships',
      link: '/relationship/add/entity', image: 'assets/img/relationship.svg', class: ''
    },
    {
      name: 'Timesheets',
      roles: ['TM', 'GH', 'SU', 'AAM'],
      id: 'timesheets', link: '/timesheets', image: 'assets/img/timesheet.svg', class: ''
    },
    {
      name: 'Meetings',
      roles: ['TM', 'GH', 'SU', 'AAM'],
      id: 'meetings', link: '/meetings/create', image: 'assets/img/meeting.svg', class: ''
    },
    {
      name: 'Emails',
      roles: ['TM', 'GH', 'SU'],
      id: 'emails', link: '/emails', image: 'assets/img/email.svg', class: ''
    },
    {
      name: 'Messages',
      roles: ['TM', 'GH', 'SU', 'AAM'],
      id: 'messages', link: '/messages', image: 'assets/img/messages.svg', class: ''
    },
    // {
    //   name: 'Notes',
    //   roles: ['TM', 'GH', 'SU', 'AAM'],
    //   id: 'notes', link: '/notes', image: 'assets/img/notes.svg', class: ''
    // },
    {
      name: 'Notifications',
      roles: ['TM', 'GH', 'SU', 'AAM'],
      id: 'notifications', link: '/notifications', image: 'assets/img/notification.svg', class: ''
    },
    {
      name: 'Audit Trails',
      roles: ['GH', 'SU', 'AAM'],
      id: 'audit trails', link: '/audit', image: 'assets/img/audits.svg', class: ''
    },
    {
      name: 'Groups',
      roles: ['SU', 'AAM'],
      id: 'groups', link: '/groups', image: 'assets/img/total.svg', class: ''
    },
    {
      name: 'Invoices',
      roles: ['GH', 'SU', 'TM'],
      id: 'invoices', link: '/createinvoice', image: 'assets/img/invoice.svg', class: ''
    }
    // {
    //   name: 'Payments',
    //   roles: ['AAM', 'GH', 'SU', 'TM'],
    //   id: 'payments', link: '/payment', image: 'assets/img/invoice.svg', class: ''
    // }
  ]

  navCorporate = [
    {
      name: 'Firm Profile',
      roles: ['AAM'],
      id: 'firm profile', link: '/profile', image: 'assets/img/Firmprofile.svg', class: ''
    },
    {
      name: 'Matters',
      roles: ['TM', 'GH', 'SU'],
      id: 'matters', link: '/matter/legalmatter/create', image: 'assets/img/Matters.svg', class: ''
    },
    {
      name: 'Documents',
      roles: ['TM', 'GH', 'SU'],
      id: 'documents', link: '/documents/upload/firm', image: 'assets/img/Document.svg', class: ''
    },
    {
      name: 'Doc Editor',
      roles: ['TM', 'GH', 'SU'],
      id: 'doc editor', link: '/doceditor', image: 'assets/img/docedi.svg', class: ''
    },
    {
      name: 'Relationships',
      roles: ['TM', 'GH', 'SU'],
      id: 'relationships',
      link: '/relationship/add/corporate', image: 'assets/img/relationship.svg', class: ''
    },
    // {
    //   name: 'Timesheets',
    //   roles: ['TM', 'GH', 'SU', 'AAM'],
    //   id: 'timesheets', link: '/timesheets', image: 'assets/img/timesheet.svg', class: ''
    // },
    {
      name: 'Meetings',
      roles: ['TM', 'GH', 'SU', 'AAM'],
      id: 'meetings', link: '/meetings/create', image: 'assets/img/meeting.svg', class: ''
    },
    {
      name: 'Emails',
      roles: ['TM', 'GH', 'SU'],
      id: 'emails', link: '/emails', image: 'assets/img/email.svg', class: ''
    },
    {
      name: 'Messages',
      roles: ['TM', 'GH', 'SU', 'AAM'],
      id: 'messages', link: '/messages', image: 'assets/img/messages.svg', class: ''
    },

    {
      name: 'Notifications',
      roles: ['TM', 'GH', 'SU', 'AAM'],
      id: 'notifications', link: '/notifications', image: 'assets/img/notification.svg', class: ''
    },
    {
      name: 'Audit Trails',
      roles: ['GH', 'SU', 'AAM'],
      id: 'audit trails', link: '/audit', image: 'assets/img/audits.svg', class: ''
    },
    {
      name: 'Departments',
      roles: ['SU', 'AAM'],
      id: 'departments', link: '/groups', image: 'assets/img/total.svg', class: ''
    }
  ]

  navContent = [
    {
      name: 'Firm Profile',
      roles: ['AAM'],
      id: 'firm profile', link: '/profile', image: 'assets/img/Firmprofile.svg', class: ''
    },
    {
      name: 'Documents',
      roles: ['TM', 'GH', 'SU'],
      id: 'documents', link: '/documents', image: 'assets/img/Document.svg', class: ''
    },
    {
      name: 'Doc Editor',
      roles: ['TM', 'GH', 'SU'],
      id: 'doc editor', link: '/doceditor', image: 'assets/img/docedi.svg', class: ''
    },
    {
      name: 'Relationships',
      roles: ['TM', 'GH', 'SU'],
      id: 'relationships', link: '/relationship/add/entity', image: 'assets/img/relationship.svg', class: ''
    },
    {
      name: 'Meetings',
      roles: ['TM', 'GH', 'SU', 'AAM'],
      id: 'meetings', link: '/meetings/create', image: 'assets/img/meeting.svg', class: ''
    },
    {
      name: 'Emails',
      roles: ['SU', 'GH', 'TM'],
      id: 'emails', link: '/emails', image: 'assets/img/email.svg', class: ''
    },
    {
      name: 'Messages',
      roles: ['TM', 'GH', 'SU', 'AAM'],
      id: 'messages', link: '/messages', image: 'assets/img/messages.svg', class: ''
    },
    {
      name: 'Notifications',
      roles: ['TM', 'GH', 'SU', 'AAM'],
      id: 'notifications', link: '/notifications', image: 'assets/img/notification.svg', class: ''
    },
    {
      name: 'Audit Trails',
      roles: ['GH', 'SU', 'AAM'],
      id: 'audit trails', link: '/audit', image: 'assets/img/audits.svg', class: ''
    },
    {
      name: 'Groups',
      roles: ['AAM', 'SU'],
      id: 'groups', link: '/groups', image: 'assets/img/total.svg', class: ''
    },
  ]

//   {name:'Matters',
//    roles: ['TM', 'GH', 'SU'],
//    id:'matter',link:'/matter',image:'assets/img/Matters.svg',class:''},
//   {name:'Documents',
//    roles: ['TM', 'GH', 'SU'],
//    id:'document',link:'/document',image:'assets/img/Document.svg',class:''},
//   {name:'Relationship',
//    roles: ['TM', 'GH', 'SU'],
//    id:'relationship',
//    link:'/relationship/view/individuals',image:'assets/img/relationship.svg',class:''},
//   {name:'Timesheets',
//    roles: ['TM', 'GH', 'SU', 'AAM'],
//    id:'timesheet',link:'/timesheet',image:'assets/img/timesheet.svg',class:''},
//   {name:'Meetings',
//    roles: ['TM', 'GH', 'SU', 'AAM'],
//    id:'meetings',link:'/meetings',image:'assets/img/meeting.svg',class:''},
//   {name:'Emails',
//    roles: ['TM', 'GH', 'SU', 'AAM'],
//    id:'emails',link:'/emails',image:'assets/img/email.svg',class:''},
//   {name:'Messages',
//    roles: ['TM', 'GH', 'SU', 'AAM'],
//    id:'messages',link:'/messages',image:'assets/img/messages.svg',class:''},
//   // {name:'Notes',
//   //  roles: ['TM', 'GH', 'SU', 'AAM'],
//   //  id:'notes',link:'/notes',image:'assets/img/notes.svg',class:''},
//   {name:'Notification',
//    roles: ['TM', 'GH', 'SU', 'AAM'],
//    id:'notification',link:'/notification',image:'assets/img/notification.svg',class:''},
//   {name:'Audit Trails',
//    roles: ['GH', 'SU', 'AAM'],
//    id:'Audit',link:'/audit',image:'assets/img/audits.svg',class:''},
//   {name:'Groups',
//    roles: ['GH', 'SU', 'AAM'],
//    id:'groups',link:'/groups',image:'assets/img/total.svg',class:''}
// ]

  navConnect = [
    {
      name: 'Firm Profile',
      roles: ['AAM'],
      id: 'firm profile', link: '/profile', image: 'assets/img/Firmprofile.svg', class: ''
    },
    {
      name: 'Documents',
      roles: ['TM', 'GH', 'SU'],
      id: 'documents', link: '/documents', image: 'assets/img/Document.svg', class: ''
    },
    {
      name: 'Relationships',
      roles: ['TM', 'GH', 'SU'],
      id: 'relationships',
      link: '/relationship/view/business', image: 'assets/img/relationship.svg', class: ''
    },
    {
      name: 'Meetings',
      roles: ['TM', 'GH', 'SU', 'AAM'],
      id: 'meetings', link: '/meetings/create', image: 'assets/img/meeting.svg', class: ''
    },
    {
      name: 'Messages',
      roles: ['TM', 'GH', 'SU', 'AAM'],
      id: 'messages', link: '/messages', image: 'assets/img/messages.svg', class: ''
    },
    // {
    //   name: 'Notes',
    //   roles: ['TM', 'GH', 'SU'],
    //   id: 'notes', link: '/notes', image: 'assets/img/notes.svg', class: ''
    // },
    {
      name: 'Notifications',
      roles: ['TM', 'GH', 'SU', 'AAM'],
      id: 'notifications', link: '/notifications', image: 'assets/img/notification.svg', class: ''
    },
    {
      name: 'Audit Trails',
      roles: ['GH', 'SU', 'AAM'],
      id: 'audit trails', link: '/audit', image: 'assets/img/audits.svg', class: ''
    },
    {
      name: 'Groups',
      roles: ['AAM', 'SU'],
      id: 'groups', link: '/groups/view-group', image: 'assets/img/total.svg', class: ''
    }
  ]

  constructor(private router: Router, private httpService: HttpService,private route: ActivatedRoute,
    private httpClient: HttpClient,private cdr: ChangeDetectorRef) {
    
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        //console.log("windowLoc", window.location.pathname.split("/").splice(-4)[1]);
        //this.getCategory(window.location.pathname.split("/").splice(-4)[1]);
      }
    });
    
    // this.httpService.items.subscribe((newItem: any) => {
    //   this.getCategory(newItem);
    // });
  }
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.key = params['key'];
      if (params['key']) {
        console.log(params['key'])
        const jsonString = this.key?.replace(/^data=/, '');
        const jsonObject = JSON.parse(jsonString);
        console.log(jsonObject)
        this.getSOSlogin(jsonObject)
        this.initalize_roles()
      }
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const activeItem = this.navItem.find(item => this.router.url.includes(item.link));
        //console.log('activeItem',activeItem)
        if (activeItem) {
          this.categoryName = activeItem.name;
          //console.log('categoryName',this.categoryName)

          localStorage.setItem('categoryName', this.categoryName);
          localStorage.setItem('activeNavItem', activeItem.id);

          if (this.product === 'corporate' && activeItem.name === 'Groups') {
            this.categoryName = 'Departments'; // Change 'Groups' to 'Departments'
            activeItem.name = 'Departments';
            localStorage.setItem('categoryName', this.categoryName); // Update localStorage
            localStorage.setItem('activeNavItem', activeItem.id);
          }
        }
        // else {
        //   this.categoryName = 'Dashboard';
        // }
      }
    });

    // Set initial values from localStorage on load
    const storedCategoryName = localStorage.getItem('categoryName');
    if (storedCategoryName) {
      this.categoryName = storedCategoryName;
    }

    this.initalize_roles()
    // Clear the active item on initialization
    this.activeItemId = null;
    localStorage.removeItem('activeNavItem');
    //window.location.pathname == '/grid'

    this.updateTime();
    this.groups = JSON.parse(localStorage.getItem('user_groups') || '[]').join(' | ');
    //console.log('groups', this.groups);

    this.httpService.sendGetRequest(URLUtils.profile).subscribe(
      (res: any) => {
        console.log('res', res);
          this.profile = res.data?.details;
      }
    )

  }

  ngAfterViewInit(): void {
  //   const popoverTrigger = document.querySelector('.username') as HTMLElement;
  //   new bootstrap.Popover(popoverTrigger, {
  //     container: 'body',
  //     trigger: 'hover',
  //     html: true, // Allows HTML content in the popover
  //   });
  }

  initalize_roles(){
    var name = localStorage.getItem("name")
      if (name != null) { this.name = name }
      var role = localStorage.getItem("role")
      if (role != null) { this.roleId = role }
      if (role == 'SU') { this.role = 'SuperUser' }
      if (role == 'AAM') { this.role = 'Admin' }
      if (role == 'TM') { this.role = 'Team Member' }
      if (role == 'GH' && this.product == 'corporate') { this.role = 'Department Head' }
      if (role == 'GH' && this.product != 'corporate') { this.role = 'Group Head' }
  }

  getCategory(category: string): void {
    window.scrollTo(0, 0); 
    this.categoryName = category;
    //console.log("categoryName", this.categoryName);
    this.selectedItem = category; // Set the selected item
    localStorage.setItem('categoryName', this.categoryName);
    localStorage.setItem('activeNavItem', category);
    // const categoryList = document.getElementsByClassName("left-menu-icon");
    // for (let i = 0; i < categoryList.length; i++) {
    //   if (categoryList[i].classList.contains(category)) {
    //     categoryList[i].classList.add('active');
    //   } else {
    //     categoryList[i].classList.remove('active');
    //   }
    // }
  }

  isActive(itemId: string): boolean {
    return localStorage.getItem('activeNavItem') === itemId;
    // return this.activeItemId === itemId;
  }

  setActiveNavItem(category: string) {
    //console.log("settoGetcategoryName", this.categoryName);
    const categoryList = document.getElementsByClassName('left-menu-icon');
    for (let i = 0; i < categoryList.length; i++) {
      if (categoryList[i].classList.contains(category)) {
        categoryList[i].classList.add('active');
      } else {
        categoryList[i].classList.remove('active');
      }
    }
  }

  ngOnChanges() {
    // this.httpService.items.subscribe((newItem: any) => {
    //   this.getCategory(newItem);
    // });
  }

  logout() {
    // localStorage.removeItem('validationDone')
    // localStorage.removeItem('TOKEN')
    // localStorage.removeItem('popupOpened')
    // localStorage.removeItem('name')
    // localStorage.removeItem('role')
    this.router.navigate(['/'])
    localStorage.clear();
    window.location.reload();
  }
  getSOSlogin(resp:any){
    localStorage.setItem('TOKEN', resp['token'])
        localStorage.setItem('name', resp['data']['name'])
        localStorage.setItem('role', resp['data']['role'])
        localStorage.setItem('isadmin', resp['data']['admin'])
        localStorage.setItem('jid', resp['data']['uid'])
        localStorage.setItem('firm_name', resp['data']['firm_name'])

  }
  ngOnDestroy(){
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  updateTime(){
    this.timer = setInterval(() => {
      this.time = new Date();
      this.ampm = this.time.getHours() >= 12 ? 'PM' : 'AM';
    }, 1000); // Update every second
  }

  //   getButtonActive(buttonName:any){
  //     const categoryList=document.getElementsByClassName("left-menu-icon");
  //     //console.log("className  "+ JSON.stringify(categoryList));
  //     for(let i=0;i<categoryList.length;i++){
  //       if(categoryList[i].classList.contains(buttonName)){
  //         categoryList[i].classList.add('active');
  //         //console.log("className  "+ JSON.stringify( categoryList[i].classList));
  //       }else{
  //         categoryList[i].classList.remove('active');
  //         //console.log("className  "+ JSON.stringify( categoryList[i].classList));
  //       }
  //     }
  // }
}
