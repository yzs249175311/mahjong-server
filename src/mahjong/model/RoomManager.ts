import { Room, RoomInfo, RoomType } from './Room';
const { Random } = require('mockjs');

export type RoomListType = Array<Pick<RoomInfo, 'uid' | 'name' | 'roomType'>>;

export class RoomManager {
  roomMap = new Map<string, Room>();

  constructor() {}

  // 创建房间
  createRoom(
    name: string,
    roomType: RoomType = { type: 'public', password: null },
  ): false | Room {
    if (this.roomMap.size >= 100) return false;

    const uid = Random.guid();
    if (this.roomMap.has(uid)) return false;

    const room = new Room(uid, name, roomType, this);
    this.roomMap.set(uid, room);

    return room;
  }

  // 获取房间
  getRoom(uid: string): Room | undefined {
    return this.roomMap.get(uid);
  }

  // 是否存在房间
  hasRoom(uid: string): boolean {
    return this.roomMap.has(uid);
  }

  // 删除房间
  deleteRoom(uid: string) {
    this.roomMap.delete(uid);
  }

  // 获取房间列表
  getRoomList(): RoomListType {
    let roomList: RoomListType = [];
    this.roomMap.forEach((room) => {
      roomList.push({
        uid: room.uid,
        name: room.name,
        roomType: {
          type: room.roomType.type,
          password: room.hasPassword(),
        },
      });
    });
    return roomList;
  }
}
