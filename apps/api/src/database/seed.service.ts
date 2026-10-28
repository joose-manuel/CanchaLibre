import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { runSeed } from './seed-data';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!this.config.get<boolean>('seedDatabase', false)) {
      return;
    }

    try {
      const result = await runSeed(
        this.dataSource,
        this.config.get<boolean>('seedDemoData', false),
      );
      this.logger.log(
        `Semilla aplicada: ${result.cities} ciudades, ${result.sports} deportes${
          result.demo ? ', datos demo de Cali' : ''
        }.`,
      );
    } catch (error) {
      this.logger.error(
        'No fue posible aplicar la semilla de base de datos',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
