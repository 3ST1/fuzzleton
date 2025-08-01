export enum PlayerState {
  Idle,
  Jump,
  Running,
  RunJump,
  Falling,
  Climbing,
}

export enum PlayerDirection {
  Forward,
  RightForward,
  Right,
  RightBackward,
  Backward,
  LeftBackward,
  Left,
  LeftForward,
}

export enum AnimationKey {
  Ascending,
  Falling,
  Idle,
  Jumping,
  Laying,
  Running,
  StandingUp,
}

export interface InputMap {
  [key: string]: boolean;
}

export interface PlayerKeys {
  up: string;
  down: string;
  left: string;
  right: string;
  jumping: string;
  running: string;
  grab: string;
  push: string;
  rightHand: string;
  leftHand: string;
}
