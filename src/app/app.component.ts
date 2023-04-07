import {Component, Injector, OnInit} from '@angular/core';
import {Observable, of} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";
import {TitleService} from "./services/title.service";
import {UserManagerService} from "./services/user-manager.service";
import {JsonApiRegistry} from "./services/json-api/json-api-registry";
import {UserRepository} from "./entity/user.entity";
import {ChildRepository} from "./entity/child.entity";

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
  ) {
  }

  ngOnInit(): void {
    this.registerRepositories();
  }

  private registerRepositories() {
    const registry = this.injector.get(JsonApiRegistry);

    registry.registerRepository(this.injector.get(UserRepository));
    registry.registerRepository(this.injector.get(ChildRepository));
  }
}
