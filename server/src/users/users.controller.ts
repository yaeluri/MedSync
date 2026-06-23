import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  CreateUserInput,
  UpdateUserInput,
  UsersService,
} from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  findAll(@Query('role') role?: string) {
    return this.service.findAll(role);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() body: CreateUserInput) {
    const user = await this.service.create(body);
    return this.service.findOne(user.id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateUserInput,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.remove(id);
  }
}
