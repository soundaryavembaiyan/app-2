import { ConfirmationDialogService } from './../../confirmation-dialog/confirmation-dialog.service';
import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/services/http.service';
import { URLUtils } from 'src/app/urlUtils';
import { CalenderService } from '../calender.service';
import { ToastrService } from 'ngx-toastr';
import { Pipe } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ModalService } from 'src/app/model/model.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-viewevent',
  templateUrl: './viewevent.component.html',
  styleUrls: ['./viewevent.component.scss']
})
export class ViewEventComponent implements OnInit {
  data: any;
  pipe = new DatePipe('en-US');
  eventInfo: any;
  firstNotification: any = [];
  remainingNotications: any = [];
  scheduledDate: any;
  teamMembers: any = [];
  clients: any = [];
  OrganizerFirstLetter: any;
  selectedValue: string = 'Yes';
  viewDoc = true;
  //events = ['overhead','others','reminders'];
  events = ['legal', 'general'];
  expanded: boolean = false;
  product = environment.product;
  pdfSrc: any;
  docapi = environment.doc2pdf;
  repeat_interval:any;
  repetition=false;
  urlSafe: any;
  allowedFileTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/rtf','text/csv','text/rtf'];

  toggleContent(): void {
    this.expanded = !this.expanded;
  }

  constructor(private httpservice: HttpService, private router: Router, private toaster: ToastrService,private spinnerService: NgxSpinnerService,
    private calenderService: CalenderService, public sanitizer: DomSanitizer, private modalService: ModalService, private confirmationDialogService: ConfirmationDialogService) {
    this.data = this.router.getCurrentNavigation()?.extras.state;
  }
  ngOnInit() {
    if (this.data){
      this.getEventData();
    }
    //console.log('evInfo', this.eventInfo)
    //console.log('this.selectedValue',this.selectedValue)
  }
  getEventData() {
    this.httpservice.sendGetRequest(URLUtils.eventViewDetails(this.data)).subscribe(
      (res: any) => {
        if (res) {
          this.eventInfo = res.event;
          //console.log('evInfo', this.eventInfo)
         
          // Get user ID from localStorage
          const userId = localStorage.getItem('user_id');
          //console.log('userId',userId)

          // Consolidate all invitees into one list
          const allInvitees = [
            ...this.eventInfo.invitees_internal,
            ...this.eventInfo.invitees_external,
            ...this.eventInfo.invitees_consumer_external,
            ...this.eventInfo.invitees_corporate,
          ];

          // Find the user in the invitees list
          const user = allInvitees.find((invitee: any) => invitee.id === userId || invitee.tmId === userId);
          // console.log('get user',user)

          // If user is found, set selectedValue based on RSVP
          if (user && user.rsvp) {
            this.selectedValue = user.rsvp.charAt(0).toUpperCase() + user.rsvp.slice(1).toLowerCase();
          } else {
            this.selectedValue = 'Yes'; // Default value if no RSVP is found
          }
          //console.log('Selected RSVP:', this.selectedValue);

          for (let i = 0; i < this.events.length; i++) {
            if (i == this.eventInfo.matter_type) {
              this.viewDoc = false;
              break;
            }
            //console.log('viewDoc',this.viewDoc)
            //console.log('event_type',this.eventInfo.event_type)
          }

          if (this.eventInfo?.notifications && this.eventInfo?.notifications?.length > 0) {
            //this.firstNotification = this.eventInfo?.notifications[0];
            //this.remainingNotications = this.eventInfo?.notifications.slice(1, this.eventInfo?.notifications.length);
            this.firstNotification = this.eventInfo?.notifications[0]?.replace('-', ' ');
            this.remainingNotications = this.eventInfo?.notifications.slice(1).map((notification: string) => notification.replace('-', ' '));
          }
          this.OrganizerFirstLetter = this.eventInfo.owner_name.charAt(0)?.toUpperCase();
          //this.scheduledDate = this.eventInfo.allday ? new Date(this.eventInfo?.from_ts).toDateString() + ' : All Day' : new Date(this.eventInfo?.from_ts).toDateString() + ' : ' + this.pipe.transform(this.eventInfo?.from_ts, 'h:mm a') + ' - ' + this.pipe.transform(this.eventInfo?.to_ts, 'h:mm a');
          this.scheduledDate = this.eventInfo.allday 
          ? this.pipe.transform(this.eventInfo?.from_ts, 'EEEE, MMMM d yyyy') + ' : All Day' 
          : this.pipe.transform(this.eventInfo?.from_ts, 'EEEE, MMMM d yyyy') + ' : ' +
            this.pipe.transform(this.eventInfo?.from_ts, 'h:mm a') + ' - ' +
            this.pipe.transform(this.eventInfo?.to_ts, 'h:mm a');
          //console.log('date', this.scheduledDate);

          this.repeat_interval = this.eventInfo?.repeat_interval || '';
          this.repetition = !!this.repeat_interval;  // Set repetition to true only if repeat_interval is not empty
          //console.log('repeat_interval', this.repeat_interval);

          // let teamMembersList = this.eventInfo.invitees_internal.map((person: any) => ({ "name": person.name, "rsvp": person.rsvp }));
          // this.teamMembers = [];
          // //console.log('teamMembers',this.teamMembers)
          // if (teamMembersList && teamMembersList.length > 0) {
          //   for (let i = 0; i < teamMembersList.length; i++) {
          //     let teamMem = {
          //       firstChar: (teamMembersList[i].name.charAt(0))?.toUpperCase(),
          //       name: teamMembersList[i].name,
          //       rsvp: teamMembersList[i].rsvp
          //     };
          //     this.teamMembers.push(teamMem);
          //   }
          // }
          // let external = this.eventInfo.invitees_external.concat(this.eventInfo.invitees_consumer_external, this.eventInfo.invitees_corporate)
          // let clientsList = external.map((person: any) => ({ "entName": person.entityName, "tmName": person.tmName, "rsvp": person.rsvp, "tmId": person.tmId }));
          // this.clients = [];
          // //console.log('clients',this.clients)
          // if (clientsList && clientsList.length > 0) {
          //   for (let i = 0; i < clientsList.length; i++) {
          //     let x = this.clients.filter((val: any) => val.entName === clientsList[i].entName)
          //     let clientMem = {
          //       firstChar: (clientsList[i].tmName?.charAt(0))?.toUpperCase(),
          //       name: clientsList[i].tmName,
          //       rsvp: clientsList[i].rsvp,
          //       tmId: clientsList[i].tmId,
          //       entName: x.length > 0 ? '' : clientsList[i].entName,
          //       firstCharEntity: x.length > 0 ? '' : clientsList[i].entName?.charAt(0)?.toUpperCase(),
          //     };
          //     this.clients.push(clientMem);
          //   }
          // }
          // //console.log(this.clients)
          let teamMembersList = this.eventInfo.invitees_internal.map((person: any) => ({
            name: person.name,
            rsvp: person.rsvp ? person.rsvp.charAt(0).toUpperCase() + person.rsvp.slice(1).toLowerCase() : ""
          }));
          this.teamMembers = []; // Initialize the array
          if (teamMembersList && teamMembersList.length > 0) {
            for (let i = 0; i < teamMembersList.length; i++) {
              let teamMem = {
                firstChar: (teamMembersList[i].name.charAt(0))?.toUpperCase(),
                name: teamMembersList[i].name,
                rsvp: teamMembersList[i].rsvp
              };
              this.teamMembers.push(teamMem);
            }
          }

          let external = this.eventInfo.invitees_external.concat(
            this.eventInfo.invitees_consumer_external,
            this.eventInfo.invitees_corporate
          );
          let clientsList = external.map((person: any) => ({
            entName: person.entityName,
            tmName: person.tmName,
            rsvp: person.rsvp ? person.rsvp.charAt(0).toUpperCase() + person.rsvp.slice(1).toLowerCase() : "",
            tmId: person.tmId
          }));
          this.clients = [];
          if (clientsList && clientsList.length > 0) {
            for (let i = 0; i < clientsList.length; i++) {
              let x = this.clients.filter((val: any) => val.entName === clientsList[i].entName);
              let clientMem = {
                firstChar: (clientsList[i].tmName?.charAt(0))?.toUpperCase(),
                name: clientsList[i].tmName,
                rsvp: clientsList[i].rsvp,
                tmId: clientsList[i].tmId,
                entName: x.length > 0 ? '' : clientsList[i].entName,
                firstCharEntity: x.length > 0 ? '' : clientsList[i].entName?.charAt(0)?.toUpperCase(),
              };
              this.clients.push(clientMem);
            }
          }
        }
      });
  }

  onEdit() {
    this.calenderService.editEvent(this.eventInfo); //get the edit datas
    //console.log('EvInfo',this.eventInfo)
    this.router.navigate(['/meetings/edit'])
  }

  onDelete() {
    // console.log('eveInfo', this.eventInfo)
    // let name=localStorage.getItem('name');
    //if(this.eventInfo.owner_name === name){
    this.confirmationDialogService.confirm('Confirmation', 'Are you sure do you want to delete ' + this.eventInfo.title, true, 'Yes')
      .then((confirmed) => {
        if (confirmed) {
          this.httpservice.sendDeleteRequestwithObj(URLUtils.deleteEvent({ eventId: this.eventInfo.id }), { choice: "this" }).subscribe((res: any) => {
            //console.log("res" + res);
            this.router.navigate(['/meetings/view'])
          },
            (error: HttpErrorResponse) => {
              if (error.status === 401 || error.status === 403) {
                const errorMessage = error.error.msg || 'Unauthorized';
                this.toaster.error(errorMessage);
                //console.log(error);
              }
            }
          );
        }
      })
    //}
    // else{
    //   this.toaster.error('You are not authorized to delete this event.')
    //   return;
    // }
  }

  onClickAttending(val: string) {
    this.selectedValue = val;
    //console.log('this.selectedValue', this.selectedValue)
    this.httpservice.sendPutRequest(URLUtils.updateRSVP({ event_id: this.eventInfo.id }), { rsvp_response: this.selectedValue }).subscribe((res: any) => {
        this.toaster.success(res.msg);
    },
      (error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          const errorMessage = error.error.msg || 'Unauthorized';
          this.toaster.error(errorMessage);
          //console.log(error);
        }
      }
    );
  }


  openModal(id: string) {
    this.modalService.open(id);
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }
  viewDocument(item: any) {
    console.log('item',item)
    let id = { 'id': item.docid }
    this.httpservice.sendGetRequest(URLUtils.viewDocuments(id)).subscribe((res: any) => {
      if (res && res.data && !res.error) {
        this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(res.data.url);
        let obj = {
          'isIframe': true,
          'url': this.urlSafe
        }
        this.confirmationDialogService.confirm('View', obj, true, "Ok", "Close", false, "lg");
      }
    });
  }

//   viewApprovalDocument(item: any) {
//     //console.log('item', item)
//     this.pdfSrc = ''
//     let documentId: any = {
//         docid: item.id,
//         doctype: item.doctype
//     };
//     if (item.added_encryption) {
//         var body = new FormData();
//         body.append('docid', item.id)
//         let url = environment.apiUrl + URLUtils.decryptFile
//         this.spinnerService.show()
//         this.httpservice.sendPostDecryptRequest(url, body).subscribe((res: any) => {
//             const blob = new Blob([res], { type: item.content_type });
//             const url = URL.createObjectURL(blob);
//             if (this.allowedFileTypes.includes(item.content_type)) {
//                 let fdata = new FormData();
//                 fdata.append('file', blob);
//                 this.httpservice.sendPostDecryptRequest(environment.DOC2FILE, fdata).subscribe((ans: any) => {
//                     const ansBlob = new Blob([ans], { type: 'application/pdf' });
//                     const ansUrl = URL.createObjectURL(ansBlob);
//                     this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(ansUrl)
//                     this.spinnerService.hide()
//                 })
//             }
//             else {
//                 this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url)
//                 this.spinnerService.hide()
//             }
//             //console.log(this.pdfSrc)
//         })
//         this.spinnerService.hide()
//     }
//     if (item.added_encryption == false) {
//         this.httpservice.sendPostRequest(URLUtils.deleteApprovalView, documentId).subscribe((res: any) => {
//             if (this.allowedFileTypes.includes(item.content_type)) {
//                 this.spinnerService.show()
//                 this.httpservice.sendPostDocRequest(this.docapi, { 'url': res.data.url }).subscribe((ans: any) => {
//                     const blob = new Blob([ans], { type: 'application/pdf' });
//                     // Create a URL for the Blob
//                     const url = URL.createObjectURL(blob);
//                     this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url)
//                     this.spinnerService.hide()
//                 })
//             }
//             else {
//                 this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(res.data.url);
//             }
//         });
//         this.pdfSrc = item.filename;
//     }
// }

get(){

}

  // viewDocument(item: any) {
  //   console.log('item',item)
  //   if (item.added_encryption) {
  //     var body = new FormData();
  //     body.append('docid', item.docid)
  //     body.append('shared_doc', true.toString())
  //     let url = environment.apiUrl + URLUtils.decryptFile
  //     this.httpservice.sendPostDecryptRequest(url, body).subscribe((res: any) => {
  //       const blob = new Blob([res], { type: item.contentType });
  //       const url = URL.createObjectURL(blob);
  //       if (this.allowedFileTypes.includes(item.contentType)) {
  //         let fdata = new FormData();
  //         fdata.append('file', blob);
  //         this.httpservice.sendPostDecryptRequest(environment.DOC2FILE, fdata).subscribe((ans: any) => {
  //           const ansBlob = new Blob([ans], { type: 'application/pdf' });
  //           const ansUrl = URL.createObjectURL(ansBlob);
  //           this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(ansUrl)
  //           let obj = {
  //             'isIframe': true,
  //             'url': this.urlSafe
  //           }
  //           this.confirmationDialogService.confirm('View', obj, true, "Ok", "Close", false, "lg");
  //         })
  //       } else {
  //         this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  //         let obj = {
  //           'isIframe': true,
  //           'url': this.urlSafe
  //         }
  //         this.confirmationDialogService.confirm('View', obj, true, "Ok", "Close", false, "lg");
  //       }
  //     })
  //   }
  //   if (item.added_encryption == false) {
  //     let id = { 'id': item.docid }

  //     this.httpservice.sendGetRequest(URLUtils.viewDocuments(id)).subscribe((res: any) => {
  //       if (this.allowedFileTypes.includes(item.contentType)) {
  //         this.httpservice.sendPostDocRequest(this.docapi, { 'url': res.data.url }).subscribe((ans: any) => {
  //           const blob = new Blob([ans], { type: 'application/pdf' });
  //           // Create a URL for the Blob
  //           const url = URL.createObjectURL(blob);
  //           this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url)
  //           let obj = {
  //             'isIframe': true,
  //             'url': this.urlSafe
  //           }
  //           this.confirmationDialogService.confirm('View', obj, true, "Ok", "Close", false, "lg");
  //         })
  //       } 
  //       else {
  //         if (res && res.data && !res.error) {
  //           this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(res.data.url);
  //           let obj = {
  //             'isIframe': true,
  //             'url': this.urlSafe
  //           }
  //           this.confirmationDialogService.confirm('View', obj, true, "Ok", "Close", false, "lg");
  //         }
  //         else {
  //           alert(res.msg)
  //         }
  //       }
  //     });
  //   }
  // }

}
