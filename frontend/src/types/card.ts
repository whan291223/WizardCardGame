export enum CardType {
  NORMAL = 'normal',
  WIZARD = 'wizard',
  JESTER = 'jester',
}

export enum Suit {
  FLARE = 'flare',
  POTTED_PLANT = 'potted_plant',
  STAR = 'star',
  NEARBY = 'nearby',
}

export interface Card {
  type: CardType;
  suit?: Suit;
  value?: number;
}

export interface CardInPlay {
  card: Card;
  player_id: string;
  position?: number;
}
