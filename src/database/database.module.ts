import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Challenge } from './entities/challenge.entity';
import { Match } from './entities/match.entity';
import { MenuItemEntity } from './entities/menu-item.entity';
import { Player } from './entities/player.entity';
import { RankHistory } from './entities/rank-history.entity';
import { User } from './entities/user.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT ?? 5432),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
          }),
      entities: [Player, Challenge, Match, RankHistory, User, MenuItemEntity],
      synchronize: false,
      logging: false,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      extra: {
        family: 4,
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
