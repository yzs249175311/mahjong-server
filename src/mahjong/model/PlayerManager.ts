import { Socket } from 'socket.io';
import { Player } from '@/mahjong/model/player';

export class PlayerManager {
  playerMap = new Map<string, Player>();

  create(uid: string, client: Socket): Player {
    let player: Player;
    if (this.hasPlayer(uid)) {
      player = this.getPlayer(uid)!;
      player.setClient(client);
    } else {
      player = new Player(uid, client);
      this.addPlayer(player);
    }

    Reflect.defineProperty(client, 'uid', {
      value: uid,
      enumerable: true,
      writable: true,
    });

    console.log('client:' + Reflect.get(client, 'uid'));

    return player;
  }

  hasPlayer(uid: string) {
    return this.playerMap.has(uid);
  }

  getPlayer(uid: string | Socket): Player | undefined {
    if (typeof uid === 'string') {
      return this.playerMap.get(uid);
    }
    return this.playerMap.get(Reflect.get(uid as Socket, 'uid'));
  }

  addPlayer(player: Player) {
    this.playerMap.set(player.uid, player);
  }
}

export const playerManager = new PlayerManager();
