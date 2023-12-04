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
import { RoomManager } from './model/RoomManager';
import { Socket, Server } from 'socket.io';
import { ClientEventType, ServerEventType } from './websocket.interface';
import { Room, RoomType } from './model/Room';

@WebSocketGateway(3001, {
  cors: { origin: '*' },
  path: '/',
})
export class MahjongGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  playerManager: PlayerManager;
  roomManager: RoomManager;

  constructor() {
    this.playerManager = new PlayerManager();
    this.roomManager = new RoomManager();
    this.roomManager.createRoom('公共房间1', {
      type: 'always',
      password: null,
    });
    this.roomManager.createRoom('密码房间2', {
      type: 'always',
      password: '123456',
    });
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
    this.playerManager
      .getPlayer(socket)
      .sendRoomList(this.roomManager.getRoomList());
  }

  //监听： 进入房间
  @SubscribeMessage(ServerEventType.JOINROOM)
  onJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { uid: string; password?: string },
  ) {
    this.playerManager
      .getPlayer(socket)
      ?.joinRoom(this.roomManager.getRoom(payload.uid), payload.password);
  }

  //监听： 离开房间
  @SubscribeMessage(ServerEventType.LEAVEROOM)
  onLeaveRoom(@ConnectedSocket() socket: Socket) {
    this.playerManager.getPlayer(socket)?.leaveRoom();
  }

  // 监听：设置金币
  @SubscribeMessage(ServerEventType.SETMONEY)
  onSetMoney(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: number,
  ) {
    this.playerManager.getPlayer(socket)?.setMoney(payload);
  }

  // 监听：设置名字
  @SubscribeMessage(ServerEventType.SETNAME)
  onSetName(@ConnectedSocket() socket: Socket, @MessageBody() payload: string) {
    this.playerManager.getPlayer(socket)?.setName(payload);
  }

  // 监听：创建房间
  @SubscribeMessage(ServerEventType.CREATE_ROOM)
  onCreatRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    payload: {
      uid: Room['uid'];
      name: Room['name'];
      roomType: RoomType;
    },
  ) {
    let room = this.roomManager.createRoom(payload.name, payload.roomType);
    if (room) {
      this.playerManager.getPlayer(socket)?.joinRoom(room, null, true);
    }
  }
}
