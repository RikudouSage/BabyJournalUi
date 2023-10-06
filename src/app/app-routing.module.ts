import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RegisterComponent} from "./pages/auth/register/register.component";
import {ActivityListComponent} from "./pages/activities/activity-list/activity-list.component";
import {CreateChildComponent} from "./pages/children/create-child/create-child.component";
import {SelectChildComponent} from "./pages/children/select-child/select-child.component";
import {FeedingActivityComponent} from "./pages/activities/feeding/feeding-activity.component";
import {LogoutComponent} from "./pages/auth/logout/logout.component";
import {SettingsComponent} from "./pages/settings/settings/settings.component";
import {AccountSettingsComponent} from "./pages/settings/account/account-settings.component";
import {ExportAccountComponent} from "./pages/settings/export-account/export-account.component";
import {SharingComponent} from "./pages/settings/sharing/sharing.component";
import {InviteComponent} from "./pages/settings/invite/invite.component";
import {BrowserUnsupportedComponent} from "./pages/general/browser-unsupported/browser-unsupported.component";
import {ActivitiesSummaryComponent} from "./pages/activities/summary/activities-summary.component";
import {InternalErrorComponent} from "./pages/general/internal-error/internal-error.component";
import {PrivacyComponent} from "./pages/general/privacy/privacy.component";
import {GeneralSettingsComponent} from "./pages/settings/general/general-settings.component";
import {DiaperingActivityComponent} from "./pages/activities/diapering/diapering-activity.component";
import {FullDataRefreshComponent} from "./pages/general/full-data-refresh/full-data-refresh.component";
import {IsLoggedInGuard} from "./guards/is-logged-in.guard";
import {BrowserSupportGuard} from "./guards/browser-support.guard";
import {ChildIsSelectedGuard} from "./guards/child-is-selected.guard";
import {HasChildrenGuard} from "./guards/has-children.guard";
import {InitialLoadFinishedGuard} from "./guards/initial-load-finished.guard";
import {EditFeedingComponent} from "./pages/activities/edit-feeding/edit-feeding.component";
import {EditDiaperingComponent} from "./pages/activities/edit-diapering/edit-diapering.component";
import {PumpingActivityComponent} from "./pages/activities/pumping/pumping-activity.component";
import {AboutComponent} from "./pages/general/about/about.component";
import {EditPumpingComponent} from "./pages/activities/edit-pumping/edit-pumping.component";
import {SleepingActivityComponent} from "./pages/activities/sleeping/sleeping-activity.component";
import {EditSleepingComponent} from "./pages/activities/edit-sleeping/edit-sleeping.component";
import {ActivitySettingsComponent} from "./pages/settings/activity/activity-settings.component";
import {
  MeasurementsActivityComponent
} from "./pages/activities/measurements/measurements/measurements-activity.component";
import {WeighingActivityComponent} from "./pages/activities/measurements/weighing/weighing-activity.component";
import {WeighingEditComponent} from "./pages/activities/measurements/weighing-edit/weighing-edit.component";
import {TemperatureActivityComponent} from "./pages/activities/medical/temperature/temperature-activity.component";
import {MedicalActivityComponent} from "./pages/activities/medical/medical/medical-activity.component";
import {TemperatureEditComponent} from "./pages/activities/medical/temperature-edit/temperature-edit.component";
import {LengthActivityComponent} from "./pages/activities/measurements/length/length-activity.component";
import {LengthEditComponent} from "./pages/activities/measurements/length-edit/length-edit.component";

const routes: Routes = [
  {
    path: 'auth/register',
    component: RegisterComponent,
    canActivate: [
      BrowserSupportGuard,
    ],
  },
  {
    path: 'auth/logout',
    component: LogoutComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
    ],
  },
  {
    path: '',
    component: ActivityListComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
      HasChildrenGuard,
      ChildIsSelectedGuard,
      InitialLoadFinishedGuard,
    ],
  },
  {
    path: 'activities/summary',
    component: ActivitiesSummaryComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
      HasChildrenGuard,
      ChildIsSelectedGuard,
      InitialLoadFinishedGuard,
    ],
  },
  {
    path: 'activities/feeding',
    component: FeedingActivityComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
      HasChildrenGuard,
      ChildIsSelectedGuard,
      InitialLoadFinishedGuard,
    ],
  },
  {
    path: 'activities/sleeping',
    component: SleepingActivityComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
      HasChildrenGuard,
      ChildIsSelectedGuard,
      InitialLoadFinishedGuard,
    ],
  },
  {
    path: 'activities/feeding/edit/:id',
    component: EditFeedingComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
      HasChildrenGuard,
      ChildIsSelectedGuard,
    ],
  },
  {
    path: 'activities/diapering/edit/:id',
    component: EditDiaperingComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
      HasChildrenGuard,
      ChildIsSelectedGuard,
    ],
  },
  {
    path: 'activities/pumping/edit/:id',
    component: EditPumpingComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
      HasChildrenGuard,
      ChildIsSelectedGuard,
    ],
  },
  {
    path: 'activities/sleeping/edit/:id',
    component: EditSleepingComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
      HasChildrenGuard,
      ChildIsSelectedGuard,
    ],
  },
  {
    path: 'activities/weighing/edit/:id',
    component: WeighingEditComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
      HasChildrenGuard,
      ChildIsSelectedGuard,
    ],
  },
  {
    path: 'activities/length/edit/:id',
    component: LengthEditComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
      HasChildrenGuard,
      ChildIsSelectedGuard,
    ],
  },
  {
    path: 'activities/temperature/edit/:id',
    component: TemperatureEditComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
      HasChildrenGuard,
      ChildIsSelectedGuard,
    ],
  },
  {
    path: 'activities/diapering',
    component: DiaperingActivityComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
      HasChildrenGuard,
      ChildIsSelectedGuard,
      InitialLoadFinishedGuard,
    ],
  },
  {
    path: 'activities/pumping',
    component: PumpingActivityComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
      HasChildrenGuard,
      ChildIsSelectedGuard,
      InitialLoadFinishedGuard,
    ],
  },
  {
    path: 'activities/measurements',
    component: MeasurementsActivityComponent,
    children: [
      {
        path: 'weight',
        component: WeighingActivityComponent,
      },
      {
        path: 'length',
        component: LengthActivityComponent,
      },
    ],
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
      HasChildrenGuard,
      ChildIsSelectedGuard,
      InitialLoadFinishedGuard,
    ],
    canActivateChild: [
      BrowserSupportGuard,
      IsLoggedInGuard,
      HasChildrenGuard,
      ChildIsSelectedGuard,
      InitialLoadFinishedGuard,
    ],
  },
  {
    path: 'activities/health',
    component: MedicalActivityComponent,
    children: [
      {
        path: 'temperature',
        component: TemperatureActivityComponent,
      },
    ],
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
      HasChildrenGuard,
      ChildIsSelectedGuard,
      InitialLoadFinishedGuard,
    ],
    canActivateChild: [
      BrowserSupportGuard,
      IsLoggedInGuard,
      HasChildrenGuard,
      ChildIsSelectedGuard,
      InitialLoadFinishedGuard,
    ],
  },
  {
    path: 'children/create-first',
    component: CreateChildComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
    ],
  },
  {
    path: 'children/add',
    component: CreateChildComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
      HasChildrenGuard,
    ],
  },
  {
    path: 'children/select-child',
    component: SelectChildComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
      HasChildrenGuard,
    ],
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
    ],
  },
  {
    path: 'settings/account',
    component: AccountSettingsComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
    ],
  },
  {
    path: 'settings/account/export',
    component: ExportAccountComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
    ],
  },
  {
    path: 'settings/account/sharing',
    component: SharingComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
    ],
  },
  {
    path: 'settings/account/sharing/invite',
    component: InviteComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
    ],
  },
  {
    path: 'settings/general',
    component: GeneralSettingsComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
    ],
  },
  {
    path: 'settings/activities',
    component: ActivitySettingsComponent,
    canActivate: [
      BrowserSupportGuard,
      IsLoggedInGuard,
    ],
  },
  {
    path: 'internal-error',
    component: InternalErrorComponent,
  },
  {
    path: 'unsupported-browser',
    component: BrowserUnsupportedComponent,
  },
  {
    path: 'privacy',
    component: PrivacyComponent,
    canActivate: [
      BrowserSupportGuard,
    ],
  },
  {
    path: 'about',
    component: AboutComponent,
    canActivate: [
      BrowserSupportGuard,
    ]
  },
  {
    path: 'full-data-refresh',
    component: FullDataRefreshComponent,
    canActivate: [
      IsLoggedInGuard,
      BrowserSupportGuard,
      HasChildrenGuard,
      ChildIsSelectedGuard,
    ],
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
