import { Message } from './Message';
import { Player, PlayerInfoWithoutRoom } from './Player';
import { RoomManager } from './RoomManager';
export type RoomInfo = Pick<Room, 'uid' | 'name' | 'owner'> & {
  playerList: Array<PlayerInfoWithoutRoom>;
} & { roomType: Pick<RoomType, 'type'> & { password: boolean } };

export type RoomType =
  | { type: 'public'; password: null }
  | {
      type: 'private';
      password: string;
    }
  | {
      type: 'always';
      password: string | null;
    };

type RoomTypeValidatorType = {
  [key in RoomType['type']]: (room: Room, password?: string) => boolean;
};

let roomTypeValidator: RoomTypeValidatorType = {
  always: (room, password) => {
    if (room.roomType.type === 'always') {
      if (password) {
        return room.roomType.password === password;
      } else {
        return true;
      }
    } else {
      return false;
    }
  },
  private: (room, password) => {
    if (room.roomType.type === 'private') {
      if (password) {
        return room.roomType.password === password;
      } else {
        return false;
      }
    }
    return false;
  },
  public: () => {
    return true;
  },
};

export class Room {
  uid: string;
  name: string;
  owner: Player['uid'];
  roomType: RoomType;
  playerSet: Set<Player>;
  roomManager: RoomManager;
  messageList: Message[];

  constructor(
    uid: string,
    name: string,
    roomType: RoomType,
    roomManager: RoomManager,
    owner: Player['uid'] = null,
  ) {
    this.uid = uid;
    this.name = name;
    this.roomType = roomType;
    this.owner = owner;
    this.playerSet = new Set();
    this.roomManager = roomManager;
  }

  hasPlayer(player: Player): boolean {
    return this.playerSet.has(player);
  }

  addPlayer(player: Player): void {
    if (!this.hasPlayer(player)) {
      this.playerSet.add(player);
      player.client.join(this.uid);
      player.currentRoom = this;
      this.sendPlayerInfo();
    }
  }

  validPlayerBeforeJoin(player: Player, password?: string) {
    if (roomTypeValidator[this.roomType.type](this, password)) {
      this.addPlayer(player);
    } else {
      player.sendMessage({
        type: 'system',
        severity: 'error',
        message: '密码错误',
      });
    }
  }

  deletePlayer(player: Player) {
    if (this.playerSet.has(player)) {
      this.playerSet.delete(player);
      if (this.playerSet.size === 0) {
        this.destroy();
      } else if (this.roomType.type !== 'always') {
        this.owner = this.playerSet.values().next().value.uid;
      }
    }
  }

  getPlayerList(): RoomInfo['playerList'] {
    let playerList: RoomInfo['playerList'] = [];

    this.playerSet.forEach((player) => {
      playerList.push(player.getInfoWithoutRoom());
    });

    return playerList;
  }

  hasPassword(): boolean {
    return !!this.roomType.password;
  }

  getInfo(): RoomInfo {
    return {
      uid: this.uid,
      name: this.name,
      roomType: { type: this.roomType.type, password: this.hasPassword() },
      playerList: this.getPlayerList(),
      owner: this.owner,
    };
  }

  sendPlayerInfo() {
    this.playerSet.forEach((player) => {
      player.sendPlayerInfo();
    });
  }

  destroy() {
    if (this.roomType.type === 'always') {
      return;
    }
    this.roomManager.deleteRoom(this.uid);
  }
}
