import {Component, HostListener, Injector, OnInit} from '@angular/core';
import {lastValueFrom, Observable, tap} from "rxjs";
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
import {MatSidenav} from "@angular/material/sidenav";
import {TranslateService} from "@ngx-translate/core";
import {DatabaseService} from "./services/database.service";
import {AppLanguage} from "./types/app-language";
import {MatSnackBar, MatSnackBarRef, TextOnlySnackBar} from "@angular/material/snack-bar";
import {DiaperingActivityRepository} from "./entity/diapering-activity.entity";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {PumpingActivityRepository} from "./entity/pumping-activity.entity";
import {getPrimaryBrowserLanguage} from "./helper/language";
import {SleepingActivityRepository} from "./entity/sleeping-activity.entity";

type AppMode = 'browser' | 'standalone' | 'android';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private offlineSnackBar: MatSnackBarRef<TextOnlySnackBar>;
  public appLikeNavigation: boolean = true;

  public appMode: AppMode = 'browser';

  isHandset: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      tap(result => this.appLikeNavigation = result),
      shareReplay()
    );
  title: Observable<string> = this.titleService.titleChanged;
  isLoggedIn: Observable<boolean> = this.userManager.isLoggedInChanged;

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly titleService: TitleService,
    private readonly userManager: UserManagerService,
    private readonly injector: Injector,
    private readonly snackBar: MatSnackBar,
    private readonly translator: TranslateService,
    private readonly iconRegistry: MatIconRegistry,
    private readonly domSanitizer: DomSanitizer,
    private readonly router: Router,
    database: DatabaseService,
  ) {
    translator.use(
      database.getLanguage() === AppLanguage.Default ? getPrimaryBrowserLanguage() : database.getLanguage()
    );
    router.events.subscribe(event => {
      if (!this.appLikeNavigation) {
        return;
      }
      if (event instanceof NavigationStart) {
        if (event.navigationTrigger === 'popstate') {
          const currentUrl = router.routerState.snapshot.url;
          let parent: string;
          try {
            parent = findRouteParent(currentUrl);
          } catch (e) {
            console.error(`There is no parent defined for route: '${currentUrl}'`);
            parent = '/internal-error';
          }
          router.navigateByUrl(parent);
        }
      }
    })
  }

  public async ngOnInit(): Promise<void> {
    if (!navigator.onLine) {
      await this.onOffline();
    }
    this.registerCustomIcons();
    this.registerRepositories();

    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.appMode = 'standalone';
    }
    if (this.router.routerState.snapshot.url.indexOf('?mode=pwa') > -1) {
      this.appMode = 'standalone';
    }
    if (this.router.routerState.snapshot.url.indexOf('?mode=twa') > -1) {
      this.appMode = 'android';
    }
  }

  private registerRepositories() {
    const registry = this.injector.get(JsonApiRegistry);

    registry.registerRepository(this.injector.get(UserRepository));
    registry.registerRepository(this.injector.get(ChildRepository));
    registry.registerRepository(this.injector.get(ParentalUnitRepository));
    registry.registerRepository(this.injector.get(FeedingActivityRepository));
    registry.registerRepository(this.injector.get(DiaperingActivityRepository));
    registry.registerRepository(this.injector.get(PumpingActivityRepository));
    registry.registerRepository(this.injector.get(SleepingActivityRepository));
  }

  public async hideDrawer(drawer: MatSidenav) {
    if (this.appLikeNavigation) {
      await drawer.toggle(false);
    }
  }

  @HostListener('window:offline')
  public async onOffline() {
    this.offlineSnackBar = this.snackBar.open(await lastValueFrom(this.translator.get('You are offline, you cannot save any data.')));
  }

  @HostListener('window:online')
  public async onOnline() {
    if (this.offlineSnackBar === undefined) {
      return;
    }

    this.offlineSnackBar.dismiss();
  }

  private registerCustomIcons() {
    const icons = [
      'poop',
      'water-off',
      'water-alert',
    ];
    for (const icon of icons) {
      this.iconRegistry.addSvgIcon(icon, this.domSanitizer.bypassSecurityTrustResourceUrl(`/assets/svg/${icon}.svg`));
    }
  }
}
