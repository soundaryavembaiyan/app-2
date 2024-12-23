import { Router } from '@angular/router';
import { HttpService } from './../../../services/http.service';
import { ConfirmationDialogService } from './../../../confirmation-dialog/confirmation-dialog.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { URLUtils } from 'src/app/urlUtils';
import { DatePipe } from '@angular/common';
import { CalenderService } from '../../calender.service';
import { environment } from 'src/environments/environment';
import { EditCalenderDialogService } from './../../../edit-calender-options/edit-calender-dialog.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-overhead-calender',
  templateUrl: './overhead-calender.component.html',
  styleUrls: ['./overhead-calender.component.scss']
})
export class OverheadCalenderComponent implements OnInit {
  
  @Output() submitted = new EventEmitter();
  tasks: any = ["Conference", "Holidays", "Research", "Training", "Vacation"];
  timeZones: any = [];
  repetition: any = [
    { name: "Daily", value: "daily" },
    { name: "Weekly", value: "weekly" },
    { name: "Bi-Weekly", value: "biweekly" },
    { name: "Monthly", value: "monthly" },
    { name: "Yearly", value: "yearly" },
  ];
  pipe = new DatePipe('en-US');
  bsValue = new Date();
  //bsValue!: Date 
  FromTime: any;
  ToTime: any;
  notificationItems: any = [];
  tmsList: any = [];
  selectedTeammembers: any = [];
  clientsList: any = [];
  selectedClients: any = [];
  isSubmitted = false;
  minDate = new Date();
  entityList: any = [];
  entitycorpList: any = [];
  selectedHours: any;
  selectedMinutes: any;
  increaseTodate: boolean = false;
  displayDuration: boolean = true;
  displayEndTime:any;
  public hrs: any = [];
  public tohrs: any = [];
  public ToSelectedQuantity: any;
  public mins = ['00', '15', '30', '45'];
  public selectedQuantity: any;
  product = environment.product;
  public editInfo: any = undefined;
  isValidNotification:boolean=false;
  display:boolean=false;
  showTime = true;
  selectedconsumer: any = [];
  conlist: any[]=[];

  corpList: any = [];
  selectedCorp:any =[];
  clientcorpList:any = [];
  isEditPage = false;

  constructor(
    private httpservice: HttpService,
    public fb: FormBuilder,private datePipe: DatePipe,
    private confirmationDialogService: ConfirmationDialogService,
    private toast: ToastrService, 
    private router: Router, private calenderService: CalenderService,
    private editCalenderDialogService: EditCalenderDialogService,) { }

  ngOnInit() {
    this.setTimes();
    if (window.location.pathname.indexOf("edit") > -1) {
      this.isEditPage = true;
      this.calenderService.editCalenderObservable.subscribe((result: any) => {
        if (result && result.event_type == 'overhead') {
          this.editInfo = result;
          this.CalenderForm.patchValue(result);
          // Set visibility based on repeat_interval
          if (this.editInfo.repeat_interval && this.editInfo.repeat_interval !== '') {
            this.CalenderForm.controls['addtimesheet'].setValue(false);
          }

          // dynamically hide or show "Add to Timesheet"
          this.CalenderForm.get('repeat_interval')?.valueChanges.subscribe(value => {
            if (value !== '') {
              this.CalenderForm.controls['addtimesheet'].setValue(false); // Hide in case of selected repetition
            } else {
              this.CalenderForm.controls['addtimesheet'].setValue(true); // Show if "None" is selected
            }
          });
          this.notificationItems = this.editInfo.notifications.map((obj: any) => ({ time: obj.split("-")[0], type: obj.split("-")[1] }));
          this.CalenderForm.controls["date"].setValue(new Date(this.editInfo.from_ts.split('T')[0]));
          this.CalenderForm.controls['from_ts'].setValue(this.editInfo.from_ts.split("T")[1].split(":")[0]+':'+this.editInfo.from_ts.split("T")[1].split(":")[1]);
          this.selectedQuantity = this.editInfo.from_ts.split("T")[1].split(":")[0]+':'+this.editInfo.from_ts.split("T")[1].split(":")[1];
          this.CalenderForm.controls['to_ts'].setValue(this.editInfo.to_ts.split("T")[1].split(":")[0]+':'+this.editInfo.to_ts.split("T")[1].split(":")[1]);
          this.ToSelectedQuantity = this.editInfo.to_ts.split("T")[1].split(":")[0]+':'+this.editInfo.to_ts.split("T")[1].split(":")[1];

          this.CalenderForm.controls['invitees_internal'].setValue('');
          this.CalenderForm.controls['invitees_consumer_external'].setValue('');
          this.CalenderForm.controls['invitees_external'].setValue('');
          this.CalenderForm.controls['invitees_corporate'].setValue('');
          this.selectedconsumer = this.editInfo.invitees_consumer_external.map((item: any) => ({ "id": item.entityId, "name": item.tmName, "type": "consumer" }))
          this.selectedTeammembers = this.editInfo.invitees_internal;
          this.selectedClients = this.editInfo.invitees_external;
          this.selectedCorp = this.editInfo.invitees_corporate;
          this.selectedClients = this.selectedClients.map((item: any) => ({ "id": item.tmId, "name": item.tmName, "entityid": item.entityId }));
          this.selectedCorp = this.selectedCorp.map((item: any) => ({ "id": item.tmId, "name": item.tmName, "entityid": item.entityId}));
          this.getTimeZones();
          // this.addNotification();
          this.getTms();
          this.getEntities();
          if (this.editInfo.allday) {
            this.allDay({target: {checked: true}});
          } else {
            this.diff(this.selectedQuantity, this.ToSelectedQuantity)
          }
        }
      });
    }
    else {
      this.getTimeZones();
      this.addNotification();
      this.getTms();
      this.getEntities();
    }
  }
  CalenderForm = this.fb.group({
    date: [new Date(), Validators.required],
    from_ts: ['', Validators.required],
    to_ts: ['', Validators.required],
    title: ['', Validators.required],
    timezone_location: ['', Validators.required],
    timezone_offset: [0],
    allday: [false],
    repeat_interval: [''],
    meeting_link: [''],
    location: [''],
    dialin: [''],
    description: [''],
    event_type: ['overhead'],
    invitees_external: [''],
    invitees_corporate: [''],
    invitees_consumer_external: [''],
    invitees_internal: [''],
    notifications: [''],
    timesheets: this.fb.array([]),
    addtimesheet: [true],
    recurrent_edit_choice: null
  })
  // shouldHideAddToTimesheet() {
  //   const repeatInterval = this.CalenderForm.get('repeat_interval')?.value;
  //   return repeatInterval && repeatInterval !== '';
  // }
  shouldHideAddToTimesheet(): boolean {
    const repeatInterval = this.CalenderForm.get('repeat_interval')?.value;
    if (repeatInterval && repeatInterval !== '') {
      this.CalenderForm.controls['addtimesheet'].setValue(false); // Set value
      return true; // Indicate that add to timesheet should be hidden
    }
    return false; // Otherwise, do not hide
  }
  
  onChangeMatter(event:any){
    if (!this.editInfo){
      this.selectedClients = []
      this.clientsList = []
      //this.corpList = []
      this.selectedTeammembers = []
      this.selectedconsumer = []
      this.displayDuration = true
      this.showTime = true
      //this.setTimes()
      this.notificationItems = []
      this.notificationItems.push({ time: "10", type: "minutes" });
      this.CalenderForm.patchValue({
      //repeat_interval: 'none',
      meeting_link: '',
      dialin: '',
      date: new Date(),
      description: '',
      location: '',
      allday: false
    });
    }

  }
  setTimes() {
    this.hrsData();
    var coeff = 1000 * 60 * 15;
    var date = new Date(); //or use any other date	
    var rounded = new Date(Math.round(date.getTime() / coeff) * coeff);
    this.selectedQuantity = rounded.getHours() + ':' + rounded.getMinutes();
    this.selectedQuantity = this.addMinutesToTime(this.selectedQuantity, 0);
    this.CalenderForm.controls['from_ts'].setValue(this.selectedQuantity);
    this.ToSelectedQuantity = this.addMinutesToTime(this.selectedQuantity, 30);
    this.CalenderForm.controls['to_ts'].setValue(this.ToSelectedQuantity);
    this.diff(this.selectedQuantity, this.ToSelectedQuantity);
    //console.log('from',this.selectedQuantity)
    //console.log('to',this.ToSelectedQuantity)
  }

  get f() {
    return this.CalenderForm.controls;
  }
  getTimeZones() {
    var timezoneOffset = new Date().getTimezoneOffset();
    this.httpservice.sendGetRequest(URLUtils.getTimeZones).subscribe((res: any) => {
      this.timeZones = res?.timezones;
      for (let i = 0; i < this.timeZones.length; i++) {
        if (this.editInfo?(this.timeZones[i][1]==this.editInfo.timezone_location):((0 - Number(this.timeZones[i][0])) == timezoneOffset)) {
          let timeZoneArr = [];
          for (let j = 0; j < this.timeZones[i].length; j++) {
            timeZoneArr.push(this.timeZones[i][j]);
          }
          this.CalenderForm.controls['timezone_location'].setValue(timeZoneArr.toString());
          break;
        }
      }
    });
  }
  getTms() {
    this.httpservice.sendGetRequest(URLUtils.getCalenderTms).subscribe((res: any) => {
      this.tmsList = [];
      this.tmsList = res?.users;
      if (this.selectedTeammembers.length > 0) {
        this.tmsList = this.tmsList.filter((el: any) => {
          return !this.selectedTeammembers.find((element: any) => {
            return element.id === el.id;
          });
        });
      }
    })
  }
  getEntities() {

    if(this.product!='corporate'){
      this.httpservice.getFeaturesdata(URLUtils.getRelationship).subscribe((res: any) => {
        this.entityList = [];
        this.entityList = res?.data?.relationships.filter((rel:any) => rel.type === 'entity');
        this.conlist = res?.data?.relationships.filter((rel:any) => rel.type === 'consumer');
        if (this.selectedconsumer.length > 0) {
          this.conlist = this.conlist.filter((el: any) => {
            return !this.selectedconsumer.find((element: any) => {
              return element.id === el.id;
            });
          });
        }
      })

    }
    if(this.product == 'lauditor'){
      this.httpservice.getFeaturesdata(URLUtils.getCalenderExternal).subscribe((res: any) => {
        //this.corpList = res?.corporate;
        this.corpList = [];
        this.corpList = res?.relationships;
        //console.log('corpList',this.corpList)
    })
    } 
    if(this.product == 'corporate'){
      this.httpservice.getFeaturesdata(URLUtils.getCalenderExternal).subscribe((res: any) => {
        this.entityList = []; 
        this.entityList = res?.relationships?.filter((rel:any) => rel.type === 'entity');
        console.log(this.entityList)
      })

    }
    

  }

  getClients(id: any) {
    this.httpservice.sendGetRequest(URLUtils.getEntityTms(id)).subscribe((res: any) => {
      this.clientsList = [];
      this.clientsList = res?.users;
      this.clientsList.map((item: any) => item.entityid = id);
      if (this.selectedClients.length > 0) {
        this.clientsList = this.clientsList.filter((el: any) => {
          return !this.selectedClients.find((element: any) => {
            return element.id === el.id;
          });
        });
      }
    })
  }

  getCorpClients(id: any) {
    this.httpservice.sendGetRequest(URLUtils.getEntityTms(id)).subscribe((res: any) => {
      this.clientcorpList = [];
      this.clientcorpList = res?.users;
      this.clientcorpList.map((item: any) => item.entityid = id);
      if (this.selectedCorp.length > 0) {
        this.clientcorpList = this.clientcorpList.filter((el: any) => {
          return !this.selectedCorp.find((element: any) => {
            return element.id === el.id;
          });
        });
      }
      console.log(this.clientcorpList)
    })
  }
  
  addMinutesToTime(time: any, minsAdd: any) {
    function z(n: any) {
      return (n < 10 ? '0' : '') + n;
    }
    var bits = time.split(':');
    var mins = bits[0] * 60 + +bits[1] + +minsAdd;
    return z(((mins % (24 * 60)) / 60) | 0) + ':' + z(mins % 60);
  }
  removeColon(s: any) {
    s = s.replace(':', '');
    return parseInt(s);
  }
  // diff(s1: any, s2: any) {
  //   this.increaseTodate = false;
  //   this.displayDuration = true;
  //   let fromDate = new Date();
  //   let time1 = this.removeColon(s1);
  //   let time2 = this.removeColon(s2);
  //   if (time2 < time1) {
  //     this.increaseTodate = true;
  //     this.displayDuration = false;
  //   }
  //   let hourDiff = time2 / 100 - time1 / 100;
  //   if (time2 % 100 >= time1 % 100) hourDiff = hourDiff - 1;
  //   let minDiff = (time2 % 100) + (60 - (time1 % 100));
  //   if (minDiff >= 60) {
  //     hourDiff++;
  //     minDiff = minDiff - 60;
  //   }
  //   var res = hourDiff.toString().split('.')[0] + ':' + minDiff.toString();
  //   this.selectedHours = hourDiff.toString().split('.')[0];
  //   this.selectedMinutes = minDiff.toString();
  //   return res;
  // }
  diff(s1: any, s2: any) {
    this.increaseTodate = false;
    this.displayDuration = true;

    // Parse start and end times
    const [startHours, startMinutes] = s1.split(':').map(Number);
    const [endHours, endMinutes] = s2.split(':').map(Number);

    let fromDate = new Date();
    let toDate = new Date();

    fromDate.setHours(startHours, startMinutes, 0, 0);
    toDate.setHours(endHours, endMinutes, 0, 0);

    // Adjust for times that cross midnight
    if (toDate < fromDate) {
      toDate.setDate(toDate.getDate() + 1);
    }

    // Calculate the difference in milliseconds
    const diffMs = toDate.getTime() - fromDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    // Set values to display
    this.selectedHours = diffHours.toString();
    this.selectedMinutes = diffMinutes.toString();
    return `${diffHours} : ${diffMinutes}`; // Return formatted duration
  }  

  hrsData() {
    for (let i = 0; i <= 23; i++) {
      this.mins.forEach((minute) => {
        if (i <= 9) {
          let a = '0' + i;
          let str = `${a}:${minute}`;
          this.hrs.push(str);
        } else {
          let str = `${i}:${minute}`;
          this.hrs.push(str);
        }
      });
    }
    for (let i = 0; i <= 23; i++) {
      this.mins.forEach((minute) => {
        if (i <= 9) {
          let b = '0' + i;
          let str = `${b}:${minute}`;
          this.tohrs.push(str);
        } else {
          let str = `${i}:${minute}`;
          this.tohrs.push(str);
        }
      });
    }
  }
  // getTime(event: any) {
  //   this.selectedQuantity = event.target.value;
  //   this.ToSelectedQuantity = this.addMinutesToTime(this.selectedQuantity, 30);
  //   this.CalenderForm.controls['to_ts'].setValue(this.ToSelectedQuantity);
  //   //console.log(this.diff(this.selectedQuantity, this.ToSelectedQuantity));
  //   if(this.selectedQuantity){
  //     this.displayEndTime=this.tohrs.filter((x: number)=>{
  //       return x > this.selectedQuantity;
  //     });
  //     this.tohrs=this.displayEndTime;
  //    // console.log("aaaaaaaaa ",this.tohrs);
  //   }

  //   if( this.display==true){

  //         this.tohrs=this.hrs;
  //        // console.log("bbbbbbbbb ", this.tohrs);
  //         if(this.selectedQuantity){
  //           this.displayEndTime=this.tohrs.filter((x: number)=>{
  //             return x > this.selectedQuantity;
  //           });
  //           this.tohrs=this.displayEndTime;
  //          // console.log("aaaaaaaaa ",this.tohrs);
  //         } 
  //   }
  // }
  getTime(event: any) {
    this.selectedQuantity = event.target.value;
    this.ToSelectedQuantity = this.addMinutesToTime(this.selectedQuantity, 30);// Add 30 minutes to selected time
    this.CalenderForm.controls['to_ts'].setValue(this.ToSelectedQuantity);// Update the form control with the new end time
  
    // Filter to ensure only valid end times (times after the selected start time)
    this.displayEndTime = this.hrs.filter((x: string) => {
      return this.compareTimes(x, this.selectedQuantity) > 0; // Keep only times after the selected start time
    });    
    // Ensure 12:00 AM is added when start time is close to midnight
    if (this.selectedQuantity === '23:45' && !this.displayEndTime.includes('00:00')) {
        this.displayEndTime.push('00:00'); // 12:00 AM in 24-hour format
    }
    this.tohrs = this.displayEndTime;
  }

  compareTimes(time1: string, time2: string): number {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);
    
    const date1 = new Date();
    const date2 = new Date();
    // // Handle times across midnight by adding one day if needed
    // if (hours1 < hours2 || (hours1 === hours2 && minutes1 < minutes2)) {
    //   // If time1 is technically on the next day
    //   date1.setDate(date1.getDate() + 1);
    // }
    // date1.setHours(hours1, minutes1);
    // date2.setHours(hours2, minutes2);
        
    // Adjust date if time1 is technically the next day (crosses midnight)
    if (hours1 < hours2 || (hours1 === hours2 && minutes1 < minutes2)) {
      date1.setDate(date1.getDate() + 1); // Increment day for date1
    }
    date1.setHours(hours1, minutes1, 0, 0);
    date2.setHours(hours2, minutes2, 0, 0);
    
    return date1.getTime() - date2.getTime(); // Return difference in milliseconds
  }
  
  // togetTime(event: any) {
  //   this.display=true;
  //   this.ToSelectedQuantity = event.target.value;
  //   this.diff(this.selectedQuantity, this.ToSelectedQuantity);
  //   //console.log(this.diff(this.selectedQuantity, this.ToSelectedQuantity));
  // }
  togetTime(event: any) {
    this.ToSelectedQuantity = event.target.value;
    
    // Validate end time against start time
    if (this.compareTimes(this.ToSelectedQuantity, this.selectedQuantity) <= 0) {
      // If end time is invalid (earlier or equal to start time), reset it
      this.ToSelectedQuantity = this.addMinutesToTime(this.selectedQuantity, 30);
      this.CalenderForm.controls['to_ts'].setValue(this.ToSelectedQuantity);
    } else {
      this.CalenderForm.controls['to_ts'].setValue(this.ToSelectedQuantity);
    }
    this.diff(this.selectedQuantity, this.ToSelectedQuantity);
  }
  
  formatTime24to12(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const suffix = hours >= 12 ? 'pm' : 'am';
    const hour12 = hours % 12 || 12;
    const formattedTime = hour12 + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + suffix;
    return formattedTime;
  }
  
  allDay(event: any) {
    //console.log(event.target.checked);
    if(event.target.checked){
      this.showTime = false
      this.displayDuration = false
    }  else {
      this.setTimes()
      this.displayDuration = true
      this.showTime = true
    }
    
  }
  selectDuration(date: any) {
    this.bsValue = date;
  }
  
  addNotification() {
    //console.log(this.notificationItems);
    // if (!this.editInfo)
    this.notificationItems.push({ time: "10", type: "minutes" });
    this.isEditPage = false;
  }
  removeNotification(i: number) {
    this.notificationItems.splice(i, 1);
    this.isEditPage = false;
  }
  onOptionsSelected(event: any, index: number) {
    var value = event.target.value
    this.notificationItems[index]['type'] = value
    if (this.notificationItems[index]['time'] == "") {
      //$('#' + index + "_notificationTime").text("This field is required")
    }
    else {
      $('#' + index + "_notificationTime").text("")
      this.ChangeNotificationValidation(this.notificationItems[index]['time'], value, index)
    }
  }
  onKey(event: any, index: any, type: any) {
    this.isEditPage = false;
    let value = event.target.value
    value = value.replace(/[^0-9]/g, '');// Remove non-numeric characters
    this.notificationItems[index][type] = value;
    event.target.value = value;

    if (value == "") {
      //$('#' + index + "_notificationTime").text("This field is required")
      $('#' + index + "_notificationTime").text("");
      this.notificationItems[index].time = "";
    }
    else {
      $('#' + index + "_notificationTime").text("")
      this.ChangeNotificationValidation(value, this.notificationItems[index]['type'], index)
    }
  }
  ChangeNotificationValidation(value: any, type: any, index: any) {
    this.isValidNotification = false; 
    if (type == 'minutes') {
      if (Number(value) < 1 || Number(value) > 60) {
        this.isValidNotification=true;
        $('#' + index + "_notificationTime").text("Must be between 1 to 60 minutes")
      }

    }
    else if (type == 'hours') {
      if (Number(value) < 1 || Number(value) > 24) {
        this.isValidNotification=true;
        $('#' + index + "_notificationTime").text("Must be between 1 to 24 Hours")
      }

    }
    else if (type == 'days') {
      if (Number(value) < 1 || Number(value) > 31) {
        this.isValidNotification=true;
        $('#' + index + "_notificationTime").text("Must be between 1 to 31 Days")
      }

    }
    else if (type == 'weeks') {
      if (Number(value) < 1 || Number(value) > 4) {
        this.isValidNotification=true;
        $('#' + index + "_notificationTime").text("Must be between 1 to 4 Weeks")
      }
    }
  }

  addTeamMember() {
    // let tm = this.tmsList.find((d: any) => d.name === this.CalenderForm.value.invitees_internal); //find index in your array
    // this.selectedTeammembers.push(tm);
    // let index = this.tmsList.findIndex((d: any) => d.id === tm.id); //find index in your array
    // this.tmsList.splice(index, 1);
    // this.CalenderForm.controls['invitees_internal'].setValue('');

    let tm = this.tmsList?.find((d: any) => d.name === this.CalenderForm.value.invitees_internal); //find index in your array
    if (tm) {
      this.selectedTeammembers?.push(tm);
      let index = this.tmsList?.findIndex((d: any) => d.id === tm.id); //find index in your array
      if (index > -1) {
        this.tmsList?.splice(index, 1);
        this.CalenderForm.controls['invitees_internal'].setValue('');
      }
    } 

  }
  removeTeamMember(teamMember: any) {
    let index = this.selectedTeammembers.findIndex((d: any) => d.id === teamMember.id); //find index in your array
    this.selectedTeammembers.splice(index, 1);
    this.tmsList.push(teamMember);
    this.isEditPage = false;
  }
  onChangeEntity(event: any) {
    //console.log(event.target.value);
    this.getClients(event.target.value)
  }

  onChangeCorp(event: any) {
    // console.log("ss",event.target.value);
    this.getCorpClients(event.target.value)
  }
  addClient() {
    let client = this.clientsList.find((d: any) => d.name === this.CalenderForm.value.invitees_external); //find index in your array
    if(client){
    this.selectedClients.push(client);
    let index = this.clientsList.findIndex((d: any) => d.id === client.id); //find index in your array
    if (index > -1) {
    this.clientsList.splice(index, 1);
    this.CalenderForm.controls['invitees_external'].setValue('');
    }
  }
  }

  addCorp() {
    let client = this.clientcorpList.find((d: any) => d.name === this.CalenderForm.value.invitees_corporate); //find index in your array
    if(client){
    this.selectedCorp.push(client);
    let index = this.clientcorpList.findIndex((d: any) => d.id === client.id); //find index in your array
    if (index > -1) {
      this.clientcorpList.splice(index, 1);
      this.CalenderForm.controls['invitees_corporate'].setValue('');
    }
    }
  }

  removeCorp(client: any) {
    let index = this.selectedCorp.findIndex((d: any) => d.id === client.id); //find index in your array
    this.selectedCorp.splice(index, 1);
    this.clientcorpList.push(client);
    this.isEditPage = false;
  }


  // addCorp() {
  //   console.log('ic',this.CalenderForm.value.invitees_corporate)
  //   //let client = this.corpList?.find((d: any) => d.name === this.CalenderForm.value.invitees_corporate); //find index in your array
  //   let client = this.CalenderForm.value.invitees_corporate;
  //   console.log('clie',client)
  //   this.selectedCorp.push(client);
  //   console.log('cc-client',client)
  //   console.log('selectedCorp',this.selectedCorp)

  //   let cli = this.corpList?.find((d: any) => d.name === this.CalenderForm.value.invitees_corporate); 
  //   let index = this.corpList.findIndex((d: any) => d.id === cli.id); 
  //   this.corpList.splice(index, 1);
  //   this.CalenderForm.controls['invitees_corporate'].setValue('');
  // }

  removeClient(client: any) {
    this.isEditPage = true;
    let index = this.selectedClients.findIndex((d: any) => d.id === client.id); //find index in your array
    this.selectedClients.splice(index, 1);
    this.clientsList.push(client);
    this.isEditPage = false;
  }


  addconsumerinvites() {
    // console.log('ii',this.CalenderForm.value.invitees_consumer_external)
    let con = this.conlist?.find((d: any) => d.name === this.CalenderForm.value.invitees_consumer_external)
    if (con){
     //console.log(con)
     this.selectedconsumer.push(con)
     let index = this.conlist?.findIndex((d:any) => d.id === con.id);
     if (index > -1) {
       this.conlist?.splice(index, 1);
       this.CalenderForm.controls['invitees_consumer_external'].setValue('');
      }
    }
 }
 removeconsumerinvite(con: any) {
   let index = this.selectedconsumer?.findIndex((d: any) => d.id === con.id); //find index in your array
   if (index > -1) {
     this.selectedconsumer?.splice(index, 1);
     this.conlist?.push(con);
   }
   this.isEditPage = false;
 }
  onSubmit() {
    this.isSubmitted = true;
    // if(this.isValidNotification){
    //   return;
    // }
    if (!this.CalenderForm.valid) {
      //console.log('error');
    } 
    else {
      if (this.CalenderForm.value.addtimesheet) {

        if(this.CalenderForm.value.allday){
          //let duration = { hours: 24, minutes: 0 }
          const duration = this.diff(this.CalenderForm.value.from_ts, this.CalenderForm.value.to_ts);
          let timesheets = [{
            'date': this.pipe.transform(this.CalenderForm.value.date, 'yyyy-MM-dd'),
            'duration':  duration,
            'eventtitle': this.CalenderForm?.value?.title,
            'matter_id': 'Overhead',
            'matter_type':'overhead',
            'addedby': localStorage.getItem('name'),
            'user_id': localStorage.getItem('user_id')
          }];
          this.CalenderForm.value.timesheets = timesheets;
        }
        else{
          let duration = this.diff(this.CalenderForm.value.from_ts, this.CalenderForm.value.to_ts);
          let timesheets = [{
            'date': this.pipe.transform(this.CalenderForm.value.date, 'yyyy-MM-dd'),
            'duration': duration,
            'eventtitle': this.CalenderForm?.value?.title,
            'matter_id': 'Overhead',
            'matter_type':'overhead',
            'addedby': localStorage.getItem('name'),
            'user_id': localStorage.getItem('user_id')
          }];
          this.CalenderForm.value.timesheets = timesheets;
        }
      }
      this.diff(this.CalenderForm?.value?.from_ts, this.CalenderForm?.value?.to_ts);
      let given_date = new Date();
      let new_date = given_date.setDate(given_date.getDate() + 1);

      if(this.CalenderForm.value.allday){
        this.CalenderForm.value.from_ts = this.pipe.transform(this.CalenderForm.value.date, 'yyyy-MM-dd') + "T00:00:00";
        this.CalenderForm.value.to_ts = this.pipe.transform(this.CalenderForm.value.date, 'yyyy-MM-dd') + "T23:59:59";       
      } else {
        this.CalenderForm.value.from_ts = this.pipe.transform(this.CalenderForm?.value?.date, 'yyyy-MM-dd') + 'T' + this.CalenderForm?.value?.from_ts + ':00';
        this.CalenderForm.value.to_ts = this.increaseTodate ? this.pipe.transform(new_date, 'yyyy-MM-dd') + 'T' + this.CalenderForm?.value?.to_ts + ':00' : this.pipe.transform(this.CalenderForm?.value?.date, 'yyyy-MM-dd') + 'T' + this.CalenderForm?.value?.to_ts + ':00';
      }

      // Ensure all notifications have default values if empty
      this.notificationItems = this.notificationItems.map((item: { time: any; type: any; }) => {
        // Handle empty time values
        if (!item.time || item.time.trim() === "") {
          // If the time is empty, keep the existing type but set default time
          if (item.type === "minutes") {
            return { time: "10", type: "minutes" };
          } else if (item.type === "hours") {
            return { time: "1", type: "hours" };
          } else if (item.type === "weeks") {
            return { time: "1", type: "weeks" };
          } else if (item.type === "days") {
            return { time: "1", type: "days" };
          }
        }
        // Handle specific cases for "-minutes", "-hours", "-weeks", and "-months"
        if (item.time.trim() === "-minutes") {
          return { time: "10", type: "minutes" };  // Default to 10-minutes
        }
        if (item.time.trim() === "-hours") {
          return { time: "1", type: "hours" };  // Default to 1-hour
        }
        if (item.time.trim() === "-weeks") {
          return { time: "1", type: "weeks" };  // Default to 1-week
        }
        if (item.time.trim() === "-days") {
          return { time: "1", type: "days" };  // Default to 1-month
        }

        return item;  // Return the item if no changes are needed
      });

      // Update notifications field in the form
      this.CalenderForm.value.notifications = this.notificationItems.map((item: { time: any; type: any; }) => `${item.time}-${item.type}`);
      // console.log('CalenderForm', this.CalenderForm);

      this.CalenderForm.value.timezone_offset = 0 - Number(this.CalenderForm?.value?.timezone_location?.split(',')[0]);
      this.CalenderForm.value.timezone_location = this.CalenderForm?.value?.timezone_location?.split(',')[1];
      this.CalenderForm.value.notifications = this.notificationItems.map((obj: any) => (obj.time + '-' + obj.type));
      this.CalenderForm.value.invitees_internal = this.selectedTeammembers.map((obj: any) => (obj.id));
      this.CalenderForm.value.invitees_external = this.selectedClients.map((obj: any) => (obj.entityid + '_' + obj.id));
      this.CalenderForm.value.invitees_corporate = this.selectedCorp.map((obj: any) => (obj.entityid + '_' + obj.id));
      this.CalenderForm.value.invitees_consumer_external = this.selectedconsumer.map((obj: any) => (obj.id));
      if(this.editInfo){    
        if (!this.CalenderForm.valid) {    
          return;    
        }   
        // this.editCalenderDialogService.open();    
        // this.editCalenderDialogService.editCalObservable.subscribe((data:any)=>{    
        //   if(data){    
        //   this.CalenderForm.value.recurrent_edit_choice = data;    
        //   this.httpservice.sendPutRequest(URLUtils.updateEvent({'eventId':this.editInfo?.id,'offset':this.editInfo?.timezone_offset}), this.CalenderForm.value).subscribe((res: any) => {    
        //     if (!res.error) {    
        //       this.confirmationDialogService.confirm('Success', 'Congratulations! You have successfully modified the event', false, 'View Changes', 'Cancel', true).then((confirmed) => {    
        //         this.editCalenderDialogService.editCalSubmitted.next(null);
        //         if (confirmed)    
        //           this.router.navigate(['/meetings/view']);    
        //         else    
        //           window.location.reload();    
        //       })    
        //     } else {    
        //       this.confirmationDialogService.confirm('Alert', res.msg, false, '', '', false, 'sm', false)    
        //     }    
        //   },
        //   (error: HttpErrorResponse) => {
        //     if (error.status === 401 || error.status === 403) {
        //       const errorMessage = error.error.msg || 'Unauthorized';
        //       this.toast.error(errorMessage);
        //       console.log(error);
        //     } 
        //   });    
        //   return;    
        // }    
        // });  
                
        const validIntervals = ['weekly', 'daily', 'biweekly', 'monthly', 'yearly'];
        //Event reccurring dialog       
        if (this.editInfo?.repeat_interval && validIntervals.includes(this.editInfo.repeat_interval.toLowerCase())) {
          this.editCalenderDialogService.open();
          this.editCalenderDialogService.editCalObservable.subscribe((data: any) => {
            if (data) {
              this.CalenderForm.value.recurrent_edit_choice = data;
              this.sendUpdateRequest(); // Proceed with update request
            }
          });
        } else {
          this.sendUpdateRequest(); // If repeat_interval is empty directly proceed with the update request
        }       
      }    
      else{
      this.httpservice.sendPostRequest(URLUtils.createEvent, this.CalenderForm.value).subscribe((res: any) => {
        if (!res.error) {
          this.confirmationDialogService.confirm('Success', 'Congratulations! You have successfully the created event',false, 'View Changes', 'Cancel', true).then((confirmed) => {
            if (confirmed)
              this.router.navigate(['/meetings/view']);
            else
              window.location.reload();
          })
        } else {
          this.confirmationDialogService.confirm('Alert', res.msg,false, '', '', false, 'sm', false)
        }
      },
      (error: HttpErrorResponse) => {
        if (error.status === 400 || error.status === 401 || error.status === 403) {
            let errorMessage = 'Unauthorized'; // Default message
            if (error.error.errors && error.error.errors.length > 0) {
              const firstError = error.error.errors[0];
              if (firstError.field === "to_ts") {
                errorMessage = "End time must be greater than Start time";
              } else {
                errorMessage = firstError.msg || errorMessage;
              }
            }
          this.toast.error(errorMessage);
        } 
      }
      )
    }
    }
  }

  sendUpdateRequest() {
    // const from = this.editInfo.from_ts.split("T")[0] + "T" + this.editInfo.from_ts.split("T")[1].split(":").slice(0, 2).join(":") + ":00";
    // const to = this.editInfo.to_ts.split("T")[0] + "T" + this.editInfo.to_ts.split("T")[1].split(":").slice(0, 2).join(":") + ":00";
    // this.CalenderForm.controls["from_ts"].setValue(this.editInfo.from_ts);
    // this.CalenderForm.controls["to_ts"].setValue(this.editInfo.to);
    // console.log('editInfo',this.editInfo) 
    // console.log('CalenderForm', this.CalenderForm.value)

    this.httpservice.sendPutRequest(
      URLUtils.updateEvent({ 'eventId': this.editInfo?.id, 'offset': this.editInfo?.timezone_offset }),
      this.CalenderForm.value
    ).subscribe(
      (res: any) => {
        // this.CalenderForm.controls['from_ts'].setValue(this.editInfo.from_ts.split("T")[1].split(":")[0]+':'+this.editInfo.from_ts.split("T")[1].split(":")[1]);
        // this.selectedQuantity = this.editInfo.from_ts.split("T")[1].split(":")[0]+':'+this.editInfo.from_ts.split("T")[1].split(":")[1];
        // this.CalenderForm.controls['to_ts'].setValue(this.editInfo.to_ts.split("T")[1].split(":")[0]+':'+this.editInfo.to_ts.split("T")[1].split(":")[1]);
        // this.ToSelectedQuantity = this.editInfo.to_ts.split("T")[1].split(":")[0]+':'+this.editInfo.to_ts.split("T")[1].split(":")[1];
        if (!res.error) {
          this.confirmationDialogService.confirm('Success', 'Congratulations! You have successfully modified the event', false, 'View Changes', 'Cancel', true)
            .then((confirmed) => {
              this.editCalenderDialogService.editCalSubmitted.next(null);
              if (confirmed) {
                this.router.navigate(['/meetings/view']);
              } else {
                window.location.reload();
              }
            });
        } else {
          this.confirmationDialogService.confirm('Alert', res.msg, false, '', '', false, 'sm', false);
        }
      },
      (error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          const errorMessage = error.error.msg || 'Unauthorized';
          this.toast.error(errorMessage);
        }
      }
    );
    return;
  }
  
  onReset(){
    this.CalenderForm.reset();
    this.router.navigate(['/meetings/view'])
    //this.isSubmitted = false;
  }
  restricttextSpace(event: any) {
    let inputValue: string = event.target.value;
    inputValue = inputValue.replace(/^\s+/, '');
    inputValue = inputValue.replace(/\s{2,}/g, ' ');
    event.target.value = inputValue;
  }
}
