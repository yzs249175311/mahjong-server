import { Socket } from 'socket.io';
import { Room, RoomInfo } from './Room';
import { mock } from 'mockjs';
import { ClientEventType } from '../websocket.interface';
import { RoomListType } from './RoomManager';
import { Message } from './Message';

export type PlayerInfo = PlayerInfoWithoutRoom & {
  currentRoom: null | RoomInfo;
  messageList: Message[];
};

export type PlayerInfoWithoutRoom = Pick<Player, 'uid' | 'name' | 'money'>;

export class Player {
  uid: string;
  client: Socket;

  name: string = mock('@cname');
  money: number = 0;
  currentRoom: null | Room = null;
  lastLoginTime: number = Date.now();
  messageList: Message[] = [];

  setMoney(money: number) {
    this.money = money;
    this.notifyRoomPlayer();
  }

  setLoginTime(time: number) {
    this.lastLoginTime = time;
  }

  setName(name: string) {
    this.name = name;
    this.notifyRoomPlayer();
  }

  constructor(uid: string, client: Socket) {
    this.uid = uid;
    this.client = client;
  }

  setClient(client: Socket) {
    if (this.client == client) {
      return;
    } else {
      this.client = client;
    }
  }

  joinRoom(room: Room, password?: string, force: boolean = false) {
    this.leaveRoom();

    if (room) {
      if (force) {
        room.addPlayer(this);
      } else {
        room.validPlayerBeforeJoin(this, password);
      }
    }
  }

  payMoney(player: Player, money: number) {
    if (this.money < money) {
      this.sendMessage({
        severity: 'error',
        type: 'system',
        message: '金额不足',
      });
      return;
    }

    this.money -= money;
    player.getMoney(this, money);
    let message = this.sendMessage({
      type: 'pay',
      severity: 'success',
      from: {
        uid: this.uid,
        name: this.name,
      },
      to: {
        uid: player.uid,
        name: player.name,
      },
      message: money + '',
    });

    this.notifyRoomPlayer();
  }

  getMoney(player: Player, money: number) {
    this.money += money;
    this.sendMessage({
      type: 'pay',
      severity: 'info',
      from: {
        uid: player.uid,
        name: player.name,
      },
      to: {
        uid: this.uid,
        name: this.name,
      },
      message: money + '',
    });
  }

  notifyRoomPlayer() {
    this.currentRoom?.sendPlayerInfo();
  }

  leaveRoom() {
    if (this.currentRoom) {
      let room = this.currentRoom;
      this.client.leave(this.currentRoom.uid);
      this.currentRoom.deletePlayer(this);
      this.currentRoom = null;
      room.sendPlayerInfo();
      this.sendPlayerInfo();
    }
  }

  sendRoomList(roomList: RoomListType) {
    this.client.emit(ClientEventType.ROOMLIST, roomList);
  }

  sendMessage(message: Message) {
    this.messageList.push(message);
    this.client.emit(ClientEventType.MESSAGE, message);
  }

  sendPlayerInfo() {
    this.client.emit(ClientEventType.PLAYERINFO, this.getInfo());
  }

  getInfo(): PlayerInfo {
    return {
      ...this.getInfoWithoutRoom(),
      currentRoom: this.currentRoom ? this.currentRoom.getInfo() : null,
      messageList: this.messageList,
    };
  }

  getInfoWithoutRoom(): PlayerInfoWithoutRoom {
    return {
      uid: this.uid,
      name: this.name,
      money: this.money,
    };
  }
}
