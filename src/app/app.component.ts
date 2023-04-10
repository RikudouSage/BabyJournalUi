import {Component, Injector, OnInit} from '@angular/core';
import {Observable, of} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";
import {TitleService} from "./services/title.service";
import {UserManagerService} from "./services/user-manager.service";
import {JsonApiRegistry} from "./services/json-api/json-api-registry";
import {UserRepository} from "./entity/user.entity";
import {ChildRepository} from "./entity/child.entity";
import {ParentalUnitRepository} from "./entity/parental-unit.entity";
import {FeedingActivityRepository} from "./entity/feeding-activity.entity";
import {NavigationStart, Router} from "@angular/router";
import {findRouteParent} from "./helper/route-hierarchy";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isHandset: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
  title: Observable<string> = this.titleService.titleChanged;
  isLoggedIn: Observable<boolean> = this.userManager.isLoggedInChanged;

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly titleService: TitleService,
    private readonly userManager: UserManagerService,
    private readonly injector: Injector,
    router: Router,
  ) {
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (event.navigationTrigger === 'popstate') {
          const currentUrl = router.routerState.snapshot.url;
          const parent = findRouteParent(currentUrl);
          router.navigateByUrl(parent);
        }
      }
    })
  }

  ngOnInit(): void {
    this.registerRepositories();
  }

  private registerRepositories() {
    const registry = this.injector.get(JsonApiRegistry);

    registry.registerRepository(this.injector.get(UserRepository));
    registry.registerRepository(this.injector.get(ChildRepository));
    registry.registerRepository(this.injector.get(ParentalUnitRepository));
    registry.registerRepository(this.injector.get(FeedingActivityRepository));
  }
}
