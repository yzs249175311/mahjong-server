import { Player, PlayerInfoWithoutRoom } from './Player';
import { RoomManager } from './RoomManager';
export type RoomInfo = Pick<Room, 'uid' | 'name'> & {
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
  roomType: RoomType;
  playerSet: Set<Player>;
  roomManager: RoomManager;

  constructor(
    uid: string,
    name: string,
    roomType: RoomType,
    roomManager: RoomManager,
  ) {
    this.uid = uid;
    this.name = name;
    this.roomType = roomType;
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
    }
  }

  deletePlayer(player: Player) {
    if (this.playerSet.has(player)) {
      this.playerSet.delete(player);
      if (this.playerSet.size === 0) {
        this.destroy();
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
