import {NgModule} from '@angular/core';
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
import {ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {AuthInterceptor} from "./services/auth-interceptor.service";
import { CreateChildComponent } from './pages/children/create-child/create-child.component';
import {MatRadioModule} from "@angular/material/radio";
import {MatSelectModule} from "@angular/material/select";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import { SelectChildComponent } from './pages/children/select-child/select-child.component';
import { EncryptedOrStringValuePipe } from './pipes/encrypted-or-string-value.pipe';
import {ACTIVITIES} from "./dependency-injection/injection-tokens";
import {FeedingActivity} from "./activity/feeding.activity";
import {DiaperingActivity} from "./activity/diapering.activity";
import {SleepingActivity} from "./activity/sleeping.activity";
import {LeisureActivity} from "./activity/leisure.activity";
import {MedicalActivity} from "./activity/medical.activity";
import {OtherActivity} from "./activity/other.activity";
import { FeedingComponent } from './pages/activities/feeding/feeding.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    ActivityListComponent,
    CreateChildComponent,
    SelectChildComponent,
    EncryptedOrStringValuePipe,
    FeedingComponent,
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
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    {provide: ACTIVITIES, useClass: FeedingActivity, multi: true},
    {provide: ACTIVITIES, useClass: DiaperingActivity, multi: true},
    {provide: ACTIVITIES, useClass: SleepingActivity, multi: true},
    {provide: ACTIVITIES, useClass: LeisureActivity, multi: true},
    {provide: ACTIVITIES, useClass: MedicalActivity, multi: true},
    {provide: ACTIVITIES, useClass: OtherActivity, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
