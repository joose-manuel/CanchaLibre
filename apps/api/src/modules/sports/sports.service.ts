import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sport } from '@canchalibre/shared-domain';
import { Sport as SportEntity } from './entities/sport.entity';

@Injectable()
export class SportsService {
  constructor(
    @InjectRepository(SportEntity)
    private readonly sports: Repository<SportEntity>,
  ) {}

  async findAll(): Promise<Sport[]> {
    return this.sports.find({ order: { id: 'ASC' } });
  }

  async findByIds(ids: number[]): Promise<SportEntity[]> {
    if (!ids.length) {
      return [];
    }
    return this.sports
      .createQueryBuilder('sport')
      .where('sport.id IN (:...ids)', { ids })
      .getMany();
  }
}
