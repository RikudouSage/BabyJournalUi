import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {RegisterComponent} from "./pages/auth/register/register.component";
import {ActivityListComponent} from "./pages/activities/activity-list/activity-list.component";
import {IsLoggedInGuard} from "./services/is-logged-in.guard";
import {HasChildrenGuard} from "./services/has-children.guard";
import {CreateChildComponent} from "./pages/children/create-child/create-child.component";
import {SelectChildComponent} from "./pages/children/select-child/select-child.component";
import {FeedingComponent} from "./pages/activities/feeding/feeding.component";
import {ChildIsSelectedGuard} from "./services/child-is-selected.guard";
import {LogoutComponent} from "./pages/auth/logout/logout.component";
import {SettingsComponent} from "./pages/settings/settings/settings.component";
import {AccountSettingsComponent} from "./pages/settings/account/account-settings.component";
import {ExportAccountComponent} from "./pages/settings/export-account/export-account.component";
import {SharingComponent} from "./pages/settings/sharing/sharing.component";
import {InviteComponent} from "./pages/settings/invite/invite.component";
import {BrowserUnsupportedComponent} from "./pages/general/browser-unsupported/browser-unsupported.component";
import {BrowserSupportGuard} from "./services/browser-support.guard";

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
    path: 'activities/feeding',
    component: FeedingComponent,
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
    path: 'unsupported-browser',
    component: BrowserUnsupportedComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
