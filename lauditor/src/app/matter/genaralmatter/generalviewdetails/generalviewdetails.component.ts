import { DocumentService } from './../../../document/document.service';
import { ConfirmationDialogService } from './../../../confirmation-dialog/confirmation-dialog.service';
import { HttpService } from 'src/app/services/http.service';
import { URLUtils } from 'src/app/urlUtils';

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatterService } from '../../matter.service';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ThemePalette } from '@angular/material/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-generalviewdetails',
  templateUrl: './generalviewdetails.component.html',
  styleUrls: ['./generalviewdetails.component.scss']
})
export class GeneralViewDetailsComponent implements OnInit {
  data: any;
  EditDesc = false;
  notes: any;
  featureName: string = 'Timeline';
  selectedVal: string = 'TM'
  isVisibleInfo: boolean = false;
  clientsList: any;
  //historyData: any;
  selectedMembers: any;
  selectedClients: any;
  selectedDocuments: any = [];
  documentsList: any = [];
  searchTextMembers: any = '';
  searchTextClient: any = '';
  searchText: any = '';
  teammembersList: any;
  membersLength: any;
  clientsLength: any;
  isDesc: boolean = false;
  urlSafe: any;
  isNewDocument: boolean = false;
  isMergeEnable: boolean = false;
  selectedMergeDocuments: any = [];
  AddExistingSelected: boolean = false;
  UploadDocSelected: boolean = false;
  //public files: NgxFileDropEntry[] = [];
  files: File[] = [];
  uploadedDocs: any = [];
  DragAndDropView: boolean = true;
  downloadDisabled: boolean = true;
  editMetaFlag: any = true;
  submitted = false;
  editDoc: boolean = false;
  editMetaData: boolean = false;
  selectedIdx: any;
  editMeta: any;
  documentDetail: any = FormGroup;
  values: any = [];
  metaData: any;
  ownerName: any;
  isSaveEnableClient:boolean=true;
  isSaveEnableTM:boolean=true;
  filteredDataDocs:any;
  filteredDataClnts:any;
  filteredDataTms:any;
  isNotesElipses:boolean=false;
  corporateList:  any = [];
  product = environment.product;
  selectedCorp: any;
  corpNotes:boolean = false;
  isCorp: boolean = false;
  isLauditor: boolean = false;
  selectedNotes: string = "lauditor";
  notes_list:any = [];
  noteList:any = [];
  historyData1: any;
  historyData:any = [];
  toggleNote = false;
  toggleCorpNote = false;
  selectNote:any
  toggleBool: boolean = true;
  selectedButton :any;
  checked = true;
  disabled = true;
  isChecked: string = 'mainNote' 
  color: ThemePalette = "primary";
  form: any; 
  isReadMore: boolean[] = [];
  isButtonClicked = false;
  allowedFileTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/rtf','text/csv','text/rtf'];
  docapi = environment.doc2pdf;
  filteredClients:any;
  showCorporateNotes = false;
  clientNamesString: string = '';
  maxVisible: number = 3;
  visibleClients: any[] = [];
  showAllClients: boolean = false;
  sortAscending = true; 
  description:any;
  
  //Initializing docUpload Variables
  // reactiveForm: any;
  // keyword = 'name';
  // relationshipSubscribe: any;
  // uploadDocs: any = [];
  // message: any;
  // clientId: any = [];
  // filter: any = "client";
  // groupViewItems: any;
  // groupId: any = [];
  // isSelectGroup: boolean = false;
  // selectedGroupItems: any = [];
  // matterList: any;
  // matters: any;
  // categories:any;
  // selectedValue: any;
  // selectedDate: any;
  // reldata:any[]=[];
  // corpData:any[]=[];
  // selectedmatterType='internal';
  // corp_matter_list:any[] = [];
  // grouplist:any=[];
  // clientdata:any;
  createdBy: any;
  generalMatters:any;
  showConfirm = false;
  gro:any;

  constructor(private matterService: MatterService, private httpservice: HttpService,
    private router: Router, private toast: ToastrService, 
    private confirmationDialogService: ConfirmationDialogService,
    private sanitizer: DomSanitizer,
    private docService: DocumentService,
    private fb: FormBuilder,
    private spinnerService: NgxSpinnerService) {

  }

  ngOnInit(): void {
    this.ownerName = localStorage.getItem('name');

    this.form = this.fb.group({
      notes: ['', Validators.required] 
    });

    this.matterService.editGeneralMatterObservable.subscribe((result: any) => {
      if (result) {
        this.data = result;
        let args = {
          id: result.id,
          offset: new Date().getTimezoneOffset()
        }
        this.httpservice.sendGetRequest(URLUtils.getGeneralHistory(args)).subscribe((res: any) => {
          if (res) {
            this.historyData = res.history;
            this.notes_list = res.history?.notes_list;
              this.historyData.forEach((res: any) => {
              });
          }
        });
      }
      this.updateCorporateNotesVisibility();
    });

    this.documentDetail = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      date_of_filling: []
    });

    this.getCorporateData();
    this.getClientsData();
    // this.updateCorporateNotesVisibility();
  }

  updateCorporateNotesVisibility() {
    this.httpservice.sendGetRequest(URLUtils.getGeneralHistoryMembers(this.data?.id)).subscribe(
      (res: any) => {
        this.selectedClients = res.clients;
        this.selectedCorp = res.corporate;
        // Combine selectedClients and selectedCorp into one array
        this.filteredClients = this.selectedClients.concat(this.selectedCorp);
        this.updateClientNamesString();
        //Show Corporate Notes radio only if there is corporate cli.
        this.showCorporateNotes = this.selectedCorp.some((client: any) => client.type === 'corporate');
      });
  }

  updateClientNamesString() {
    if (this.showAllClients) {
      this.clientNamesString = this.filteredClients.map((client: { name: any; }) => client.name).join(', ');
    } else {
      const limitedClients = this.filteredClients.slice(0, 1);
      this.clientNamesString = limitedClients.map((client: { name: any; }) => client.name).join(', ');
    }
  }

  toggleClientNames() {
    this.showAllClients = !this.showAllClients;
    this.updateClientNamesString();
  }

  onAdd() {
    // this.AddDesc = true;
    this.isButtonClicked = true;
       
    // Set focus on the last added textarea
    setTimeout(() => {
      const textareas = document.querySelectorAll('.row.container.tex');
      const lastTextarea = textareas[textareas.length - 1] as HTMLTextAreaElement;
      if (lastTextarea) {
        lastTextarea.focus();
      }
    });
   }

   onAddCN(item: any) {
    this.isButtonClicked = true;
    //console.log('item', item);
        
    // Set focus on the last added textarea
    setTimeout(() => {
      const textareas = document.querySelectorAll('.row.container.tex');
      const lastTextarea = textareas[textareas.length - 1] as HTMLTextAreaElement;
      if (lastTextarea) {
        lastTextarea.focus();
      }
    });

    this.matterService.editLegalMatterObservable.subscribe((result: any) => {
      let args = {
        id: result.id,
        offset: new Date().getTimezoneOffset()
      };
      this.httpservice.sendGetRequest(URLUtils.getLegalMatterviewDetail(args)).subscribe((res: any) => {
        const matchedItem = res?.history?.find((historyItem: any) => historyItem.id === item.id);
        if (matchedItem) {
          const notesList = matchedItem?.notes_list;
          if (notesList && notesList.length > 0) {
            const lastNote = notesList[notesList.length - 1]?.notes;
            if (lastNote === "5") {
              this.toast.error("Corporate Notes only allow 5 Notes.");
              this.gethistoryData();
              item.notes_list.AddDesc = true; // Prevent further additions
              this.isButtonClicked = false; // Reset the button state
              return;
            }
          }
        }
      });
    }); 
  }
   
   sortMembers() {
    const fixedMember = this.selectedMembers[0]; // Extract the first fixed member
    const membersToSort = this.selectedMembers.slice(1); // Members to be sorted

    membersToSort.sort((a: { name: any; }, b: { name: any; }) => {
      if (a.name < b.name) {
        return this.sortAscending ? -1 : 1;
      }
      if (a.name > b.name) {
        return this.sortAscending ? 1 : -1;
      }
      return 0;
    });

    // Reconstruct the array with the fixed member and sorted members
    this.selectedMembers = [fixedMember, ...membersToSort];
    this.sortAscending = !this.sortAscending; // toggle the sorting order
  }
  sortClients() {
    this.selectedClients.sort((a: { name: any; }, b: { name: any; }) => {
      if (a.name < b.name) {
        return this.sortAscending ? -1 : 1;
      }
      if (a.name > b.name) {
        return this.sortAscending ? 1 : -1;
      }
      return 0;
    });
    this.sortAscending = !this.sortAscending; // toggle the sorting order
  }

  eventCheck(event: any) {
    this.toggleNote = event.target.checked;
    // console.log('eve',event.target.checked)
    // console.log('tN', this.toggleNote)
    this.toggleNote = !this.toggleNote;
  }

  gethistoryData(){
    this.matterService.editGeneralMatterObservable.subscribe((result: any) => {
      if (result) {
        this.data = result;
        let args = {
          id: result.id,
          offset: new Date().getTimezoneOffset()
        }
        this.httpservice.sendGetRequest(URLUtils.getGeneralHistory(args)).subscribe((res: any) => {
          if (res.error == false) {
            this.historyData = res.history;
            this.notes_list = res.history?.notes_list;
            //console.log('nl',this.notes_list)

              this.historyData.forEach((res: any) => {
              }); 
          }
        });
      }
    });
  }

  addNotes(item: any) {

    this.submitted = true;
    item.AddDesc=true
    item.EditDesc=true
    
    // if(this.submitted = true){
    //   this.toast.success('HELLO');
    // }

    if (this.form.valid && this.notes.length > 0) {
      var req = { "notes": this.notes }
      // console.log(item)
      this.httpservice.sendPutRequest(URLUtils.updateEventNotes(item.id), req).subscribe(
        (res: any) => {
          // console.log('itemId',item.id);
          // console.log('idRes',res);
          if (!res.error)
            this.toast.success(res.msg);
          else
            this.toast.error(res.msg);
        });
        item.AddDesc=false
        item.EditDesc=false
    }
    
    //
  }

  addCorpNotes(item: any, notes: any) {

    this.submitted = true;
    item.notes_list.AddDesc = true

    if (this.form.valid && this.notes.length != 0) {
      let req = { "notes": this.notes }
      //console.log(item)
      //console.log('Bef-ITEM', item.notes_list.length + 1);

      if (item.notes_list.length + 1 > 5) {
        this.toast.error("Corporate Notes only allow 5 Notes.");
        return
      }

      this.httpservice.sendPostRequest(URLUtils.updateCorpNotes(item.id), req).subscribe(
        (res: any) => {
          // console.log('itemId',item.id);
          //console.log('ITEM', item);
          if (!res.error) {
            this.toast.success(res.msg);
            item.AddDesc = true
            this.gethistoryData();
          }
          else
            this.toast.error(res.msg);
        });
      item.notes_list.AddDesc = false
    }
  }

  updateCorpNotes(item: any, notes: any) {

    this.submitted = true;
    item.EditDesc = true

    if (this.form.valid && this.notes.length != 0) {
      let req = {
        "notes": this.notes,
        "notes_id": notes.id
      }
      // console.log(item)
      this.httpservice.sendPatchRequest(URLUtils.updateCorpNotes(item.id), req).subscribe(
        (res: any) => {
          if (!res.error)
            this.toast.success(res.msg);
          else
            this.toast.error(res.msg);
          // console.log('itemId',item.id);
          // console.log('idRes',res);
        },
        (error: HttpErrorResponse) => {
          if (error.status === 400 || error.status === 401 || error.status === 403) {
            this.gethistoryData();
            const errorMessage = error.error.msg || 'Unauthorized';
            this.toast.error(errorMessage);
            //console.log(error);
          }
        });
      item.EditDesc = false
    }
  }

  deleteNotes(item:any,notes:any) {
    //this.selectNote = note;
    // console.log('item',item)
    // console.log('notesId',notes.id)
    let data = {
      'notes_id': notes.id,
      //'notes_id': this.notes_list?.id,
    }
    this.confirmationDialogService.confirm('Confirmation', ' Are you sure! Do you want to Delete this note?!', true, 'Yes', 'No')
      .then((confirmed) => {
        if (confirmed) {
          this.httpservice.sendDeleteRequestwithObj(URLUtils.deleteCorpNotes(item.id),data).subscribe((res: any) => {
            if (!res.error) {
              if (confirmed) {
                this.toast.success(res.msg);
                this.gethistoryData();
              }
              else {
                this.toast.error(res.msg);
              }
            }
          },
          (error: HttpErrorResponse) => {
            if (error.status === 400 || error.status === 401 || error.status === 403) {
              const errorMessage = error.error.msg || 'Unauthorized';
              this.toast.error(errorMessage);
              //console.log(error);
            }
          }
          );
        }
      })
  }

  //Main notes
  toggleNotesEllipsis(item: any) {
    item.isNotesElipses = !item.isNotesElipses;
  }

  //Corp notes
  // toggleReadMore(index: number) {
  //   this.isReadMore[index] = !this.isReadMore[index];
  // }
  
  toggleReadMore(note: any,index:any) {
    note.isReadMore = !note.isReadMore;
    this.isReadMore[index] = !this.isReadMore[index];
  }

  get f() {
    return this.documentDetail.controls;
  }
  removevalue(i: any) {
    this.values.splice(i, 1);
  }

  addvalue() {
    this.values.push({ tagtype: "", tag: "" });
  }
  submit() {
    this.editMetaFlag = true;
    //console.log(JSON.stringify(this.values));
    let resultObj: any = {};

    this.values.forEach((item: any) => {
      resultObj[item.tagtype] = item.tag

    });
    this.metaData = resultObj;
    //console.log("tagsArray  " + JSON.stringify(resultObj));
  }
  matterInfoEdit() {
    this.matterService.editLegalMatter(this.data);
    this.router.navigate(['/matter/generalmatter/matterEdit'])
  }
  onFeatureClick(val: string) {
    this.featureName = val;
    //this.isAddItem = this.featureName == 'Timeline' ? false : this.isAddItem;
    if (this.featureName == 'T&C') {
      this.httpservice.sendGetRequest(URLUtils.getGeneralHistoryMembers(this.data.id)).subscribe(
        (res: any) => {
          if (res) {
            this.selectedMembers = res.members;
            //this.selectedMembers.unshift(this.data.owner);
            const ownerIndex = this.selectedMembers.findIndex((member: { id: any; }) => member.id === this.data.owner.id); //removed the ownerName from selectedMembers
            if (ownerIndex === -1) {
              this.selectedMembers.unshift(this.data.owner);
            }
            this.membersLength = res.members.length;
            this.selectedClients = res.clients;
            this.selectedCorp = res.corporate;
            this.clientsLength = res.clients.length;
            this.selectedVal == 'TM' ? this.getTmData() : this.getClientsData();
          }
        });
    }
    if (this.featureName == 'Document') {
      this.httpservice.sendGetRequest(URLUtils.generalHistoryDocuments(this.data.id)).subscribe(
        (res: any) => {
          if (res) {
            this.selectedDocuments = res.documents;
            this.createdBy = localStorage.getItem('name');
            if(this.isMergeEnable)
            this.getMergeDocuments();
            else
            this.getDocuments();
          }
        });
    }
  }
  onClick(val: string) {
    this.selectedVal = val;
  }
  getTmData() {
    let grps = this.data.groups.map((obj: any) => obj.id);
    this.httpservice.sendPutRequest(URLUtils.getFilterTypeAttachements,
      { 'group_acls': grps, 'attachment_type': 'members' }).subscribe(
        (res: any) => {
          this.teammembersList = res['members'];
          let index = this.teammembersList.findIndex((d: any) => d.name === this.ownerName); //find index in your array
          //this.teammembersList.splice(index, 1);
          this.teammembersList = this.teammembersList.filter((el: any) => {
            return !this.selectedMembers.find((element: any) => {
              return element.id === el.id;
            });
          });
        });
  }

  getClientsData() {
    let grps = this.data?.groups?.map((obj: any) => obj.id);
    var payload
    if(this.product == 'corporate'){
       payload =  { 'group_acls': grps, 'attachment_type': 'corporate', 'product': 'corporate' }
    }
    else{
       payload =  { 'group_acls': grps, 'attachment_type': 'clients' }
    }
    this.httpservice.sendPutRequest(URLUtils.getFilterTypeAttachements, payload).subscribe(
        (res: any) => {
          if(this.product == 'corporate'){
          this.clientsList = res['corporate'];
          }
          else{
            this.clientsList = res['clients'];
          }
          //console.log('cl',this.clientsList)
          if(this.selectedClients && this.selectedClients.length > 0){
            this.clientsList = this.clientsList.filter((el: any) => {
              return !this.selectedClients.find((element: any) => {
                return element.id === el.id;
              });
            });

          }
        });
        
  }
  getCorporateData(){
    let grps = this.data?.groups?.map((obj: any) => obj.id);
    this.httpservice.sendPutRequest(URLUtils.getFilterTypeAttachements,
      { 'group_acls': grps, 'attachment_type': 'corporate', 'product': 'corporate' }
      ).subscribe(
          (res: any) => {
                  this.corporateList = res['corporate'];
                  this.corporateList = this.corporateList.filter((el: any) => {
                    return !this.selectedClients.find((element: any) => {
                      return element.id === el.id;
                    });
                  });
                  //console.log('corporateList',this.corporateList)
          }
          )
  }

  selectTeammember(group: any) {
    this.isSaveEnableTM=false;
    this.selectedMembers.push(group);
    let index = this.teammembersList.findIndex((d: any) => d.id === group.id); //find index in your array
    this.teammembersList.splice(index, 1);
    if (this.teammembersList.length == 0) {
      let checkbox = document.getElementById('selectAllMembers') as HTMLInputElement | null;
      if (checkbox != null)
        checkbox.checked = true;
    }
  }
  selectClient(group: any) {
    this.isSaveEnableClient=false;
    this.selectedClients.push(group);
    let index = this.clientsList.findIndex((d: any) => d.id === group.id); //find index in your array
    this.clientsList.splice(index, 1);
    if (this.clientsList.length == 0) {
      let checkbox = document.getElementById('selectAllClients') as HTMLInputElement | null;
      if (checkbox != null)
        checkbox.checked = true;
    }
  }
  selectCorporate(group: any, value?: any) {
    this.selectedClients.push(group);
    let index = this.corporateList.findIndex((d: any) => d.id === group.id); //find index in your array
    this.corporateList.splice(index, 1);
    if (this.corporateList.length == 0) {
        let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
        if (checkbox != null)
            checkbox.checked = true;
    }
    //console.log("Corp selected clients "+JSON.stringify(this.selectedClients));
}
  selectAllMembers(event: any) {
    this.isSaveEnableTM=false;
    if (event?.target?.checked) {
      if (this.teammembersList?.length > 0) {
        if(this.filteredDataTms?.length>0){
          this.selectedMembers = this.selectedMembers.concat(this.filteredDataTms);
          this.teammembersList = this.teammembersList.filter((el: any) => {
            return !this.selectedMembers.find((element: any) => {
              return element.id === el.id;
            });
          });
        }
        else{
        this.selectedMembers = this.selectedMembers.concat(this.teammembersList);
        this.teammembersList = [];
        }
      }
    } else {
      this.teammembersList = this.selectedMembers.concat(this.teammembersList);
      //this.selectedMembers = [this.data.owner];
      this.selectedMembers = [];
    }
  }

  selectAllClients(event: any) {
    this.isSaveEnableClient=false;
    if (event?.target?.checked) {
      if (this.clientsList?.length > 0) {
        if(this.filteredDataClnts?.length>0){
          this.selectedClients = this.selectedClients.concat(this.filteredDataClnts);
          this.clientsList = this.clientsList.filter((el: any) => {
            return !this.selectedClients.find((element: any) => {
              return element.id === el.id;
            });
          });
        }
        else{
        this.selectedClients = this.selectedClients.concat(this.clientsList);
        this.clientsList = [];
        }
      }
    } else {
      this.clientsList = this.selectedClients.concat(this.clientsList);
      this.selectedClients = [];
      this.onFeatureClick('T&C');
    }
  }
  removeTeammember(group: any) {
    this.isSaveEnableTM=false;
    this.showConfirm = true;
    this.gro = group

    // this.confirmationDialogService.confirm('Alert', 'Are you sure you want to remove access for ' + group.name + ' ?',true, 'Yes', 'No')
    //   .then((confirmed) => {
    //     if (confirmed) {
    //       let index = this.selectedMembers.findIndex((d: any) => d.id === group.id); //find index in your array
    //       this.selectedMembers.splice(index, 1);
    //       this.teammembersList.push(group);
    //       if (this.selectedMembers.length == 0) {
    //         let checkbox = document.getElementById('selectAllMembers') as HTMLInputElement | null;
    //         if (checkbox != null)
    //           checkbox.checked = false;
    //       }
    //     }
    //   })
  }

  deleMem(){
    let index = this.selectedMembers.findIndex((d: any) => d.id === this.gro.id); //find index in your array
    this.selectedMembers.splice(index, 1);
    this.teammembersList.push(this.gro);
    if (this.selectedMembers.length == 0 || this.teammembersList.length == 1) {
      let checkbox = document.getElementById('selectAllMembers') as HTMLInputElement | null;
      if (checkbox != null)
        checkbox.checked = false;
    }
    this.showConfirm = false;
}

  removeClient(group: any) {
    this.isSaveEnableClient=false;
    this.confirmationDialogService.confirm('Alert', 'Are you sure you want to remove access for ' + group.name + ' ?',true, 'Yes', 'No')
      .then((confirmed) => {
        if (confirmed) {
          let index = this.selectedClients.findIndex((d: any) => d.id === group.id); //find index in your array
          this.selectedClients.splice(index, 1);
          this.clientsList.push(group);
          if (this.selectedClients.length == 0) {
            let checkbox = document.getElementById('selectAllClients') as HTMLInputElement | null;
            if (checkbox != null)
              checkbox.checked = false;
          }
        }
      })
  }
  onMergeClick(){
    this.onFeatureClick('Document');
  }

  documentDelete(document: any) {
    let index = this.selectedDocuments.findIndex((d: any) => d.docid === document.docid);
    this.selectedDocuments.splice(index, 1);
    this.httpservice.sendPutRequest(URLUtils.generalHistoryDocumentsUpdate(this.data.id), { "documents": this.selectedDocuments }).subscribe(
      (res: any) => {
        //console.log(res);
      });
  }
  saveItems(val: any) {
    let index = this.selectedMembers.findIndex((d: any) => d.id === this.data?.owner?.id); //find index in your array
    this.selectedMembers.splice(index, 1);

    let data = {
      'clients': this.selectedClients,
      'members': this.selectedMembers
    }
    this.httpservice.sendPutRequest(URLUtils.updateGeneralHistoryMembers({ id: this.data.id }), data).subscribe(
      (res: any) => {
        this.onFeatureClick('T&C');
        //this.confirmationDialogService.confirm('Success', res.msg,false, '', '', false,'sm', false);
        if(val === 'members'){
          this.confirmationDialogService.confirm('Success', 'Team Members list updated successfully.', false, '', '', false, 'sm', false);
          let checkbox = document.getElementById('selectAllMembers') as HTMLInputElement | null;
          if (checkbox != null){
            checkbox.checked = false;
          }
        }
        else if(val === 'clients'){
          this.confirmationDialogService.confirm('Success', 'Clients list updated successfully.', false, '', '', false, 'sm', false);
          let checkbox = document.getElementById('selectAllClients') as HTMLInputElement | null;
          if (checkbox != null){
            checkbox.checked = false;
          }
        }
        else{}
      },
      (error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          const errorMessage = error.error.msg || 'Unauthorized';
          this.toast.error(errorMessage);
          //console.log(error);
        }
      }
    )
  }
  cancelItems() {
    this.onFeatureClick('T&C');
    let checkbox = (document.getElementById('selectAllMembers') as HTMLInputElement | null || document.getElementById('selectAllClients') as HTMLInputElement | null);
    if (checkbox != null){
      checkbox.checked = false;
    }
  }
  sort(property: any, docsShared: any) {
    let docs = docsShared;
    this.isDesc = !this.isDesc; //change the direction    
    // this.column = property;
    let direction = this.isDesc ? 1 : -1;

    docs.sort(function (a: any, b: any) {
      if (a[property] < b[property]) {
        return -1 * direction;
      }
      else if (a[property] > b[property]) {
        return 1 * direction;
      }
      else {
        return 0;
      }
    });
  };
  viewDocument(item: any) {
      
    if(item.added_encryption){
       
      var body = new FormData();
      body.append('docid', item.docid)
      body.append('shared_doc',true.toString())
      let url = environment.apiUrl + URLUtils.decryptFile
      this.httpservice.sendPostDecryptRequest(url,body).subscribe((res:any)=>{
          const blob = new Blob([res], { type: item.contentType });
          const url = URL.createObjectURL(blob);
          this.spinnerService.show()
          if(this.allowedFileTypes.includes(item.contentType)){
              let fdata = new FormData();
              fdata.append('file', blob);
              this.httpservice.sendPostDecryptRequest(environment.DOC2FILE,fdata).subscribe((ans:any)=>{
                  const ansBlob = new Blob([ans], { type: 'application/pdf' });
                  const ansUrl = URL.createObjectURL(ansBlob);
                  this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(ansUrl)
                  this.spinnerService.hide()
                  let obj = {
                    'isIframe': true,
                    'url': this.urlSafe
                  }
                  this.confirmationDialogService.confirm('View', obj, true, "Ok", "Close", false, "lg");
              })

          } else{
            
              this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
              this.spinnerService.hide()
              let obj = {
                'isIframe': true,
                'url': this.urlSafe
              }
              this.confirmationDialogService.confirm('View', obj, true, "Ok", "Close", false, "lg");
           
          }   
          this.spinnerService.hide()
        
      })
  } 
  if(item.added_encryption==false)  {
    let id = {'id':item.docid}
      this.httpservice.sendGetRequest(URLUtils.viewDocuments(id)).subscribe((res: any) => {
          if(this.allowedFileTypes.includes(item.contentType)){
              this.spinnerService.show()
              this.httpservice.sendPostDocRequest(this.docapi,{'url':res.data.url}).subscribe((ans:any)=>{
                  const blob = new Blob([ans], { type: 'application/pdf' });
                  // Create a URL for the Blob
                  const url = URL.createObjectURL(blob);
                  this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url)
                  let obj = {
                    'isIframe': true,
                    'url': this.urlSafe
                  }
                  this.confirmationDialogService.confirm('View', obj, true, "Ok", "Close", false, "lg");
                  this.spinnerService.hide()
              })
              

          } else {
            if (res && res.data && !res.error) {
              this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(res.data.url);
              let obj = {
                'isIframe': true,
                'url': this.urlSafe
              }
              this.confirmationDialogService.confirm('View', obj, true, "Ok", "Close", false, "lg");
            }
            else {
              alert(res.msg)
            }
          }
          
          //console.log(" this.view    " + JSON.stringify(this.documents));
      });
  }
  }
  getMergeDocuments() {
    this.httpservice.sendGetRequest(URLUtils.getClientPdfDocuments).subscribe(
        (res: any) => {
          //console.log(res);
          if (!res['error'] && res['docs']?.length > 0) {
            this.documentsList = res['docs'];
            this.selectedDocuments = this.documentsList.filter((el: any) => {
              return this.selectedDocuments?.find((element: any) => {
                return element.docid === el.id;
              });
            });
          }
        })
  }
  getDocuments() {
    var clients: string | any[] = []
    let grps = this.data.groups.map((obj:any) => obj.id);
     clients = this.data.clients.map((obj:any) => obj.id);
    if (this.data.corporate.length > 0) {
      clients = clients.concat(this.data.corporate.map((obj:any) => obj.id));
    }
    this.httpservice.sendPutRequest(URLUtils.getFilterTypeAttachements,
      { 'group_acls': grps, 'attachment_type': 'documents' ,"clients":clients}).subscribe(
        (res: any) => {
          if (!res['error'] && res['documents']?.length > 0) {
            this.documentsList = res['documents'];
            this.documentsList = this.documentsList.filter((el: any) => {
              return !this.selectedDocuments.find((element: any) => {
                return element.docid === el.docid;
              });
            });
          }
        })
  }
  selectDocument(doc: any) {
    this.selectedDocuments.push(doc);
    let index = this.documentsList.findIndex((d: any) => d.docid === doc.docid); //find index in your array
    this.documentsList.splice(index, 1);
    if (this.documentsList.length == 0) {
      let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
      if (checkbox != null)
        checkbox.checked = true;
    }
  }
  removeDocument(doc: any) {
    let index = this.selectedDocuments.findIndex((d: any) => d.docid === doc.docid); //find index in your array
    this.selectedDocuments.splice(index, 1);
    this.documentsList.push(doc);
    if (this.selectedDocuments.length == 0) {
      let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
      if (checkbox != null)
        checkbox.checked = false;
    }
  }
  selectAll(event: any) {
    if (event?.target?.checked) {
      if (this.documentsList?.length > 0) {
        if(this.filteredDataDocs?.length>0){
          this.selectedDocuments = this.selectedDocuments.concat(this.filteredDataDocs);
          this.documentsList = this.documentsList.filter((el: any) => {
            return !this.selectedDocuments.find((element: any) => {
              return element.docid === el.docid;
            });
          });
        }
        else{
        this.selectedDocuments = this.selectedDocuments.concat(this.documentsList);
        this.documentsList = [];
        }
      }
    } else {
      this.documentsList = this.selectedDocuments.concat(this.documentsList);
      this.selectedDocuments = [];
    }
  }
  saveDocuments() {
    this.httpservice.sendPutRequest(URLUtils.generalHistoryDocumentsUpdate(this.data.id), { "documents": this.selectedDocuments }).subscribe(
      (res: any) => {
        //console.log(res);
        this.isNewDocument = false;
        this.httpservice.sendGetRequest(URLUtils.generalHistoryDocuments(this.data.id)).subscribe(
          (res: any) => {
            if (res) {
              this.selectedDocuments = res.documents;
              this.createdBy = localStorage.getItem('name');
              if(this.isMergeEnable)
              this.getMergeDocuments();
              else
              this.getDocuments();
            }
          });
      },
      (error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          const errorMessage = error.error.msg || 'Unauthorized';
          this.toast.error(errorMessage);
          //console.log(error);
        }
      });
  }
  cancelDocuments() {
    this.onFeatureClick('Document');
    this.isNewDocument = false;
  }
  selectMergeDocument(event: any, doc: any) {
    if (event) {
      this.selectedMergeDocuments.push(doc);
      if (this.selectedMergeDocuments.length == this.selectedDocuments.length) {
        let checkbox = document.getElementById('mergeSelectAll') as HTMLInputElement | null;
        if (checkbox != null)
          checkbox.checked = true;
      }
    } else {
      let index = this.selectedMergeDocuments.findIndex((d: any) => d.docid === doc.docid); //find index in your array
      this.selectedMergeDocuments.splice(index, 1);
      if (this.selectedMergeDocuments.length == 0) {
        let checkbox = document.getElementById('mergeSelectAll') as HTMLInputElement | null;
        if (checkbox != null)
          checkbox.checked = false;
      }
    }
  }
  CheckAllOptions(event: any) {
    this.selectedDocuments.forEach((val: any) => { val.checked = event });
    event ? this.selectedMergeDocuments = [...this.selectedDocuments] : this.selectedMergeDocuments = [];
  }
  mergeDoc() {
    localStorage.setItem("selectedDocs", JSON.stringify(this.selectedMergeDocuments));
    this.docService.setData(this.selectedMergeDocuments);
    this.docService.updateDocData(this.selectedMergeDocuments);
    this.router.navigate(['documents/pdfmergedoc/client']);
  }
  public dropped(files: NgxFileDropEntry[]) {
    //this.files = files;
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          //console.log(droppedFile.relativePath, file);
          this.uploadedDocs.push(file);
          this.files.push(file);
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        //console.log(droppedFile.relativePath, fileEntry);
      }
    }
  }
  public handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        this.files.push(file);
        this.uploadedDocs.push(file);
      }
    }
  }

  public fileOver(event: any) {
    //console.log(event);
  }

  public fileLeave(event: any) {
    //console.log(event);
  }
  removeNewDocument(item: any,i:number) {
    if( this.selectedIdx==i){
      this.editDoc = false;
      this.selectedIdx=null;
  }
  if( this.uploadedDocs.length==1){
      this.editMetaData=false;
      this.editDoc = false;
  }
    // let index = this.uploadedDocs.findIndex((d: any) => d.name === item.name);
    this.uploadedDocs.splice(i, 1);
  }
  docEnable(item: any) {
    this.downloadDisabled = item == "enable" ? true : false;
  }
  filterDoc(data: any) {
    if (data == 'editMeta') {
      this.editMetaData = true;
    }
    this.editMetaFlag = data == "editMeta" ? true : false;
  }
  checkAllItem(event: any) {
    if (event) {
      for (let i = 0; i < this.uploadedDocs.length; i++) {
        this.uploadedDocs[i].checked = true;
      }
    } else {
      for (let i = 0; i < this.uploadedDocs.length; i++) {
        this.uploadedDocs[i].checked = false;
      }
    }
  }
  // editDocument(item: any, i: any) {
  //   item.description = ' ';
  //   this.selectedIdx = i;
  //   this.editDoc = true;
  //   //  this.editMeta = item;
  //   if(item.description)
  //   this.documentDetail.controls["description"].setValue(item.description);
  //   this.documentDetail.controls["date_of_filling"].setValue(item.date_of_filling);
  //   this.documentDetail.controls["name"].setValue(item.name);
  // }
  checkedItem(val: any) {
    this.uploadedDocs.forEach((item: any) => {
      if (item.name == val.name) {
        item.checked = true;
      }
    })
  }
  // onSubmit() {
  //   if(this.documentDetail.value.name == ""){
  //     this.toast.error('Please enter the document name');
  //     return;
  //   }
  //   if (this.documentDetail.invalid) {
  //     return;
  //   }
  //   this.uploadedDocs[this.selectedIdx]=this.documentDetail.value;
  //   this.selectedIdx = null;
  //   this.submitted = true;
  //   this.editDoc = false;
  //   this.uploadedDocs.forEach((val: any) => {
  //     //console.log("val     " + JSON.stringify(val));
  //   })
  // }
  editDocument(item: any, i: any) {
    this.selectedIdx = i;
    this.editDoc = true;
    // Set the document name in the description field only if it is empty
    if (!item.description || item.description.trim() === '') {
      this.documentDetail.controls["description"].setValue(item.name);
    } else {
      this.documentDetail.controls["description"].setValue(item.description);
    }
    this.documentDetail.controls["date_of_filling"].setValue(item.date_of_filling);
    this.documentDetail.controls["name"].setValue(item.name);
  }
  
  onSubmit() {
    if (this.documentDetail.value.name == "") {
      this.toast.error('Please enter the document name');
      return;
    }
    // Check if the description is empty and update the name val.
    if (this.documentDetail.value?.description.trim() === "") {
      this.documentDetail.patchValue({ description: this.documentDetail.value.name });
    }

    if (this.documentDetail.invalid) {
      return;
    }
    // Update the selected document with the new values
    this.uploadedDocs[this.selectedIdx] = this.documentDetail.value;
    this.selectedIdx = null;
    this.submitted = true;
    this.editDoc = false;
  }
  onResetTags() {
    this.editMetaFlag = true;
    this.values = [];
  }
  onReset() {
    this.submitted = false;
    //this.documentDetail.reset();
    this.documentDetail.patchValue({
      name: '',
      date_of_filling: null,
      description: ''
    });
    this.editDoc = false;
    this.selectedIdx = null;
    //console.log(this.selectedIdx)
  }

  saveUploadedDocuments() {
    this.confirmationDialogService.confirm('Confirmation', 'Are you sure you want to upload documents to this matter?', true, 'Yes', 'No')
      .then((confirmed) => {
        if (confirmed) {
          const uploadPromises = [];
          for (var i = 0; i < this.uploadedDocs.length; i++) {
            let fdata = new FormData();
            this.description = this.uploadedDocs[i].description?.trim() || this.uploadedDocs[i].name;
            const ids = this.data.groups.map((obj: any) => obj.id);
            const groupAcls = this.data.groupAcls;

            fdata.append('name', this.uploadedDocs[i].name);
            //fdata.append('description', this.uploadedDocs[i].description);
            fdata.append('description', this.description);
            fdata.append('filename', this.uploadedDocs[i].name)
            fdata.append('content_type', this.uploadedDocs[i].type)
            fdata.append('category', "client")
            //fdata.append('group_acls', JSON.stringify(this.data.groupAcls))
            // if (ids.length > 0) {
            //   fdata.append('groups', JSON.stringify(ids))
            // }
            fdata.append('groups', JSON.stringify(groupAcls))
            fdata.append('file', this.files[i])
            let sb = [this.data?.title];
            let mtrs = [this.data?.id];
            // fdata.append('subcategories', JSON.stringify(sb))
            fdata.append('matters', JSON.stringify(mtrs))
            let clients = this.data.clients.concat(this.data.corporate);
            fdata.append('clients', JSON.stringify(clients.map((obj: any) => ({ "id": obj.id, "type": obj.type }))))
            fdata.append('downloadDisabled', this.downloadDisabled.toString());
            fdata.append('metadata', this.uploadedDocs[i].checked == true ? JSON.stringify(this.metaData) : '');
            uploadPromises.push(this.upload(i, fdata, this.uploadedDocs[i]));
          }
          Promise.all(uploadPromises)
            .then((results) => {
              // Process the results if needed
              this.getDocuments();
              // this.AddExistingSelected = true;
              // this.UploadDocSelected = false;
              //this.showAlert('Files uploaded successfully!', false);
              //this.toast.success('Files uploaded successfully!')
            })
            .catch((error) => {
              //this.showAlert(' ' + error, true);
            });
        }
      });
  }
  
  upload(idx: any, file: any,data:any) {
    //return new Promise((resolve, reject) => {
      this.httpservice.sendPostRequest(URLUtils.postDocumentsClient, file).subscribe(
        (res: any) => {
          if (!res.error) {
            let obj = [{
              "docid": res.docid,
              "doctype": 'general',
              "user_id": localStorage.getItem('user_id')
            }];
            var currentDateTime = new Date().toLocaleString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
            let doc = {
              "docid": res.docid,
              "doctype": 'general',
              "user_id": localStorage.getItem('user_id'),
              "name":data.name,
              "description":this.description,
              "added_encryption":false,
              "created": currentDateTime,
              "addedBy":localStorage.getItem('name')
            }
            //console.log('doc',doc)
            this.selectedDocuments.push(doc)
            this.createdBy = localStorage.getItem('name'); //Get value from localStorage
            this.httpservice.sendPutRequest(URLUtils.generalHistoryDocumentsUpdate(this.data.id), { "documents": obj }).subscribe(
              (res: any) => {
                //console.log(res);
              });
            //resolve(res.msg);
            this.toast.success(res.msg)
          } else {
            this.toast.error(res.msg)
            //reject(res.msg);
          }
          this.AddExistingSelected = true;
          this.UploadDocSelected = false;
        }, 
        // (err: any) => {
        //   reject(err.msg);
        // }
        (error: HttpErrorResponse) => {
          if (error.status === 401 || error.status === 403) {
            const errorMessage = error.error.msg || 'Unauthorized';
            this.toast.error(errorMessage);
            //console.log(error);
          }
        }
      );
    //});
  }
  
  showAlert(message: string, isError: boolean) {
    const alertType = isError ? 'Alert' : 'Alert';
    this.confirmationDialogService.confirm(alertType, message, false, '', '', false, 'sm', false);
  }

  onUploadCancel() {
    this.DragAndDropView = true;
    this.uploadedDocs = [];
    this.files=[];
  }
  onMergeCancel(){
    this.selectedDocuments.forEach((val: any) => { val.checked = false });
    this.selectedMergeDocuments = [];
    let checkbox = document.getElementById('mergeSelectAll') as HTMLInputElement | null;
    if (checkbox != null)
      checkbox.checked = false;
  }
  keyup(cat:any){
    //console.log("ghgj"+this.searchText);
    if(cat=='doc'){
    if(this.searchText == ' ')
    this.searchText=this.searchText.replace(/\s/g, "");
    this.filteredDataDocs = this.documentsList.filter((item:any) =>item.name.toLocaleLowerCase().includes(this.searchText));
          let checkbox = document.getElementById('selectAll') as HTMLInputElement | null;
          if (checkbox != null)
            checkbox.checked = false;
    }
    else if(cat=='clnt'){
      if(this.searchTextClient == ' ')
      this.searchTextClient=this.searchTextClient.replace(/\s/g, "");
      this.filteredDataClnts = this.clientsList.filter((item:any) =>item.name.toLocaleLowerCase().includes(this.searchText));
      let checkbox = document.getElementById('selectAllClients') as HTMLInputElement | null;
      if (checkbox != null)
        checkbox.checked = false;
    }
    else if(cat=='tm'){
    if(this.searchTextMembers == ' ')
    this.searchTextMembers=this.searchTextMembers.replace(/\s/g, "");
    this.filteredDataTms = this.teammembersList.filter((item:any) =>item.name.toLocaleLowerCase().includes(this.searchText));
    let checkbox = document.getElementById('selectAllMembers') as HTMLInputElement | null;
    if (checkbox != null)
      checkbox.checked = false;
    }
  }
  onMessageClick() {
    const link =  `/messages/clients`;
    window.location.href = link;
    //this.router.navigate(['/messages/clients'])
  }
  onMessageClickTM() {
    const link =  `/messages/teams`;
    window.location.href = link;
    //this.router.navigate(['/messages/teams']);
  }
  onMailClick() {
    const link =  `/emails`;
    window.location.href = link;
    //this.router.navigate(['/emails'])
  }
  restricttextSpace(event: any) {
    let inputValue: string = event.target.value;
    inputValue = inputValue.replace(/^\s+/, '');
    inputValue = inputValue.replace(/\s{2,}/g, ' ');
    event.target.value = inputValue;
  }

// Grouplist client functions
// uploadMore() {
//   this.uploadDocs = [];
// }
// selectGroupItem(item: any, val: any) {
//   //console.log("--selected item" + JSON.stringify(item) + val);
//   if (val) {
//       item.isChecked = val;
//       this.selectedGroupItems.push(item);
//       //this.selectedGroupItems = this.selectedGroupItems.filter((el:any, i:any, a:any) => i === a.indexOf(el));

//   } else {
//       item.isChecked = val;
//       let index = this.selectedGroupItems.findIndex((d: any) => d.id === item.id);
//       //console.log(item.id);
//       this.selectedGroupItems.splice(index, 1);
//   }
//   localStorage.setItem("groupIds", JSON.stringify(this.selectedGroupItems));
//   //console.log("selected " + JSON.stringify(this.selectedGroupItems));
// }
// removeGroup(item: any) {
//   item.isChecked = false;
//   let index = this.selectedGroupItems.findIndex((d: any) => d.id === item.id); //find index in your array
//   this.selectedGroupItems.splice(index, 1);
//   this.get_all_matters(this.selectedmatterType)
// }
// selectEvent(item: any) {
//   localStorage.setItem("clientData", JSON.stringify(item));
//       this.clientId.push(item);
//       this.httpservice.sendGetRequest(URLUtils.getMattersByClient(item)).subscribe((res: any) => {
//           this.matterList = res?.matterList;
//       });

//       let clientInfo = new Array();
//       this.clientId?.forEach((item: any) => {
//           let clientData = {
//               "id": item.id,
//               "type": item.type
//           };
//           clientInfo.push(clientData);
//       });

//       this.httpservice.sendPutRequest(URLUtils.getGrouplist, { "clients": clientInfo }).subscribe((res: any) => {
//           if (res.error == false) {
//               this.grouplist = res?.data;
//               //Filter and check groups based on the API res.
//               this.selectedGroupItems = this.groupViewItems.filter((groupItem: any) => {
//                   groupItem.isChecked = this.grouplist.some((selectedGroup: any) => selectedGroup.id === groupItem.id);
//                   return groupItem.isChecked;
//               });

//               //Update the checkboxes in groupViewItems
//               // this.groupViewItems.forEach((groupItem: any) => {
//               //     groupItem.isChecked = this.selectedGroupItems.some((selectedGroup: any) => selectedGroup.id === groupItem.id);
//               // });
//           }
//       });
// }
// selectGroup(val: boolean) {
//   this.isSelectGroup = val;
//   if(!val){
//       this.get_all_matters(this.selectedmatterType)
//   }
// }
// onChangeSearch(val: any) {
//   if (val == undefined) {
//       this.clientId = [];
//   }
// }
// onFocused(e: any) {
//   //console.log("onFocused " + JSON.stringify(e));
//   // do something when input is focused
// }
// getClients() {
//   this.relationshipSubscribe = this.httpservice.getFeaturesdata(URLUtils.getAllRelationship).subscribe((res: any) => {
//       this.reldata = res?.data?.relationships;
//       this.httpservice.getFeaturesdata(URLUtils.getCalenderExternal).subscribe((res: any) => {
//           this.corpData = res?.relationships.map((obj:any)=>({ "id": obj.id, "type": "corporate" ,"name":obj.name}))
//           this.clientdata = this.reldata.concat(this.corpData)
//       });
      
//   });

//   this.httpservice.sendGetRequest(URLUtils.getGroups).subscribe((res: any) => {
//     this.groupViewItems = res?.data;
//     this.groupViewItems.forEach((item: any) => {
//         item.isChecked = false;
//     })
// })
// }
// get_all_matters(type:any,event?:any){
//   this.spinnerService.show()
//   let selectedGroups: any = [];
//   this.selectedGroupItems?.forEach((item: any) => {
//       selectedGroups.push(item.id)
//   })
//   let payload = {"grp_acls":selectedGroups}
//   if(type=='internal'){
//       this.httpservice.sendPutRequest(URLUtils.getAllMatters,payload).subscribe((res:any)=>{
//           if(res.error == false){
//               this.corp_matter_list = res.matterList
//               this.spinnerService.hide()
//           } else {
//               this.spinnerService.hide()
//           }
//       },(err:any)=>{
//           console.log(err)
//           this.spinnerService.hide()
//       })
//   }
//   if(type == 'external'){
//       this.httpservice.sendPutRequest(URLUtils.getAllExternalMatters,payload).subscribe((res:any)=>{
//           if(res){
//               this.corp_matter_list = res.matterList
//               this.spinnerService.hide()
//           }
//       },(err:any)=>{
//           this.spinnerService.hide()
//       })

//   }
// }
}