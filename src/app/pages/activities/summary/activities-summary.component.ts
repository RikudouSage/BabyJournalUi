import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {TitleService} from "../../../services/title.service";
import {ActivityStream, ApiService} from "../../../services/api.service";
import {FormControl, FormGroup} from "@angular/forms";
import {Observable, tap} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";

@Component({
  selector: 'app-summary',
  templateUrl: './activities-summary.component.html',
  styleUrls: ['./activities-summary.component.scss']
})
export class ActivitiesSummaryComponent implements OnInit {
  private fullActivityStream: ActivityStream | null = null;
  public changeDateForm = new FormGroup({
    date: <FormControl<Date>>new FormControl(new Date()),
  })
  public activityStream: ActivityStream = [];
  public loading = true;

  isHandset: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly translator: TranslateService,
    private readonly titleService: TitleService,
    private readonly apiService: ApiService,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('Activities summary');
    this.apiService.getActivityStream().subscribe(async activityStream => {
      this.fullActivityStream = await activityStream;
      this.reloadActivitiesForDate(this.changeDateForm.controls.date.value);
    });
    this.changeDateForm.controls.date.valueChanges.subscribe(date => this.reloadActivitiesForDate(date));
  }

  public datePickerFilter(date: Date | null): boolean {
    date ??= new Date();
    const now = new Date();
    const max = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

    return date.getTime() < max.getTime();
  }

  private reloadActivitiesForDate(date: Date) {
    if (this.fullActivityStream === null) {
      return;
    }

    this.loading = true;
    this.activityStream = this.fullActivityStream.filter(item => {
      const activityDate = new Date(item.startTime);

      return date.getFullYear() === activityDate.getFullYear()
          && date.getMonth() === activityDate.getMonth()
          && date.getDate() === activityDate.getDate();
    });
    this.loading = false;
  }

}
