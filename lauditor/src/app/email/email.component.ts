import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationDialogService } from './../confirmation-dialog/confirmation-dialog.service';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { HttpService } from '../services/http.service';
import { MatDialog } from '@angular/material/dialog';
import { URLUtils } from '../urlUtils';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ModalService } from '../model/model.service';
import { EmailService } from './email.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss']
})
export class EmailComponent implements OnInit, AfterViewInit {
  metaData: any;
  matterid:any;
  constructor(private httpservice: HttpService, private confirmationDialogService: ConfirmationDialogService,
    private spinnerService: NgxSpinnerService, private modalService: ModalService,
    private formBuilder: FormBuilder, private emailService: EmailService, private toast: ToastrService,
    private router: Router, private dialog: MatDialog) { }
  messagesMap: Map<number, any> = new Map<number, any>();
  pageTokenMap: Map<number, string> = new Map<number, any>();  
  messages: any;
  product = environment.product;
  count: number = 0;
  nextToken: any;
  searchText: string = '';
  isFirstPage: boolean = true;
  pageNumber: number = 1;
  isDocument: boolean = false;
  data: any;
  relationshipSubscribe: any;
  keyword = 'name';
  clients: any = [];
  filter: string = "client";
  msgAndpartId: any;
  isSelectGroup: boolean = false;
  groupViewItems: any;
  selectedGroupItems: any = [];
  composeForm: any = FormGroup;
  controls: any;
  selectedAttachments: any = [];
  isAuthenticated: boolean = false;
  reldata: any[] = [];
  corpData: any[] = [];


  documents: any = [];
  viewMode = 1;
  value: any = 1;
  filterKey: any;
  matterList: any;
  viewItemsList: any;
  clientDetails: any;
  term: any;
  matters = '';
  errorMsg: boolean = false;
  selectedmatterType = 'internal';
  categories = '';
  corp_matter_list: any[] = [];
  uploadDocs: any = [];
  files: File[] = [];
  clientId: any = [];

  groupId: any = [];
  selectedValue: any;
  selectedDate: any;
  errorMessage: string = '';
  saveTag = false;
  grouplist: any = [];
  grpclientData: any;
  check = false;
  editDoc: any;
  type='gmail';

  ngOnInit() {
    this.autoRefresh()
    this.composeForm = this.formBuilder.group({
      toEmail: ['', [Validators.required, Validators.pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)]],
      subject: ['',Validators.required],
      body: [''],
      documents: ['',Validators.required]
    });
    let controls: any = localStorage.getItem('inputs');
    this.controls = JSON.parse(controls);
    if (this.controls) {
      this.composeForm.patchValue(this.controls);
      localStorage.removeItem("inputs");
    }

    const docs = localStorage.getItem('docs');
    if (docs) {
        const parsedDocs = JSON.parse(docs);
        // Filter out invalid or undefined entries
        this.selectedAttachments = parsedDocs.filter(
            (doc: any) => doc.filename && doc.name && doc.path
        );
        this.composeForm.controls['documents'].setValue(this.selectedAttachments);
    }

    // this.getMessageCount(); //dialog
    if (!localStorage.getItem('validationDone')) {
      this.openDialog()
    }
    this.get_all_matters(this.selectedmatterType)
    // this.emailAuthentication();
    //console.log('filter', this.filter)
  }
  get f() { return this.composeForm.controls; }

  ngAfterViewInit() {
    if (this.controls)
      this.modalService.open('compose-email');
  }

  // var emailauthurlgmail = '';
  // var emailauthurloutlook='';

  emailAuthentication(type:any) {
    //console.log(type)
    const validationDone = localStorage.getItem('validationDone');
    const token = localStorage.getItem('TOKEN');
    const emailAuthUrls: { [key: string]: string } = {
        gmail: `/api/v1/gmail/authurl?authtoken=${token}`,
        outlook: `/outlook/authurl?authtoken=${token}`
    };
    
    if (!localStorage.getItem('validationDone')) {
      const emailAuthUrl = emailAuthUrls[type];

      if (emailAuthUrl) {
        this.httpservice.sendGetEmailRequest(emailAuthUrl).subscribe(
          (res: any) => {
            if (!res.error && res.url) {
              localStorage.setItem('validationDone', 'true');
              if (!localStorage.getItem('popupOpened')) {
                console.log(res.url);
                window.open(res.url, 'coffergoogleAuthWin', "height=450px, width=750px");
              }
              localStorage.setItem('popupOpened', 'true');
            }
          });
      }

    } else {
      this.handleMessageCountClick();
    }
  }

  getMessageCount() {
    var globalVar = this;
    this.httpservice.sendGetEmailRequest(URLUtils.messagesCount({ "token": localStorage.getItem('TOKEN'), "labelid": 'INBOX' ,'type':this.type})).subscribe(
      (res: any) => {
        if (!res.error) {
          this.count = res.data?.messagesTotal;
          this.getMessages();
        }
      },
      (error: HttpErrorResponse) => {
        //setInterval(function () {
        localStorage.removeItem('validationDone');
        // if (error.status === 401 || error.status === 403) {
        //   const errorMessage = error || 'Unauthorized';
        //   //this.toast.error(errorMessage);
        //   localStorage.removeItem('validationDone');
        //   localStorage.removeItem('popupOpened');
        // }
        this.isAuthenticated = false;
        globalVar.emailAuthentication(this.type);
        this.autoRefresh()
        //}, 10000);
      });
  }

  getOutlookMessageCount() {
    var globalVar = this;
    this.httpservice.sendGetEmailRequest(URLUtils.OutlookmessagesCount({ "token": localStorage.getItem('TOKEN'), "labelid": 'INBOX'})).subscribe(
      (res: any) => {
        if (!res.error) {
          this.count = res?.totalItemCount;
          //console.log("herer")
          this.getOutlookMessages();
        }
      },
      (error: HttpErrorResponse) => {
        //setInterval(function () {
        localStorage.removeItem('validationDone');
        this.isAuthenticated = false;
        globalVar.emailAuthentication(this.type);
        this.autoRefresh();
        //}, 10000);
      });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { editDoc: this.editDoc },
      width: '500px',
      height: '255px',
      hasBackdrop: true,
      panelClass: 'hello',
      disableClose: true
    });

   dialogRef.afterClosed().subscribe(result => {
    if (result) {
      //console.log(result)
      // Open the authentication window
      if(result){
        this.type=result
        this.emailAuthentication(result)
      }           
      
      // Check if the popup window is closed or not
      // const checkPopupClosed = setInterval(() => {
      //   if (popupWindow?.closed) {
      //     clearInterval(checkPopupClosed); // Stop checking once closed
      //     location.reload(); // Refresh the page
      //   }
      // }, 1000);
    }
  });
}

  getMessages() {
    var globalVar = this;
    this.httpservice.sendGetEmailRequest(URLUtils.emailMessages({ "token": localStorage.getItem('TOKEN'), "rows": 10 })).subscribe(
      (res: any) => {
        if (!res.error) {
          this.isFirstPage = true;
          this.nextToken = res.nextPageToken;
          this.messages = res.messages;
          this.pageNumber = 1;
          this.messagesMap.set(this.pageNumber, res);
          this.messages.forEach((element: any) => {
            element.fromName = element.from.split("<")[0];
          });
          this.isAuthenticated = true;
        }
      },
      (error: any) => {
        //setInterval(function () {
        localStorage.removeItem('validationDone');
        this.isAuthenticated = false;
        globalVar.emailAuthentication(this.type);
        this.autoRefresh()
        //}, 10000);
      });
  }


  handleMessageCountClick() {
    if (this.type === 'outlook') {
        this.getOutlookMessageCount();
    } else if(this.type === 'gmail') {
        this.getMessageCount();
    }
}

handleNextPageClick() {
  if (this.type === 'outlook') {
      this.getNextPageOutlookMessages();
  } else if(this.type === 'gmail') {
      this.getNextPageMessages();
  }
}

  getOutlookMessages() {
    var globalVar = this;
    this.httpservice.sendGetEmailRequest(URLUtils.OutllokemailMessages({ "token": localStorage.getItem('TOKEN'), "rows": 10 ,"labelid": 'INBOX'})).subscribe(
      async (res: any) => {
        if (!res.error) {
          this.isFirstPage = true;
          this.nextToken = res['@odata.nextLink'];
          console.log(this.nextToken)
          this.messages = res.value;
          this.pageNumber = 1;
          this.messagesMap.set(this.pageNumber, res);
          this.pageTokenMap.set(this.pageNumber, this.nextToken);

          // Fetch attachments for messages that have them
          await Promise.all(this.messages.map(async (message: any) => {
            message.fromName = message.from.emailAddress.name;
            message.msgId = message.id
            if (message.hasAttachments) {
                message.attachments = await this.fetchAttachments(message.id);
            }
        }));
        //console.log(this.messages)
          // this.messages.forEach((element: any) => {
          //   element.fromName = element.from.emailAddress.name;
          // });
          this.isAuthenticated = true;
        }
      },
      (error: any) => {
        //setInterval(function () {
        localStorage.removeItem('validationDone');
        this.isAuthenticated = false;
        globalVar.emailAuthentication(this.type);
        this.autoRefresh()
        //}, 10000);
      });
  }

  fetchAttachments(messageId: string): Promise<any[]> {
    return new Promise((resolve, reject) => {

        this.httpservice.sendGetEmailRequest(URLUtils.OutlookMsgDetail({ "token": localStorage.getItem('TOKEN'),"id": messageId})).subscribe(
            (res: any) => {
                if (!res.error) {
                   const attachments = res.attachments.value.map((attachment: any) => {
                    attachment.filename = attachment.name; // Assign filename
                    attachment.partId = attachment.id;
                    return attachment;
                });
                    resolve(attachments);
                } else {
                    reject(res.error);
                }
            },
            (error: any) => {
                reject(error);
            }
        );
    });
}



  getNextPageMessages() {
    var globalVar = this;
    this.httpservice.sendGetEmailRequest(URLUtils.NextPageMessages({ "token": localStorage.getItem('TOKEN'), "rows": 10, "nextpagetoken": this.nextToken })).subscribe(
      (res: any) => {
        this.isFirstPage = false;
        this.nextToken = res.nextPageToken;
        this.messages = res.messages;
        this.pageNumber = this.pageNumber + 1;
        this.messagesMap.set(this.pageNumber, res);
        this.messages.forEach((element: any) => {
          element.fromName = element.from.split("<")[0];
        });
      },
      (error: any) => {
        // setInterval(function () {
        localStorage.removeItem('validationDone');
        this.isAuthenticated = false;
        globalVar.emailAuthentication(this.type);
        this.autoRefresh()
        //}, 10000);
      })
  }
  getNextPageOutlookMessages() {
    var globalVar = this;
    let nextTokenForPage = this.pageTokenMap.get(this.pageNumber);
   
    this.httpservice.sendGetEmailRequest(URLUtils.OutlookNextPageMessages({ "token": localStorage.getItem('TOKEN'), "rows": 10,"labelid": 'INBOX', "nextpageurl":encodeURIComponent(nextTokenForPage?.toString() || '')  })).subscribe(
      async (res: any) => {
        this.isFirstPage = false;
        this.nextToken = res['@odata.nextLink'];
        this.messages = res.value;
        this.pageNumber = this.pageNumber + 1;
        this.messagesMap.set(this.pageNumber, res);
        this.pageTokenMap.set(this.pageNumber, this.nextToken);
        // Fetch attachments for messages that have them
          await Promise.all(this.messages.map(async (message: any) => {
            message.fromName = message.from.emailAddress.name;
            message.msgId = message.id
            if (message.hasAttachments) {
                message.attachments = await this.fetchAttachments(message.id);
            }
        }));
      },
      (error: any) => {
        // setInterval(function () {
        localStorage.removeItem('validationDone');
        this.isAuthenticated = false;
        globalVar.emailAuthentication(this.type);
        this.autoRefresh()
        //}, 10000);
      })
  }
  autoRefresh(): void {
    setInterval(() => {
      this.handleMessageCountClick()
    }, 10000); 
  }
  onKeydown(event: any) {
    if (event.key === "Enter" || event.type === "click") {
      this.httpservice.sendGetEmailRequest(URLUtils.searchMessages({ "type": this.type, "token": localStorage.getItem('TOKEN'), "rows": 10, "search": this.searchText, "labelid": "INBOX" })).subscribe(
        async (res: any) => {
          if (this.type == 'outlook') {
            this.nextToken = res['@odata.nextLink'];
            this.messages = res.value;
            this.messagesMap.set(this.pageNumber, res);
            // Fetch attachments for messages that have them
            await Promise.all(this.messages.map(async (message: any) => {
              message.fromName = message.from.emailAddress.name;
              message.msgId = message.id
              if (message.hasAttachments) {
                message.attachments = await this.fetchAttachments(message.id);
              }
            }));
          } 
          else {
            this.messages = res.messages;
            this.nextToken = res.nextPageToken;
            this.messages.forEach((element: any) => {
              element.fromName = element.from.split("<")[0];
            });
          }
        })
    }
  }
  onPrevious() {
    if (this.pageNumber > 1)
      this.pageNumber = this.pageNumber - 1;
    if (this.pageNumber == 1) {
      this.isFirstPage = true;
    };
    let data = this.messagesMap.get(this.pageNumber);
    console.log(data)
    if(this.type=='outlook'){
      this.nextToken = this.pageTokenMap.get(this.pageNumber);
      this.messages = data?.value;

    } else {
      this.nextToken = data?.nextPageToken;
    this.messages = data?.messages;
    }
  }
  documentClick(msgid: any, partid: any) {
    console.log(msgid,partid)
    this.msgAndpartId = {
      "msgId": msgid,
      "partId": partid
    }
    this.isDocument = true;
    //this.filter = 'client'

    if (this.product == 'corporate') {
      this.filter = 'firm'
    }
    else {
      this.filter = 'client'
    }
    this.getClients();
    this.getGroups();
  }
  getClients() {
    this.relationshipSubscribe = this.httpservice.getFeaturesdata(URLUtils.getAllRelationship).subscribe((res: any) => {
      this.data = res?.data?.relationships;
      //console.log('data', this.data)
      this.httpservice.getFeaturesdata(URLUtils.getCalenderExternal).subscribe((res: any) => {
        this.corpData = res?.relationships.map((obj: any) => ({ "id": obj.id, "type": "corporate", "name": obj.name }))
        this.data = this.data.concat(this.corpData)
        //console.log('corpData',this.corpData)
      });
    });
  }

  getGroups() {
    this.httpservice.sendGetRequest(URLUtils.getGroups).subscribe((res: any) => {
      //this.groupViewItems = res?.data;
      this.groupViewItems = res?.data.filter((group: any) => group.name !== 'AAM' && group.name !== 'SuperUser');
      this.groupViewItems.forEach((item: any) => {
        item.isChecked = false;
      })
    })
  }
  // selectEventFirm(item: any) {
  //   // this.clients = [];
  //   // if (this.filter === 'client') {
  //   //   this.clients.push(item);
  //   // }

  //   this.clients = [];
  //   if (this.filter === 'client') {
  //     this.clients.push(item);
  //     this.clientDetails = item;
  //     localStorage.setItem("clientData", JSON.stringify(item));
  //     this.httpservice.sendGetRequest(URLUtils.getMattersByClient(item)).subscribe((res: any) => {
  //         this.matterList = res?.matterList;
  //         //console.log("matterList " + JSON.stringify(this.matterList));
  //     })
  //     //console.log("test   " + JSON.stringify(item));
  //     //this.getAllDocuments();
  //   }
  // }
  // selectGroupFirm(val: boolean) {
  //   this.isSelectGroup = val;
  // }

  saveFiles() {
    this.spinnerService.show();
    // this.filter == "client" ? this.selectedGroupItems = [] : this.clientId = [];
    this.filter == "client";
    var matterList = []
    if (this.matters !== '') {
      matterList.push(this.matters)
    }
    //this.selectedGroupItems
    //console.log('this.selectedGroupItems',this.selectedGroupItems)
    let obj =
    {
      "category": this.filter,
      "clientids": this.clientId.map((obj: any) => ({ "id": obj.id, "type": obj.type })),
      "matters": matterList,
      "groupids": this.selectedGroupItems.map((obj: any) => obj.id),
      "enableDownload": true
    }
    var req;
    if(this.type=='gmail'){
      req = URLUtils.MessageDocUpload({ "token": localStorage.getItem('TOKEN'), "msgid": this.msgAndpartId.msgId, "partid": this.msgAndpartId.partId })
    } else {
      req = URLUtils.OutlookMessageDocUpload({ "token": localStorage.getItem('TOKEN'), "msgid": this.msgAndpartId.msgId, "partid": this.msgAndpartId.partId })
    }
    this.httpservice.sendPostEmailRequest(req, obj).subscribe((res: any) => {
      if (res) {
        this.spinnerService.hide();
        this.confirmationDialogService.confirm('Success', res.msg, false, '', '', false, 'sm', false);
        this.isDocument = false;
      }
    },
      (error: any) => {
        this.spinnerService.hide();
        this.confirmationDialogService.confirm('Alert', error.error.msg, false, '', '', false, 'sm', false);
        this.isDocument = false;
      }
      // (error: HttpErrorResponse) => {
      //   if (error.status === 400 || error.status === 403 || error.status === 500) {
      //     const errorMessage = error.error.msg || 'Unauthorized';
      //     this.toast.error(errorMessage);
      //     this.isDocument = false;
      //     return;
      //   }
      // }
    );
  }

  selectGroupItem(item: any, val: any) {
    //console.log("selected item" + JSON.stringify(item) + val);
    if (val) {
      item.isChecked = val;
      this.selectedGroupItems.push(item);
      //this.selectedGroupItems = this.selectedGroupItems.filter((el:any, i:any, a:any) => i === a.indexOf(el));

    } else {
      item.isChecked = val;
      let index = this.selectedGroupItems.findIndex((d: any) => d.id === item.id);
      //console.log(item.id);
      this.selectedGroupItems.splice(index, 1);
    }
    localStorage.setItem("groupIds", JSON.stringify(this.selectedGroupItems));
    //console.log("selected " + JSON.stringify(this.selectedGroupItems));
  }
  removeGroup(item: any) {
    item.isChecked = false;
    let index = this.selectedGroupItems.findIndex((d: any) => d.id === item.id); //find index in your array
    this.selectedGroupItems.splice(index, 1);
  }

  removeCliExGroups() {
    // Reset the arrays
    this.check = false;
    this.selectedGroupItems.forEach((item: any) => item.isChecked = false);
    this.selectedGroupItems = [];
    // Update the local storage
    localStorage.setItem('groupIds', JSON.stringify(this.selectedGroupItems));
  }

  removeFirmExGroups() {
    // Reset the arrays
    this.selectedGroupItems.forEach((item: any) => item.isChecked = false);
    this.selectedGroupItems = [];
    // Update the local storage
    localStorage.setItem('groupIds', JSON.stringify(this.selectedGroupItems));
  }

  onCompose() {
    this.selectedAttachments = [];	
    localStorage.removeItem("docs"); //remove the selected docs
    this.modalService.open('compose-email');
  }
  close() {
    this.modalService.close('compose-email');
    this.composeForm.reset();
    this.selectedAttachments = [];	  
    localStorage.removeItem("docs"); //remove the selected docs
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }
  onAttach() {
    localStorage.setItem('inputs', JSON.stringify(this.composeForm.value));
    localStorage.setItem('type',this.type);
    this.emailService.emailEvent(true);
    if (this.product == 'corporate') {
      this.router.navigate(['/documents/view/firm']);
    }
    else {
      this.router.navigate(['/documents/view/client']);
    }
    document.body.classList.remove("cdk-global-scrollblock"); //closes the bg scrolling when dialog is open
  }
  // onRemoveAttachment(attachment: any) {
  //   this.selectedAttachments = this.selectedAttachments.filter((item: any) => item.name !== attachment.name);
  // }

  onRemoveAttachment(attachment: any) {
    // Remove the attachment from the selectedAttachments array
    this.selectedAttachments = this.selectedAttachments.filter((item: any) => item.name !== attachment.name);
    //console.log('rem selectedAttachments', this.selectedAttachments);
  
    // Get the current 'docs' from localStorage
    const storedDocs = localStorage.getItem('docs');
    //console.log('storedDocs', storedDocs);
  
    // Parse the stored docs from localStorage or set an empty array if null
    let docsArray = storedDocs ? JSON.parse(storedDocs) : [];
  
    // Filter out the specific string ID and the matching object
    docsArray = docsArray.filter((doc: any) => {
      if (typeof doc === 'string') {
        // Keep the string IDs that do not match the attachment ID
        return doc !== attachment.id;
      } else if (typeof doc === 'object') {
        // Keep objects that do not match the attachment details
        return doc.id !== attachment.id;
      }
      return true;
    });
  
    //console.log('Updated docsArray', docsArray);
    localStorage.setItem('docs', JSON.stringify(docsArray)); // Update the 'docs' in localStorage
    // console.log('selectedAttachments',this.selectedAttachments)
    // console.log('documents',this.documents)

    if (this.selectedAttachments.length === 0 || this.documents.length === 0) {
      this.composeForm.controls['documents'].setValue('');
    }
  }
  

  getAllDocuments() {
    //console.log('get.documents',this.documents)
    this.documents = [];
    let selectedGroups: any = [];
    let clientId: any;
    this.selectedGroupItems?.forEach((item: any) => {
      selectedGroups.push(item.id)
    })
    if (this.clientDetails) {
      clientId = this.clientDetails?.id;
    }
    var matterList = []
    matterList.push(this.matters)
    let obj = {
      "category": this.filterKey,
      "clients": clientId,
      "matters": matterList,
      "subcategories": this.categories,
      "groups": selectedGroups,
      "showPdfDocs": false
    }
    let url = this.viewMode == 1 ? URLUtils.getFilteredDocuments : URLUtils.filterMergeDoc;
    //console.log('url',url)
    if (clientId || selectedGroups.length > 0)
      this.httpservice.sendPutRequest(url, obj).subscribe((res: any) => {
        if (this.viewMode == 1)
          this.documents = res?.data?.reverse();
        else
          this.documents = res?.data?.items?.reverse()
        //console.log("documents " + JSON.stringify(this.documents));
        this.documents.forEach((item: any) => {
          item.expiration_date = item.expiration_date == 'NA' ? null : new Date(item.expiration_date);

          item.tags = Object.entries(item.tags);
          item.isChecked = false;
          if (this.viewItemsList && this.viewItemsList.length > 0) {
            this.viewItemsList?.forEach((val: any) => {

              if (item.name == val.name) {
                item.isChecked = true;
              }
            })
          }
        })
        this.errorMsg = this.documents.length == 0 ? true : false;
      });

  }

  onChangeMatters(val: any) {
    //console.log("value " + JSON.stringify(val.value));
    this.matters = val.value;
    //console.log('matt',this.matters)
    this.categories = ''
    //this.getAllDocuments();
    this.update_grp_list()
  }

  get_all_matters(type: any, event?: any) {
    this.spinnerService.show()
    let selectedGroups: any = [];
    this.selectedGroupItems?.forEach((item: any) => {
      selectedGroups.push(item.id)
    })
    let payload = { "grp_acls": selectedGroups }
    if (type == 'internal') {
      this.httpservice.sendPutRequest(URLUtils.getAllMatters, payload).subscribe((res: any) => {
        if (res.error == false) {
          this.corp_matter_list = res.matterList
          this.spinnerService.hide()
        } else {
          this.spinnerService.hide()
        }
      }, (err: any) => {
        //console.log(err)
        this.spinnerService.hide()
      })
    }
    if (type == 'external') {
      this.httpservice.sendPutRequest(URLUtils.getAllExternalMatters, payload).subscribe((res: any) => {
        if (res) {
          this.corp_matter_list = res.matterList
          this.spinnerService.hide()
        }
      }, (err: any) => {
        this.spinnerService.hide()
      })

    }
  }

  onSubmit() {
    this.spinnerService.show();
    // if (!this.composeForm.valid) {
    //   return;
    // }
    this.httpservice.sendPostEmailRequest(URLUtils.sendMessage({ "token": localStorage.getItem('TOKEN'),"type":localStorage.getItem('type') }), this.composeForm.value).subscribe((res: any) => {
      if (res) {
        this.spinnerService.hide();
        this.confirmationDialogService.confirm('Success', 'Mail sent successfully.', false, '', '', false, 'sm', false);
        this.isDocument = false;
        this.composeForm.reset();
        this.selectedAttachments = [];
        localStorage.removeItem("docs"); //remove the selected docs
        this.modalService.close('compose-email');
      }
    },
      (error) => {
        this.spinnerService.hide();
        this.confirmationDialogService.confirm('Alert', 'Mail not sent successfully.', false, '', '', false, 'sm', false);
      }
      // (error: HttpErrorResponse) => {
      //   if (error.status === 400 || error.status === 403 || error.status === 500) {
      //     const errorMessage = error.error.message || 'Unauthorized';
      //     this.toast.error(errorMessage);
      //     return;
      //   }
      // }
    );
  }
  ngOnDestroy() {
    if (this.relationshipSubscribe) {
      this.relationshipSubscribe.unsubscribe();
    }
  }

  selectEvent(item: any) {
    this.check = true
    localStorage.setItem("clientData", JSON.stringify(item));
    if (this.filter === 'client') {
      this.clientId.push(item);
      this.httpservice.sendGetRequest(URLUtils.getMattersByClient(item)).subscribe((res: any) => {
        this.matterList = res?.matterList;
        //console.log('matterList',this.matterList)
      });

      let clientInfo = new Array();
      this.clientId?.forEach((item: any) => {
        let clientData = {
          "id": item.id,
          "type": item.type
        };
        clientInfo.push(clientData);
      });
      this.matters = '';
      this.update_grp_list();
    }
    else {
      this.groupId.push(item?.id);
    }
  }

  selectGroup(val: boolean) {
    this.isSelectGroup = val;
    if (!val) {
      this.get_all_matters(this.selectedmatterType)
    }
  }
  onChangeSearch(val: any) {
    if (val == undefined) {
      this.clientId = [];
    }
  }

  onFocused(e: any) {
  }

  update_grp_list(){
    let clientInfo = new Array();
        this.clientId?.forEach((item: any) => {
            let clientData = {
                "id": item.id,
                "type": item.type
            };
            clientInfo.push(clientData);
        });

        let payload
        if(this.matters){
           payload =  { "clients": clientInfo , "matterid":this.matters }
        }
        else{
          payload =  { "clients": clientInfo , "matterid":''}
        }

        this.httpservice.sendPutRequest(URLUtils.getGrouplist,payload).subscribe((res: any) => {
            if (res.error == false) {
                this.grouplist = res?.data;
                //console.log('selectedGrps', this.grouplist);

                //Filter and check groups based on the API res.
                this.selectedGroupItems = this.grouplist.filter((groupItem: any) => {
                    groupItem.isChecked = this.grouplist.some((selectedGroup: any) => selectedGroup.id === groupItem.id);
                    return groupItem.isChecked;
                });

                //Update the checkboxes in groupViewItems
                // this.groupViewItems.forEach((groupItem: any) => {
                //     groupItem.isChecked = this.selectedGroupItems.some((selectedGroup: any) => selectedGroup.id === groupItem.id);
                // });
            }
        });
}
}


@Component({
  selector: 'app-confirmation-dialog',
  template: `
  <div mat-dialog-content>
  <div class="closeDialog">
        <i class="fa fa-times closeBtn" (click)="onCloseDialog()" aria-hidden="true"></i>
    </div>

   <h1 mat-dialog-title class="mailoption">Choose a Mail account provider…</h1>
      <mat-radio-group aria-label="Select an option" [(ngModel)]="selectedOption">
        <mat-radio-button value="outlook"></mat-radio-button><img class="gImg" src="assets/img/outlook.svg"/>
        <mat-radio-button value="gmail"></mat-radio-button><img class="oImg" src="assets/img/google.svg"/>
      </mat-radio-group>
      <div mat-dialog-actions class="overviewSave savefilenameBtn">
          <button type="reset" class="btn btn-default btncancel btnfont" (click)="onCloseDialog()">Cancel</button> 
           <button type="submit" class="btn btn-default btnsave savefile pull-right btnfont" 
           [ngClass]="{ 'is-invalid': !selectedOption }" (click)="continue()">Continue</button> 
      </div> 
  </div>
`,
  styleUrls: ['./email.component.scss']
})
export class ConfirmationDialogComponent {
  editDoc: any;
  selectedOption: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,private toast: ToastrService,
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>
  ) { }

  ngOnInit() {
      //console.log('selectedOption',this.selectedOption)
      //localStorage.removeItem('validationDone');
  }

  continue() {
    this.dialogRef.close(this.selectedOption);
  }
  onCloseDialog() {
    // Only close the dialog if an option is selected
    // if (this.selectedOption) {
    //   this.closeDialog();
    // } 
    // else{
    //   this.toast.error('Please choose a Gmail or Outlook account.')
    // }
    this.closeDialog();
  }
  closeDialog() {
    this.dialogRef.close()
  }
}


