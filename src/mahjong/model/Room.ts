import { Player, PlayerInfoWithoutRoom } from './Player';
import { RoomManager } from './RoomManager';
export type RoomInfo = Pick<Room, 'uid' | 'name'> & {
  playerList: Array<PlayerInfoWithoutRoom>;
};

export class Room {
  uid: string;
  name: string;
  playerSet: Set<Player>;
  roomManager: RoomManager;

  constructor(uid: string, name: string, roomManager: RoomManager) {
    this.uid = uid;
    this.name = name;
    this.playerSet = new Set();
    this.roomManager = roomManager;
  }

  hasPlayer(player: Player): boolean {
    return this.playerSet.has(player);
  }

  addPlayer(player: Player): void {
    if (!this.playerSet.has(player)) {
      this.playerSet.add(player);
    }
  }

  deletePlayer(player: Player) {
    if (this.playerSet.has(player)) {
      this.playerSet.delete(player);
    }
  }

  getPlayerList(): RoomInfo['playerList'] {
    let playerList: RoomInfo['playerList'] = [];

    this.playerSet.forEach((player) => {
      playerList.push(player.getInfoWithoutRoom());
    });

    return playerList;
  }

  getInfo(): RoomInfo {
    return {
      uid: this.uid,
      name: this.name,
      playerList: this.getPlayerList(),
    };
  }

  sendPlayerInfo() {
    this.playerSet.forEach((player) => {
      player.sendPlayerInfo();
    });
  }

  distroy() {
    this.roomManager.deleteRoom(this.uid);
  }
}
