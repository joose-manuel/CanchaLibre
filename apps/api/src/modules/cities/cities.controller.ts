import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { City } from '@canchalibre/shared-domain';
import { Public } from '../../common/decorators/public.decorator';
import { CitiesService } from './cities.service';

@ApiTags('cities')
@Public()
@Controller('cities')
export class CitiesController {
  constructor(private readonly cities: CitiesService) {}

  @Get()
  findAll(): Promise<City[]> {
    return this.cities.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<City> {
    return this.cities.findOne(id);
  }
}
