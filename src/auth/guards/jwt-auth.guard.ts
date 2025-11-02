import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // Permitir acceso a rutas de Swagger sin autenticación
    const request = context.switchToHttp().getRequest();
    const path = request.url;

    // Excluir rutas de Swagger y su JSON
    if (
      path.startsWith('/api/docs') ||
      path.startsWith('/api-docs') ||
      path === '/' // Redirect a Swagger
    ) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Si hay un error o no hay usuario, lanzar excepción
    if (err || !user) {
      throw err || new UnauthorizedException('Token de autenticación inválido o ausente');
    }
    return user;
  }
}
