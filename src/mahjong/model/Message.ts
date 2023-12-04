export type MessageSeverity = 'error' | 'warning' | 'info' | 'success';

export type SystemMessage = {
  severity: MessageSeverity;
  type: 'system';
  message: string;
};

export type PayMessage = {
  severity: MessageSeverity;
  type: 'pay';
  from: string;
  to: string;
  message: string;
};

export type Message = SystemMessage | PayMessage;
