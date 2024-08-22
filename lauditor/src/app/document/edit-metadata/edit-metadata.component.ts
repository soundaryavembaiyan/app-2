import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from 'src/app/model/model.service';
import { HttpService } from 'src/app/services/http.service';
import { URLUtils } from 'src/app/urlUtils';
import { DocumentService } from '../document.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
 

@Component({
    selector: 'edit-metadata',
    templateUrl: 'edit-metadata.component.html',
    styleUrls: ['edit-metadata.component.scss']
})
export class EditMetadataComponent implements OnInit {
    imageUrl: any;
    values: any = [];
    tags = { 'tagtype': '', 'tag': '' };
    data: any;
    product = environment.product;
    saveDoc = false;

    constructor(private router: Router, private httpservice: HttpService, private toast: ToastrService, private documentService: DocumentService, private modalService: ModalService) {

    }
    ngOnInit(): void {
        this.data = this.documentService.getItems();
        //console.log('meta data',this.data.tags)
        if (this.data == undefined || this.data == null || this.data == '') {
            this.router.navigate(['documents/view/client']);
        } else {
            // Check if there are tags and add them to the values array
            if (this.data.tags && this.data.tags.length > 0) {
                this.data.tags.forEach((tag: any[]) => {
                    this.addvalue({ tagtype: tag[0], tag: tag[1] });
                });
            }
        }
        //console.log("edit metadata    " + JSON.stringify(this.data));
    }

    removevalue(i: any) {
        if(i === 0){
            this.saveDoc = false;
        }
        this.values.splice(i, 1);
    }

    // addvalue(val?:any) {
    //     this.saveDoc=true;
    //     this.values.push({ tagtype: "", tag: "" });
    // }

    addvalue(val?: { tagtype: string; tag: string }) {
        this.saveDoc = true;
        this.values.push(val || { tagtype: "", tag: "" });
    }

    submit() {

        //console.log(JSON.stringify(this.values));
    }
    conform(doc: any) {
        this.modalService.open(doc);
    }


    addTags() {
        let resultObj:any={};
        let isValid = true;

        this.values.forEach((item: any) => {
            if (!item.tagtype || item.tagtype.trim() === "" || !item.tag || item.tag.trim() === "") {
                isValid = false;
            }
            resultObj[item.tagtype] = item.tag;
        });
        if (!isValid) {
            this.toast.error('Please provide valid Tag values to proceed.');
            return;
        }
        //console.log("tagsArray  " + resultObj);
        let obj = {
            name: this.data.name,
            tags:   resultObj 
        }
        //console.log("obj  " + JSON.stringify(obj));
        if (Object.keys(obj.tags).length === 0 || Object.values(obj.tags).every((tag:any) => tag.trim() === '')) {
            this.toast.error('Please provide valid Tag values to proceed.');
            return;
        }

        this.httpservice.sendPutRequest(URLUtils.updateMergedpdfTags(this.data), obj).subscribe((res: any) => {
            if (res.error == false) {
                this.modalService.open('doc-edimeta-data');
                
            }
        },
        (error: HttpErrorResponse) => {
            if (error.status === 401 || error.status === 403) {
              const errorMessage = error.error.msg || 'Unauthorized';
              this.toast.error(errorMessage);
              console.log(error);
            }
          });
    }
    
    closeModal(id: any) {
        this.modalService.close(id);
    }
    openModel(id: any) {
        this.modalService.open(id);
    }
    cancel() {
        let isMergeDoc: any = {
            isMerge: true
        };
        this.documentService.addToService(isMergeDoc);
        //this.router.navigate(['documents/view/client']);
        if(this.product == 'corporate'){
            this.router.navigate(['documents/view/firm']);
          }
          else{
          this.router.navigate(['documents/view/client']);
          }
      }
      restricttextSpace(event: any) {
        let inputValue: string = event.target.value;
        inputValue = inputValue.replace(/^\s+/, '');
        inputValue = inputValue.replace(/\s{2,}/g, ' ');
        event.target.value = inputValue;
      }
}
