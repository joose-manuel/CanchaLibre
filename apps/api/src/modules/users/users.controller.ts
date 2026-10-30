import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { User as UserModel } from '@canchalibre/shared-domain';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { toUserModel } from '../../common/mappers/api.mapper';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(@CurrentUser('id') userId: string): Promise<UserModel> {
    return toUserModel(await this.users.findById(userId));
  }

  @Patch('me')
  async update(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserModel> {
    return toUserModel(await this.users.update(userId, dto));
  }

  @Post('me/become-owner')
  async becomeOwner(@CurrentUser('id') userId: string): Promise<UserModel> {
    return toUserModel(await this.users.becomeOwner(userId));
  }

  @Post('me/become-player')
  async becomePlayer(@CurrentUser('id') userId: string): Promise<UserModel> {
    return toUserModel(await this.users.becomePlayer(userId));
  }
}
