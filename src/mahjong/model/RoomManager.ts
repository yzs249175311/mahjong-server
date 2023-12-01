import { Room } from './room';

export type RoomListType = Array<Pick<Room, 'uid' | 'name'>>;

export class RoomManager {
  roomMap = new Map<string, Room>();

  constructor() {
    this.createRoom('1', '公共房间1');
    this.createRoom('2', '公共房间2');
  }

  createRoom(uid: string, name: string) {
    let room = new Room(uid, name, this);
    this.roomMap.set(uid, room);
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
      });
    });
    return roomList;
  }
}
