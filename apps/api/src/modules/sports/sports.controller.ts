import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { Sport } from '@canchalibre/shared-domain';
import { Public } from '../../common/decorators/public.decorator';
import { SportsService } from './sports.service';

@ApiTags('sports')
@Public()
@Controller('sports')
export class SportsController {
  constructor(private readonly sports: SportsService) {}

  @Get()
  findAll(): Promise<Sport[]> {
    return this.sports.findAll();
  }
}
