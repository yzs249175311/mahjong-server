import { Module } from '@nestjs/common';
import { MahjongGateway} from './mahjong.gateway';

@Module({
    controllers: [],
    providers: [MahjongGateway],
})
export class MahjongModule {}
