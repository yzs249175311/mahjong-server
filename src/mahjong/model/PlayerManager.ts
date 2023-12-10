import { Socket } from 'socket.io';
import { Player } from './Player';
import moment from 'moment';

export class PlayerManager {
  playerMap = new Map<string, Player>();
  private autoDeleteExpireTimer: NodeJS.Timeout | undefined;
  constructor() {
    // 初始化自动删除过期玩家
    let autoDeleteExpireTimer = setInterval(
      () => {
        this.initAutoDeleteExpireTimer();
      },
      1000 * 60 * 60,
    );
  }

  create(uid: string, client: Socket): Player {
    let player: Player;
    if (this.hasPlayer(uid)) {
      player = this.getPlayer(uid)!;
      player.setClient(client);
      player.setLoginTime(Date.now());
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

    player.sendMessage({
      type: 'login',
      severity: 'success',
      message: '登录成功',
    });

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

  deletePlayer(player: Player) {
    this.playerMap.delete(player.uid);
  }

  private initAutoDeleteExpireTimer() {
    for (let player of this.playerMap.values()) {
      let duration = moment
        .duration(moment().diff(player.lastLoginTime))
        .asDays();
      if (duration >= 1) {
        this.deletePlayer(player);
      }
    }
  }
}
