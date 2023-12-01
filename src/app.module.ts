import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MahjongModule } from './mahjong/mahjong.module';

@Module({
  imports: [MahjongModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
