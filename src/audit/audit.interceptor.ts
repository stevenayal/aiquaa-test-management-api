import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService, AuditContext } from './audit.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, method, body, params, route } = request;
    const handler = context.getHandler();

    // Extract entity name from route path
    const entityName = this.extractEntityName(route?.path);

    // Determine action based on HTTP method
    const action = this.getActionFromMethod(method);

    // Get entity ID from params or body
    const entityId = params?.id || body?.id || params?.entityId;

    // Store original body for diff
    const originalBody = JSON.parse(JSON.stringify(body));

    return next.handle().pipe(
      tap(async (data) => {
        if (user && entityName && entityId) {
          let diff;
          if (action === AuditAction.update && originalBody) {
            diff = {
              before: originalBody,
              after: data,
            };
          }

          const auditContext: AuditContext = {
            actorId: user.id,
            entity: entityName,
            entityId,
            action,
            diff,
          };

          await this.auditService.log(auditContext);
        }
      }),
    );
  }

  private extractEntityName(path: string): string {
    if (!path) return '';
    // Extract entity from path like /api/projects -> Project
    const match = path.match(/\/api\/(\w+)/);
    if (match) {
      const entity = match[1];
      // Convert to PascalCase
      return entity
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
    }
    return '';
  }

  private getActionFromMethod(method: string): AuditAction {
    switch (method.toUpperCase()) {
      case 'POST':
        return AuditAction.create;
      case 'PUT':
      case 'PATCH':
        return AuditAction.update;
      case 'DELETE':
        return AuditAction.delete;
      case 'POST':
        // Check if it's an execute action (like /runs/:id/results)
        return AuditAction.execute;
      default:
        return AuditAction.update;
    }
  }
}
