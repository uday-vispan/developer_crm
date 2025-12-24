import { Body, Controller, Get, Param, Post, Put, Delete, Headers, Query } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { DocsService } from './docs.service';

class DocDto {
  @IsString() title!: string;
  @IsOptional() @IsString() content?: string;
}

@Controller('docs')
export class DocsController {
  constructor(private readonly svc: DocsService) {}

  @Get()
  list(
    @Headers('authorization') auth?: string,
    @Query('projectId') projectId?: string,
    @Query('q') q?: string
  ) {
    return this.svc.list(this.svc.requireUserId(auth), projectId, q);
  }

  @Post()
  create(@Headers('authorization') auth?: string, @Query('projectId') projectId?: string, @Body() dto?: DocDto) {
    return this.svc.create(this.svc.requireUserId(auth), projectId || '', dto!);
  }

  @Put(':id')
  update(@Headers('authorization') auth: string, @Param('id') id: string, @Body() dto: DocDto) {
    return this.svc.update(this.svc.requireUserId(auth), id, dto);
  }

  @Delete(':id')
  remove(@Headers('authorization') auth: string, @Param('id') id: string) {
    return this.svc.remove(this.svc.requireUserId(auth), id);
  }
}
