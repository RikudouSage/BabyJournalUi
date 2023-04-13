import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
