import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsObject } from 'class-validator';

export class ImportJsonDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({
    example: {
      id_work_item: 'KAN-6',
      datos_jira: { key: 'KAN-6', summary: 'Test', description: '...' },
      casos_prueba: [
        {
          id_caso_prueba: 'TC001',
          titulo: 'Caso de prueba',
          pasos: ['paso 1', 'paso 2'],
          precondiciones: ['precondición'],
          prioridad: 'Alta',
        },
      ],
    },
  })
  @IsObject()
  @IsNotEmpty()
  data: {
    id_work_item: string;
    datos_jira?: {
      key: string;
      summary?: string;
      description?: string;
    };
    casos_prueba: Array<{
      id_caso_prueba: string;
      titulo: string;
      pasos?: string[];
      precondiciones?: string[];
      datos_prueba?: Record<string, any>;
      prioridad?: string;
      tags?: string[];
    }>;
  };
}
