import { Body, Controller, Get, Param, Post, Put, Delete, Headers } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { ProjectsService } from './projects.service';

class ProjectDto {
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
}

@Controller('projects')
export class ProjectsController {
  constructor(private readonly svc: ProjectsService) {}

  @Get()
  list(@Headers('authorization') auth?: string) {
    return this.svc.list(this.svc.requireUserId(auth));
  }

  @Post()
  create(@Body() dto: ProjectDto, @Headers('authorization') auth?: string) {
    return this.svc.create(this.svc.requireUserId(auth), dto);
  }

  @Get(':id')
  get(@Param('id') id: string, @Headers('authorization') auth?: string) {
    return this.svc.get(this.svc.requireUserId(auth), id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: ProjectDto, @Headers('authorization') auth?: string) {
    return this.svc.update(this.svc.requireUserId(auth), id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('authorization') auth?: string) {
    return this.svc.remove(this.svc.requireUserId(auth), id);
  }
}
