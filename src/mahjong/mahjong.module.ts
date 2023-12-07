import { Module } from '@nestjs/common';
import { MahjongGateway } from './mahjong.gateway';
import { ParseToPlayer } from './pipe/ParseToPlayer.pipe';

@Module({
  controllers: [],
  providers: [MahjongGateway,ParseToPlayer],
  exports:[]
})
export class MahjongModule {}
