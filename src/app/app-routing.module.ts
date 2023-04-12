import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {RegisterComponent} from "./pages/auth/register/register.component";
import {ActivityListComponent} from "./pages/activities/activity-list/activity-list.component";
import {IsLoggedInGuard} from "./services/is-logged-in.guard";
import {HasChildrenGuard} from "./services/has-children.guard";
import {CreateChildComponent} from "./pages/children/create-child/create-child.component";
import {SelectChildComponent} from "./pages/children/select-child/select-child.component";
import {FeedingActivityComponent} from "./pages/activities/feeding/feeding-activity.component";
import {ChildIsSelectedGuard} from "./services/child-is-selected.guard";
import {LogoutComponent} from "./pages/auth/logout/logout.component";
import {SettingsComponent} from "./pages/settings/settings/settings.component";
import {AccountSettingsComponent} from "./pages/settings/account/account-settings.component";
import {ExportAccountComponent} from "./pages/settings/export-account/export-account.component";
import {SharingComponent} from "./pages/settings/sharing/sharing.component";
import {InviteComponent} from "./pages/settings/invite/invite.component";
import {BrowserUnsupportedComponent} from "./pages/general/browser-unsupported/browser-unsupported.component";
import {BrowserSupportGuard} from "./services/browser-support.guard";
import {ActivitiesSummaryComponent} from "./pages/activities/summary/activities-summary.component";
import {InternalErrorComponent} from "./pages/general/internal-error/internal-error.component";
import {PrivacyComponent} from "./pages/general/privacy/privacy.component";
import {GeneralSettingsComponent} from "./pages/settings/general/general-settings.component";

const routes: Routes = [
  {
    path: 'auth/register',
    component: RegisterComponent,
  },
  {
    path: 'auth/logout',
    component: LogoutComponent,
    canActivate: [IsLoggedInGuard, BrowserSupportGuard],
  },
  {
    path: '',
    component: ActivityListComponent,
    canActivate: [IsLoggedInGuard, HasChildrenGuard, ChildIsSelectedGuard, BrowserSupportGuard],
  },
  {
    path: 'activities/summary',
    component: ActivitiesSummaryComponent,
    canActivate: [IsLoggedInGuard, HasChildrenGuard, ChildIsSelectedGuard, BrowserSupportGuard],
  },
  {
    path: 'activities/feeding',
    component: FeedingActivityComponent,
    canActivate: [IsLoggedInGuard, HasChildrenGuard, ChildIsSelectedGuard, BrowserSupportGuard],
  },
  {
    path: 'children/create-first',
    component: CreateChildComponent,
    canActivate: [IsLoggedInGuard, BrowserSupportGuard],
  },
  {
    path: 'children/add',
    component: CreateChildComponent,
    canActivate: [IsLoggedInGuard, HasChildrenGuard, BrowserSupportGuard],
  },
  {
    path: 'children/select-child',
    component: SelectChildComponent,
    canActivate: [IsLoggedInGuard, HasChildrenGuard, BrowserSupportGuard],
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [IsLoggedInGuard, BrowserSupportGuard],
  },
  {
    path: 'settings/account',
    component: AccountSettingsComponent,
    canActivate: [IsLoggedInGuard, BrowserSupportGuard],
  },
  {
    path: 'settings/account/export',
    component: ExportAccountComponent,
    canActivate: [IsLoggedInGuard, BrowserSupportGuard],
  },
  {
    path: 'settings/account/sharing',
    component: SharingComponent,
    canActivate: [IsLoggedInGuard, BrowserSupportGuard],
  },
  {
    path: 'settings/account/sharing/invite',
    component: InviteComponent,
    canActivate: [IsLoggedInGuard, BrowserSupportGuard],
  },
  {
    path: 'settings/general',
    component: GeneralSettingsComponent,
    canActivate: [IsLoggedInGuard, BrowserSupportGuard],
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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
