import { Room, RoomInfo, RoomType } from './Room';
const { Random } = require('mockjs');

export type RoomListType = Array<Pick<RoomInfo, 'uid' | 'name' | 'roomType'>>;

export class RoomManager {
  roomMap = new Map<string, Room>();

  constructor() {}

  createRoom(
    name: string,
    roomType: RoomType = { type: 'public', password: null },
  ): false | Room {
    if (this.roomMap.size >= 100) {
      return false;
    }
    let uid = Random.guid();
    if (this.roomMap.has(uid)) {
      return false;
    }
    let room = new Room(uid, name, roomType, this);
    this.roomMap.set(uid, room);
    return room;
  }

  getRoom(uid: string): Room | undefined {
    return this.roomMap.get(uid);
  }

  hasRoom(uid: string): boolean {
    return this.roomMap.has(uid);
  }

  deleteRoom(uid: string) {
    this.roomMap.delete(uid);
  }

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
