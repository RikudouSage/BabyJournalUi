import {Injectable} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {BottleContentType} from "../enum/bottle-content-type.enum";
import {Observable} from "rxjs";
import {BreastIndex} from "../enum/breast-index.enum";
import {CalculateActivitySince} from "../enum/parental-unit-setting.enum";
import {NamedMilestone} from "../enum/named-milestone.enum";

@Injectable({
  providedIn: 'root'
})
export class EnumToStringService {
  constructor(
    private readonly translator: TranslateService,
  ) {
  }

  public bottleContentTypeToString(foodType: BottleContentType): Observable<string> {
    switch (foodType) {
      case BottleContentType.BreastMilk:
        return this.translator.get('breast milk');
      case BottleContentType.Formula:
        return this.translator.get('formula');
      case BottleContentType.Water:
        return this.translator.get('water');
      case BottleContentType.Juice:
        return this.translator.get('juice');
    }
  }

  public breastIndexToString(breastIndex: BreastIndex): Observable<string> {
    switch (breastIndex) {
      case BreastIndex.Left:
        return this.translator.get('left breast');
      case BreastIndex.Right:
        return this.translator.get('right breast');
    }
  }

  public calculateActivitySinceToString(activityStart: CalculateActivitySince): Observable<string> {
    switch (activityStart) {
      case CalculateActivitySince.Start:
        return this.translator.get('beginning');
      case CalculateActivitySince.End:
        return this.translator.get('end');
    }
  }

  public milestoneToString(milestone: NamedMilestone): Observable<string> {
    let stringToTranslate: string;
    switch (milestone) {
      case NamedMilestone.Babbling:
        stringToTranslate = 'First babbling';
        break;
      case NamedMilestone.Cooing:
        stringToTranslate = 'First cooing';
        break;
      case NamedMilestone.Crawling:
        stringToTranslate = 'First crawling';
        break;
      case NamedMilestone.FirstWords:
        stringToTranslate = 'First words';
        break;
      case NamedMilestone.Laughing:
        stringToTranslate = 'First laughter';
        break;
      case NamedMilestone.ObjectGrasping:
        stringToTranslate = 'Grasping objects';
        break;
      case NamedMilestone.ObjectTracking:
        stringToTranslate = 'Tracking objects with eyes';
        break;
      case NamedMilestone.Pointing:
        stringToTranslate = 'Pointing at things';
        break;
      case NamedMilestone.RollingFromStomachToBack:
        stringToTranslate = 'Rolling from stomach to back';
        break;
      case NamedMilestone.Smiling:
        stringToTranslate = 'First smile';
        break;
      case NamedMilestone.Standing:
        stringToTranslate = 'Standing';
        break;
      case NamedMilestone.Walking:
        stringToTranslate = 'Walking without support';
        break;
      case NamedMilestone.WalkingWithSupport:
        stringToTranslate = 'Walking with support';
        break;
      case NamedMilestone.Custom:
        stringToTranslate = 'Custom milestone';
        break;
    }

    return this.translator.get(stringToTranslate);
  }

  public milestoneDescription(milestone: NamedMilestone, childName: string, milestoneName: string | null = null): Observable<string> {
    let stringToTranslate: string;
    switch (milestone) {
      case NamedMilestone.Babbling:
        stringToTranslate = `What's {{childName}} saying? No one knows, but it surely is a lot! {{childName}} started babbling.`;
        break;
      case NamedMilestone.Cooing:
        stringToTranslate = `Is the refrigerator broken? Oh no, that's just {{childName}} cooing!`;
        break;
      case NamedMilestone.Crawling:
        stringToTranslate = 'No one can escape {{childName}} now! Why is that? Because {{childName}} has just started crawling!';
        break;
      case NamedMilestone.FirstWords:
        stringToTranslate = 'You think babbling was more than enough? Well, beware, {{childName}} can now (almost) talk! Congrats on the first word!';
        break;
      case NamedMilestone.Laughing:
        stringToTranslate = `What's so funny? Only {{childName}} knows. But one thing's for sure - that laughter is contagious!`;
        break;
      case NamedMilestone.ObjectGrasping:
        stringToTranslate = '{{childName}} can now grasp things! Better start wearing hats, because your hair has just become the new favorite toy!';
        break;
      case NamedMilestone.ObjectTracking:
        stringToTranslate = '{{childName}} has been promoted to Chief Thing Observer! Everything, moving or not, falls under their keen gaze. Now the next mission? Figuring out how to get those little hands to touch what those sharp eyes see!';
        break;
      case NamedMilestone.Pointing:
        stringToTranslate = "{{childName}} wants that! No, not that, the other that! {{childName}} now can point at things (and be frustrated when you pick something else).";
        break;
      case NamedMilestone.RollingFromStomachToBack:
        stringToTranslate = `I'm on my back! And now I'm on my stomach! {{childName}} can roll between the stomach and the back easily!`;
        break;
      case NamedMilestone.Smiling:
        stringToTranslate = `Ah, that sweet {{childName}}'s first smile... What a magical moment!`;
        break;
      case NamedMilestone.Standing:
        stringToTranslate = `Finally, the moment we've all been waiting for - {{childName}} is standing! Who knew that two tiny feet could bring such a big change?`;
        break;
      case NamedMilestone.Walking:
        stringToTranslate = `That's one small step for man, one giant leap for {{childName}}! {{childName}} can now walk without supports!`;
        break;
      case NamedMilestone.WalkingWithSupport:
        stringToTranslate = 'Walking is easy for {{childName}}... With appropriate support, of course.';
        break;
      case NamedMilestone.Custom:
        stringToTranslate = '{{childName}} has reached a milestone: {{milestoneName}}. Congratulations!';
        break;
    }

    return this.translator.get(stringToTranslate, {
      childName: childName,
      milestoneName: milestoneName,
    });
  }
}
