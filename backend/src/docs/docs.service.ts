import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DocsService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  requireUserId(auth?: string): string {
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException('Missing token');
    const token = auth.slice('Bearer '.length);
    const payload = this.jwt.verify(token, { secret: process.env.JWT_SECRET || 'change_me' }) as any;
    return String(payload.sub);
  }

  async list(userId: string, projectId?: string, q?: string) {
    const where: any = { project: { userId } };
    if (projectId) where.projectId = projectId;
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } }
      ];
    }
    return this.prisma.doc.findMany({ where, orderBy: { updatedAt: 'desc' } });
  }

  async create(userId: string, projectId: string, dto: { title: string; content?: string }) {
    if (!projectId) throw new BadRequestException('projectId is required');
    const p = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!p || p.userId !== userId) throw new ForbiddenException();
    return this.prisma.doc.create({ data: { projectId, title: dto.title, content: dto.content || '' } });
  }

  async update(userId: string, id: string, dto: { title: string; content?: string }) {
    const d = await this.prisma.doc.findUnique({ where: { id }, include: { project: true } });
    if (!d || d.project.userId !== userId) throw new ForbiddenException();
    return this.prisma.doc.update({ where: { id }, data: { title: dto.title, content: dto.content || '' } });
  }

  async remove(userId: string, id: string) {
    const d = await this.prisma.doc.findUnique({ where: { id }, include: { project: true } });
    if (!d || d.project.userId !== userId) throw new ForbiddenException();
    return this.prisma.doc.delete({ where: { id } });
  }
}
