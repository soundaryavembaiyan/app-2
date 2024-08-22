import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from 'src/app/services/http.service';
import { URLUtils } from 'src/app/urlUtils';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-document',
  templateUrl: './view-document.component.html',
  styleUrls: ['./view-document.component.scss']
})
export class ViewDocumentComponent {

  @Input() doc: any;
  pdfSrc: any;
  docapi = environment.doc2pdf
  allowedFileTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/rtf','text/csv','text/rtf'];
  //allowedFileTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/rtf', 'text/csv'];

  constructor(private httpservice: HttpService, private toast: ToastrService,
    private router: Router, public sanitizer: DomSanitizer, private spinnerService: NgxSpinnerService) { }


  ngOnInit(): void {

    if (this.doc.added_encryption) {
      var body = new FormData();
      body.append('docid', this.doc?.id)
      this.httpservice.sendPatchRequest(URLUtils.decryptFile, body).subscribe((res: any) => {
        this.pdfSrc = res
      })
    }
    this.httpservice.sendGetRequest(URLUtils.viewDocuments(this.doc)).subscribe((res: any) => {
      if (this.allowedFileTypes.includes(this.doc?.content_type)) {
        this.spinnerService.show()
        this.httpservice.sendPostDocRequest(this.docapi, { 'url': res.data.url }).subscribe((ans: any) => {
          const blob = new Blob([ans], { type: 'application/pdf' });
          // Create a URL for the Blob
          const url = URL.createObjectURL(blob);
          this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url)
          this.spinnerService.hide()
        })
      } else {
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(res.data.url);
      }
      //console.log(" this.view    " + JSON.stringify(this.documents));
    });
  }
}
