export enum CalculateActivitySince {
  Start = 'start',
  End = 'end',
}

export enum ParentalUnitSetting {
  FeedingBreakLength = 'feeding_break_length',
  CalculateFeedingSince = 'calculate_feeding_since',
  CalculatePumpingSince = 'calculate_pumping_since',
  CalculateSleepingSince = 'calculate_sleeping_since',
  ConsiderWaterFeeding = 'consider_water_feeding',
}

export const DefaultParentalUnitSettings: {
  [ParentalUnitSetting.FeedingBreakLength]: number;
  [ParentalUnitSetting.CalculateFeedingSince]: CalculateActivitySince;
  [ParentalUnitSetting.CalculateSleepingSince]: CalculateActivitySince;
  [ParentalUnitSetting.CalculatePumpingSince]: CalculateActivitySince;
  [ParentalUnitSetting.ConsiderWaterFeeding]: boolean;
} = {
  [ParentalUnitSetting.FeedingBreakLength]: 0,
  [ParentalUnitSetting.CalculateFeedingSince]: CalculateActivitySince.Start,
  [ParentalUnitSetting.CalculatePumpingSince]: CalculateActivitySince.Start,
  [ParentalUnitSetting.CalculateSleepingSince]: CalculateActivitySince.End,
  [ParentalUnitSetting.ConsiderWaterFeeding]: true,
}
