import { Player } from './Player';

export type MessageSeverity = 'error' | 'warning' | 'info' | 'success';

export type SystemMessage = {
  severity: MessageSeverity;
  type: 'system';
  message: string;
};

export type PayMessage = {
  severity: MessageSeverity;
  type: 'pay';
  from: Pick<Player, 'uid' | 'name'>;
  to: Pick<Player, 'uid' | 'name'>;
  message: string;
};

export type LoginMessage = {
  severity: MessageSeverity;
  type: 'login';
  message: string;
};

export type Message = SystemMessage | PayMessage | LoginMessage;
