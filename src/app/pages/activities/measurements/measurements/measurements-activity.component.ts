import {Component, Inject, OnInit} from '@angular/core';
import {MEASUREMENTS_ACTIVITY_CONFIGURATIONS} from "../../../../dependency-injection/injection-tokens";
import {ActivityConfiguration} from "../../../../activity/activity-configuration";
import {TitleService} from "../../../../services/title.service";
import {TranslateService} from "@ngx-translate/core";
import {toPromise} from "../../../../helper/observables";
import {UserManagerService} from "../../../../services/user-manager.service";
import {EncryptorService} from "../../../../services/encryptor.service";
import {EncryptedValue} from "../../../../dto/encrypted-value";
import {Observable} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";

@Component({
  selector: 'app-measurements-activity',
  templateUrl: './measurements-activity.component.html',
  styleUrls: ['./measurements-activity.component.scss']
})
export class MeasurementsActivityComponent implements OnInit {
  public defaultContent: boolean = true;

  public columnsCount: Observable<number> = this.breakpointObserver.observe([ // todo abstract into its own component
    Breakpoints.XSmall,
    Breakpoints.Small,
    Breakpoints.Medium,
    Breakpoints.Large,
    Breakpoints.XLarge,
  ]).pipe(
    map(result => {
      if (!result.matches) {
        return 4;
      }
      const breakpoint = (<string[]>Object.keys(result.breakpoints)).filter(value => result.breakpoints[value]).reduce((previousValue, currentValue) => {
        return currentValue;
      });
      switch (breakpoint) {
        case Breakpoints.XSmall:
          return 2;
        case Breakpoints.Small:
          return 2;
        case Breakpoints.Medium:
          return 4;
        case Breakpoints.Large:
          return 6;
        case Breakpoints.XLarge:
          return 6;
      }

      return 4;
    }),
    shareReplay(1),
  );

  constructor(
    @Inject(MEASUREMENTS_ACTIVITY_CONFIGURATIONS) public readonly activities: ActivityConfiguration[],
    private readonly titleService: TitleService,
    private readonly translator: TranslateService,
    private readonly userManager: UserManagerService,
    private readonly encryptor: EncryptorService,
    private readonly breakpointObserver: BreakpointObserver,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.userManager.getCurrentUser().then(user => {
      user.relationships.selectedChild.subscribe(async child => {
        if (child === null) {
          return;
        }
        child = await this.encryptor.decryptEntity(child);
        if (!(child.attributes.displayName instanceof EncryptedValue)) {
          this.titleService.title = await toPromise(this.translator.get('Measurements'));
          return;
        }

        this.titleService.title = await toPromise(this.translator.get(
          'Measurements - {{childName}}',
          {
            childName: child.attributes.displayName.decrypted,
          },
        ));
      });
    });
  }
}
