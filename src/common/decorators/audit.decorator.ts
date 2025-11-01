import { SetMetadata } from '@nestjs/common';

export const AUDIT_ENTITY_KEY = 'auditEntity';
export const AuditEntity = (entity: string) => SetMetadata(AUDIT_ENTITY_KEY, entity);

