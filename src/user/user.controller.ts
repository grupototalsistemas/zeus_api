import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../common/guards/roles.guard';
import { UsersService } from './user.service';
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Get('me')
  async me(@GetUser() user: any) {
    return this.usersService.findMe(user.userId);
  }
  @Roles(Role.ADMIN)
  @Get()
  async list() {
    return this.usersService.listAll();
  }
  @Roles(Role.ADMIN)
  @Get(':id')
  async get(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
