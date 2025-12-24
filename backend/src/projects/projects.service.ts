import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  requireUserId(auth?: string): string {
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException('Missing token');
    const token = auth.slice('Bearer '.length);
    const payload = this.jwt.verify(token, { secret: process.env.JWT_SECRET || 'change_me' }) as any;
    return String(payload.sub);
  }

  async list(userId: string) {
    return this.prisma.project.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
  }

  async create(userId: string, dto: { name: string; description?: string }) {
    return this.prisma.project.create({ data: { userId, name: dto.name, description: dto.description } });
  }

  async get(userId: string, id: string) {
    const p = await this.prisma.project.findUnique({ where: { id } });
    if (!p || p.userId !== userId) throw new ForbiddenException();
    return p;
  }

  async update(userId: string, id: string, dto: { name: string; description?: string }) {
    await this.get(userId, id);
    return this.prisma.project.update({ where: { id }, data: { name: dto.name, description: dto.description } });
  }

  async remove(userId: string, id: string) {
    await this.get(userId, id);
    await this.prisma.doc.deleteMany({ where: { projectId: id } });
    return this.prisma.project.delete({ where: { id } });
  }
}
