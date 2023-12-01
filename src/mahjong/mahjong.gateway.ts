import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { PlayerManager } from './model/PlayerManager';
import { RoomManager } from './model/roomManager';
import { Socket } from 'socket.io';
import { ClientEventType, ServerEventType } from './websocket.interface';

@WebSocketGateway(3001, {
  cors: { origin: '*' },
  path: '/',
})
export class MahjongGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server;

  playerManager: PlayerManager;
  roomManager: RoomManager;

  constructor() {
    this.playerManager = new PlayerManager();
    this.roomManager = new RoomManager();
    this.roomManager.createRoom('1', '公共房间1');
    this.roomManager.createRoom('2', '公共房间2');
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    let uid = socket.handshake.auth?.uid;

    if (!uid) {
      socket.emit(ClientEventType.SET_UID, socket.id);
      socket.disconnect();
      return;
    }
    let player = this.playerManager.create(uid, socket);
    player.sendPlayerInfo();
  }

  handleDisconnect() {}

  // 监听：获取房间列表
  @SubscribeMessage(ServerEventType.ROOMLIST)
  onRoomList(@ConnectedSocket() socket: Socket) {
    socket.emit(ClientEventType.ROOMLIST, this.roomManager.getRoomList());
  }

  //监听： 进入房间
  @SubscribeMessage(ServerEventType.JOINROOM)
  onJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: string,
  ) {
    this.playerManager
      .getPlayer(socket)
      ?.joinRoom(this.roomManager.getRoom(payload));
  }

  //监听： 离开房间
  @SubscribeMessage(ServerEventType.LEAVEROOM)
  onLeaveRoom(@ConnectedSocket() socket: Socket) {
    this.playerManager.getPlayer(socket)?.leaveRoom();
  }

  @SubscribeMessage(ServerEventType.SETMONEY)
  onSetMoney(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: number,
  ) {
    this.playerManager.getPlayer(socket)?.setMoney(payload);
  }

  @SubscribeMessage(ServerEventType.SETNAME)
  onSetName(@ConnectedSocket() socket: Socket, @MessageBody() payload: string) {
    this.playerManager.getPlayer(socket)?.setName(payload);
  }
}
