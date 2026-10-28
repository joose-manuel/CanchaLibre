import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '@canchalibre/shared-domain';
import { City as CityEntity } from './entities/city.entity';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(CityEntity)
    private readonly cities: Repository<CityEntity>,
  ) {}

  async findAll(): Promise<City[]> {
    return this.cities.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<City> {
    const city = await this.cities.findOne({ where: { id } });
    if (!city) {
      throw new NotFoundException('Ciudad no encontrada');
    }
    return city;
  }
}
