import { Socket } from 'socket.io';
import { Room, RoomInfo } from './room';
import { mock } from 'mockjs';
import { ClientEventType } from '../websocket.interface';
import { RoomListType } from '@/mahjong/model/roomManager';

export type PlayerInfo = PlayerInfoWithoutRoom & {
  currentRoom: null | RoomInfo;
};

export type PlayerInfoWithoutRoom = Pick<Player, 'uid' | 'name' | 'money'>;

export class Player {
  uid: string;
  client: Socket;

  name: string = mock('@cname');
  money: number = 0;
  currentRoom: null | Room = null;

  setMoney(money: number) {
    this.money = money;
    this.notifyRoomPlayer();
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

  joinRoom(room: Room) {
    if (room) {
      this.leaveRoom();
      this.currentRoom = room;
      this.client.join(room.uid);
      room.addPlayer(this);
      this.notifyRoomPlayer();
    }
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

  sendPlayerInfo() {
    this.client.emit(ClientEventType.PLAYERINFO, this.getInfo());
  }

  getInfo(): PlayerInfo {
    return {
      ...this.getInfoWithoutRoom(),
      currentRoom: this.currentRoom ? this.currentRoom.getInfo() : null,
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
