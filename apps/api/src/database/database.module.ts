import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('database.url');
        const common = {
          type: 'postgres' as const,
          entities,
          autoLoadEntities: false,
          synchronize: config.get<boolean>('database.synchronize', false),
          logging: config.get<boolean>('database.logging', false),
          ssl: config.get<boolean>('database.ssl', false)
            ? { rejectUnauthorized: false }
            : false,
        };

        if (databaseUrl) {
          return { ...common, url: databaseUrl };
        }

        return {
          ...common,
          host: config.get<string>('database.host', 'localhost'),
          port: config.get<number>('database.port', 5432),
          username: config.get<string>('database.username', 'canchalibre'),
          password: config.get<string>('database.password', 'canchalibre'),
          database: config.get<string>('database.name', 'canchalibre'),
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
