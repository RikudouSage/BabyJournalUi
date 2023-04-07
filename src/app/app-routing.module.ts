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

const routes: Routes = [
  {
    path: 'auth/register',
    component: RegisterComponent,
  },
  {
    path: '',
    component: ActivityListComponent,
    canActivate: [IsLoggedInGuard, HasChildrenGuard, ChildIsSelectedGuard],
  },
  {
    path: 'activities/feeding',
    component: FeedingComponent,
    canActivate: [IsLoggedInGuard, HasChildrenGuard, ChildIsSelectedGuard],
  },
  {
    path: 'children/create-first',
    component: CreateChildComponent,
    canActivate: [IsLoggedInGuard],
  },
  {
    path: 'children/add',
    component: CreateChildComponent,
    canActivate: [IsLoggedInGuard, HasChildrenGuard],
  },
  {
    path: 'children/select-child',
    component: SelectChildComponent,
    canActivate: [IsLoggedInGuard, HasChildrenGuard],
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
