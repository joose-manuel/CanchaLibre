import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SpaceStatus } from '@canchalibre/shared-domain';
import { CreateSpaceDto } from './create-space.dto';

export class UpdateSpaceDto extends PartialType(CreateSpaceDto) {
  @ApiPropertyOptional({ enum: SpaceStatus })
  @IsOptional()
  @IsEnum(SpaceStatus)
  status?: SpaceStatus;
}
