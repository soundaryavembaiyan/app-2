import { Component, OnInit } from '@angular/core';
import { ngxCsv } from 'ngx-csv';
import { HttpService } from 'src/app/services/http.service';
import { URLUtils } from 'src/app/urlUtils';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'aggregate-projects',
    templateUrl: 'aggregate-projects.component.html',
    styleUrls: ['aggregate-projects.component.scss']
})
export class AggregateProjectsComponent implements OnInit {

    minDate = new Date();
    maxDate = new Date();
    projectsMember: any;
    viewMode: any = 'week';
    projectData: any;
    isReverse:boolean=false;
    list:any;
    calendarDates:any;
    grandTotal:any;
    searchTeam:any;
    product = environment.product;
    fromDate:any;
    toDate:any;
    client:any;
    
    constructor(private httpService: HttpService) {

    }
    ngOnInit() {
        this.weekView();

    }
    getLength(length:any) {
        if (length == 0)
          return 1
        //   //console.log("length "+length);
        return length
       
      }
      getClientNames(clients:any){
        var html = "<p>"
        for (let item of clients){
          html += `${item},<br>`
        }
    
        html += "</p>"
        // //console.log("html "+html)
        return html
    
      }
    formateDate() {
      const startDate = new Date(this.projectsMember?.dates?.start);
      const endDate = new Date(this.projectsMember?.dates?.end);
      // Define arrays for days and months
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      // Format the start and end dates
      const startDayFormatted = `${days[startDate.getDay()]}, ${months[startDate.getMonth()]} ${startDate.getDate()}, ${startDate.getFullYear()}`;
      const endDayFormatted = `${days[endDate.getDay()]}, ${months[endDate.getMonth()]} ${endDate.getDate()}, ${endDate.getFullYear()}`;

      // Assign to component properties for binding to the template
      this.fromDate = `${startDayFormatted}`;
      this.toDate = `${endDayFormatted}`;
    }
    weekView() {
        this.httpService.sendGetRequest(URLUtils.aggregateProjects).subscribe((res: any) => {
            this.projectsMember = res;
            this.list = res.timesheets.data;
            this.calendarDates = res.dates;
            this.grandTotal=res.timesheets.grandTotal;
            this.formateDate();
            // //console.log(" list"  +JSON.stringify(this.list));
        })
    }
    monthView(){
        this.httpService.sendGetRequest(URLUtils.aggregateProjectMounthView).subscribe((res: any) => {
            this.projectsMember = res;
            this.list = res.timesheets?.data;
            this.calendarDates = res.dates;
            this.grandTotal=res.timesheets.grandTotal;
            this.formateDate();
            //console.log(" list"  +JSON.stringify(this.list));
        })
    }
    
    preAndNextMonth(data: any) {
        this.httpService.sendGetRequest(URLUtils.aggregateProjectDataMonthByMonth(data)).subscribe((res: any) => {
            this.projectsMember = res;
            this.list = res?.timesheets?.data;
            this.calendarDates = res.dates;
            this.grandTotal=res.timesheets.grandTotal;
            this.formateDate();
            // //console.log(" list"  +JSON.stringify(this.list));
        });

    }
    preAndNextWeek(data: any) {
        this.httpService.sendGetRequest(URLUtils.aggregateProjectDataWeekByWeek(data)).subscribe((res: any) => {
            this.projectsMember = res;
            this.list = res?.timesheets?.data;
            this.calendarDates = res.dates;
            this.grandTotal=res.timesheets.grandTotal;
            this.formateDate();
            // //console.log(" list"  +JSON.stringify(this.list));
        });

    }
    projectWeekSort(val: any) {
        this.isReverse = !this.isReverse;
        if (this.isReverse) {
            this.list = this.list?.sort((p1: any, p2: any) => (p1[val] < p2[val]) ? 1 : (p1[val] > p2[val]) ? -1 : 0);
        } else {
            this.list = this.list?.sort((p1: any, p2: any) => (p1[val] > p2[val]) ? 1 : (p1[val] < p2[val]) ? -1 : 0);
        }
    }
    downloadCSV() {
      let totalBillable = 0;
      let totalNonBillable = 0;
      let totalHoursSum = 0;
        var exportcsvList = []
        if (this.viewMode == 'week') {
            var csvOptions = {
                fieldSeparator: ',',
                quoteStrings: '"',
                decimalseparator: '.',
                showLabels: true,
                showTitle: true,
                title: 'Aggregate Timesheet Project -- ' + this.calendarDates['start'] + ' to ' + this.calendarDates['end'],
                useBom: true,
                noDownload: false,
                headers: ["Case Number", "Project", "Client Name", "Team Member", "Billable", "Non Billable", "Total"]
              }

              for (let item of this.list) {
                for (let tm of item['teamMembers']) {
                  // for (let c of item['clientNames']) {
                  //   this.client = c;
                  // }

                    let totalHours = tm['billableHours'] + tm['nonBillableHours'];  // Calculate the total for each entr
                    totalBillable += tm['billableHours'];  // Accumulate billable hours
                    totalNonBillable += tm['nonBillableHours'];  // Accumulate non-billable hours
                    totalHoursSum += totalHours;  // Accumulate total hours

                    let client = item.clientNames.join(', ')

                  var mdata = { "case_no": item['caseNo'], 'project': item['projectName'], "client_name": client, 'tm_name': tm['name'], "billable": tm['billableHours'], 'non_billable': tm['nonBillablehours'], 'total': tm['total']}
                  exportcsvList.push(mdata)
                  // console.log('mdata',mdata)
                }
              }

              // After processing all entries, append the grand total
              var totalData = {
                "case_no": 'Total',
                "project": '',
                "client_name": '',
                "tm_name": '',
                "billable": this.grandTotal.billable,  // Format the grand total for billable hours
                "non_billable": this.grandTotal.nonbillable,  // Format the grand total for non-billable hours
                "total": this.grandTotal.total  // Format the overall total hours
              };
              exportcsvList.push(totalData);
            const fileInfo = new ngxCsv(exportcsvList, "AggregateTimesheetTeamMemberWeek", csvOptions);
            // new AngularCsv(exportcsvList, "AggregateTimesheetTeamMemberWeek", this.csvOptions);
        }
        // else if (this.viewMode == 'month') {
        //     var csvOptions = {
        //         fieldSeparator: ',',
        //         quoteStrings: '"',
        //         decimalseparator: '.',
        //         showLabels: true,
        //         showTitle: true,
        //         title: 'Aggregate Timesheet Project -- ' + this.calendarDates['start'] + ' to ' + this.calendarDates['end'],
        //         useBom: true,
        //         noDownload: false,
        //         headers: ["Case Number", "Project", "Client Name", "Team Member", "Billable", "Non Billable", "Total"]
        //       }
        //       for (let item of this.list) {
        //         for (let tm of item['teamMembers']) {
        //           let totalHours = tm['billableHours'] + tm['nonBillableHours'];  // Calculate the total for each entr
        //             totalBillable += tm['billableHours'];  // Accumulate billable hours
        //             totalNonBillable += tm['nonBillableHours'];  // Accumulate non-billable hours
        //             totalHoursSum += totalHours;  // Accumulate total hours
        //           var mdata = { "case_no": item['caseNo'], 'project': item['projectName'], "client_name": item['clientName'], 'tm_name': tm['name'], "billable": tm['billableHours'], 'non_billable': tm['nonBillablehours'], 'total': tm['total']}
        //           exportcsvList.push(mdata)
        //         }
        //       }
        //       // After processing all entries, append the grand total
        //       var totalData = {
        //         "case_no": 'Total',
        //         "project": '',
        //         "client_name": '',
        //         "tm_name": '',
        //         "billable": totalBillable + ':0',  // Format the grand total for billable hours
        //         "non_billable": totalNonBillable + ':0',  // Format the grand total for non-billable hours
        //         "total": totalHoursSum + ':0'  // Format the overall total hours
        //       };
        //       exportcsvList.push(totalData);
        //     const fileInfo = new ngxCsv(exportcsvList, "AggregateTimesheetTeamMember",csvOptions);
        //     // new AngularCsv(exportcsvList, "AggregateTimesheetTeamMemberMonth", this.csvOptions);
        // }
    }
}
