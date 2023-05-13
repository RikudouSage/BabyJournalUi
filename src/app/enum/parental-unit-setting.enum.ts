export enum CalculateActivitySince {
  Start = 'start',
  End = 'end',
}

export enum ParentalUnitSetting {
  FeedingBreakLength = 'feeding_break_length',
  CalculateFeedingSince = 'calculate_feeding_since',
  CalculatePumpingSince = 'calculate_pumping_since',
  CalculateSleepingSince = 'calculate_sleeping_since',
}

export const DefaultParentalUnitSettings: {
  [ParentalUnitSetting.FeedingBreakLength]: number;
  [ParentalUnitSetting.CalculateFeedingSince]: CalculateActivitySince;
  [ParentalUnitSetting.CalculateSleepingSince]: CalculateActivitySince;
  [ParentalUnitSetting.CalculatePumpingSince]: CalculateActivitySince;
} = {
  [ParentalUnitSetting.FeedingBreakLength]: 0,
  [ParentalUnitSetting.CalculateFeedingSince]: CalculateActivitySince.Start,
  [ParentalUnitSetting.CalculatePumpingSince]: CalculateActivitySince.Start,
  [ParentalUnitSetting.CalculateSleepingSince]: CalculateActivitySince.End,
}
