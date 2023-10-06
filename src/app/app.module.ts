import {isDevMode, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {LayoutModule} from '@angular/cdk/layout';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {RegisterComponent} from './pages/auth/register/register.component';
import {ActivityListComponent} from './pages/activities/activity-list/activity-list.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from "@angular/common/http";
import {AuthInterceptor} from "./services/auth-interceptor.service";
import {CreateChildComponent} from './pages/children/create-child/create-child.component';
import {MatRadioModule} from "@angular/material/radio";
import {MatSelectModule} from "@angular/material/select";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MAT_DATE_LOCALE, MatNativeDateModule} from "@angular/material/core";
import {SelectChildComponent} from './pages/children/select-child/select-child.component';
import {PotentiallyEncryptedValuePipe} from './pipes/potentially-encrypted-value.pipe';
import {
  ACTIVITY_CONFIGURATIONS,
  MEASUREMENTS_ACTIVITY_CONFIGURATIONS,
  MEDICAL_ACTIVITY_CONFIGURATIONS
} from "./dependency-injection/injection-tokens";
import {FeedingActivityConfiguration} from "./activity/main/feeding.activity-configuration";
import {DiaperingActivityConfiguration} from "./activity/main/diapering.activity-configuration";
import {FeedingActivityComponent} from './pages/activities/feeding/feeding-activity.component';
import {MissingTranslationHandler, TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {AppMissingTranslationsHandler} from "./services/app-missing-translations-handler";
import {LogoutComponent} from './pages/auth/logout/logout.component';
import {SettingsComponent} from './pages/settings/settings/settings.component';
import {AccountSettingsComponent} from './pages/settings/account/account-settings.component';
import {ChangeNameDialogComponent} from './components/dialogs/change-name-dialog/change-name-dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {ExportAccountComponent} from './pages/settings/export-account/export-account.component';
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {SharingComponent} from './pages/settings/sharing/sharing.component';
import {TypePipe} from './pipes/type.pipe';
import {InviteComponent} from './pages/settings/invite/invite.component';
import {ConfirmDialog} from './components/dialogs/confirm-dialog/confirm-dialog.component';
import {BrowserUnsupportedComponent} from './pages/general/browser-unsupported/browser-unsupported.component';
import {MatTabsModule} from "@angular/material/tabs";
import {MtxDatetimepickerModule} from "@ng-matero/extensions/datetimepicker";
import {MtxNativeDatetimeModule} from "@ng-matero/extensions/core";
import {TimeOrNullPipe} from './pipes/time-or-null.pipe';
import {ElapsedTimePipe} from './pipes/elapsed-time.pipe';
import {TrackerComponent} from './components/tracker/tracker.component';
import {DateOrNullPipe} from './pipes/date-or-null.pipe';
import {ServiceWorkerModule} from '@angular/service-worker';
import {ActivitiesSummaryComponent} from './pages/activities/summary/activities-summary.component';
import {InternalErrorComponent} from './pages/general/internal-error/internal-error.component';
import {ActivityEventComponent} from './components/activity-event/activity-event.component';
import {PrivacyComponent} from './pages/general/privacy/privacy.component';
import {RelativeDatePipe} from './pipes/relative-date.pipe';
import {GeneralSettingsComponent} from './pages/settings/general/general-settings.component';
import {UppercaseFirstPipe} from './pipes/uppercase-first.pipe';
import {DateDiffPipe} from './pipes/date-diff.pipe';
import {SecondsToDurationStringPipe} from './pipes/seconds-to-duration-string.pipe';
import {DiaperingActivityComponent} from './pages/activities/diapering/diapering-activity.component';
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {FullDataRefreshComponent} from './pages/general/full-data-refresh/full-data-refresh.component';
import {EditFeedingComponent} from './pages/activities/edit-feeding/edit-feeding.component';
import {EditDiaperingComponent} from './pages/activities/edit-diapering/edit-diapering.component';
import {PoopColorSelectComponent} from './components/poop-color-select/poop-color-select.component';
import {MatCheckboxModule} from "@angular/material/checkbox";
import {PumpingActivityComponent} from './pages/activities/pumping/pumping-activity.component';
import {PumpingActivityConfiguration} from "./activity/main/pumping.activity-configuration";
import {ParentSelectComponent} from './components/parent-select/parent-select.component';
import {getBrowserLanguages} from "./helper/language";
import {AboutComponent} from './pages/general/about/about.component';
import {EditPumpingComponent} from './pages/activities/edit-pumping/edit-pumping.component';
import {SleepingActivityConfiguration} from "./activity/main/sleeping.activity-configuration";
import {SleepingActivityComponent} from './pages/activities/sleeping/sleeping-activity.component';
import {EditSleepingComponent} from './pages/activities/edit-sleeping/edit-sleeping.component';
import {ObjectKeysPipe} from './pipes/object-keys.pipe';
import {ActivitySettingsComponent} from './pages/settings/activity/activity-settings.component';
import {MeasurementsActivityConfiguration} from "./activity/main/measurements.activity-configuration";
import {WeighingActivityConfiguration} from "./activity/measurements/weighing.activity-configuration";
import {WeighingActivityComponent} from './pages/activities/measurements/weighing/weighing-activity.component';
import {
  MeasurementsActivityComponent
} from './pages/activities/measurements/measurements/measurements-activity.component';
import { LowercaseFirstPipe } from './pipes/lowercase-first.pipe';
import { WeighingEditComponent } from './pages/activities/measurements/weighing-edit/weighing-edit.component';
import {TemperatureActivityConfiguration} from "./activity/medical/temperature.activity-configuration";
import { TemperatureActivityComponent } from './pages/activities/medical/temperature/temperature-activity.component';
import {MedicalActivityConfiguration} from "./activity/main/medical.activity-configuration";
import { MedicalActivityComponent } from './pages/activities/medical/medical/medical-activity.component';
import { TemperatureEditComponent } from './pages/activities/medical/temperature-edit/temperature-edit.component';
import {LengthActivityConfiguration} from "./activity/measurements/length-activity.configuration";
import { LengthActivityComponent } from './pages/activities/measurements/length/length-activity.component';
import { LengthEditComponent } from './pages/activities/measurements/length-edit/length-edit.component';
import { LanguageNamePipe } from './pipes/language-name.pipe';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, `./assets/translations/`, '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    ActivityListComponent,
    CreateChildComponent,
    SelectChildComponent,
    PotentiallyEncryptedValuePipe,
    FeedingActivityComponent,
    LogoutComponent,
    SettingsComponent,
    AccountSettingsComponent,
    ChangeNameDialogComponent,
    ExportAccountComponent,
    SharingComponent,
    TypePipe,
    InviteComponent,
    ConfirmDialog,
    BrowserUnsupportedComponent,
    TimeOrNullPipe,
    ElapsedTimePipe,
    TrackerComponent,
    DateOrNullPipe,
    ActivitiesSummaryComponent,
    InternalErrorComponent,
    ActivityEventComponent,
    PrivacyComponent,
    RelativeDatePipe,
    GeneralSettingsComponent,
    UppercaseFirstPipe,
    DateDiffPipe,
    SecondsToDurationStringPipe,
    DiaperingActivityComponent,
    FullDataRefreshComponent,
    EditFeedingComponent,
    EditDiaperingComponent,
    PoopColorSelectComponent,
    PumpingActivityComponent,
    ParentSelectComponent,
    AboutComponent,
    EditPumpingComponent,
    SleepingActivityComponent,
    EditSleepingComponent,
    ObjectKeysPipe,
    ActivitySettingsComponent,
    WeighingActivityComponent,
    MeasurementsActivityComponent,
    LowercaseFirstPipe,
    WeighingEditComponent,
    TemperatureActivityComponent,
    MedicalActivityComponent,
    TemperatureEditComponent,
    LengthActivityComponent,
    LengthEditComponent,
    LanguageNamePipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    LayoutModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    ReactiveFormsModule,
    MatInputModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    MatRadioModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      defaultLanguage: 'en',
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: AppMissingTranslationsHandler,
      },
    }),
    MatDialogModule,
    FormsModule,
    MatSnackBarModule,
    MatTabsModule,
    MtxDatetimepickerModule,
    MtxNativeDatetimeModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    MatButtonToggleModule,
    MatCheckboxModule,
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    {provide: ACTIVITY_CONFIGURATIONS, useClass: FeedingActivityConfiguration, multi: true},
    {provide: ACTIVITY_CONFIGURATIONS, useClass: DiaperingActivityConfiguration, multi: true},
    {provide: ACTIVITY_CONFIGURATIONS, useClass: PumpingActivityConfiguration, multi: true},
    {provide: ACTIVITY_CONFIGURATIONS, useClass: SleepingActivityConfiguration, multi: true},
    {provide: ACTIVITY_CONFIGURATIONS, useClass: MedicalActivityConfiguration, multi: true},
    {provide: ACTIVITY_CONFIGURATIONS, useClass: MeasurementsActivityConfiguration, multi: true},
    // {provide: ACTIVITY_CONFIGURATIONS, useClass: LeisureActivityConfiguration, multi: true},
    // {provide: ACTIVITY_CONFIGURATIONS, useClass: MedicalActivityConfiguration, multi: true},
    // {provide: ACTIVITY_CONFIGURATIONS, useClass: OtherActivityConfiguration, multi: true},
    {provide: MEASUREMENTS_ACTIVITY_CONFIGURATIONS, useClass: WeighingActivityConfiguration, multi: true},
    {provide: MEASUREMENTS_ACTIVITY_CONFIGURATIONS, useClass: LengthActivityConfiguration, multi: true},
    {provide: MEDICAL_ACTIVITY_CONFIGURATIONS, useClass: TemperatureActivityConfiguration, multi: true},
    {provide: MAT_DATE_LOCALE, useValue: getBrowserLanguages()},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
