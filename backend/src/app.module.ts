import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { PrismaService } from './prisma.service';
import { ProjectsController } from './projects/projects.controller';
import { ProjectsService } from './projects/projects.service';
import { DocsController } from './docs/docs.controller';
import { DocsService } from './docs/docs.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'change_me',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    })
  ],
  controllers: [AuthController, ProjectsController, DocsController],
  providers: [PrismaService, AuthService, ProjectsService, DocsService]
})
export class AppModule {}
