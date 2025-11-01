import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TestResultsService } from '../test-results/test-results.service';
import { ProcessCiWebhookDto, JiraCredentialsDto, AzureDevOpsCredentialsDto } from './dto';
import { TestResultOutcome } from '@prisma/client';
import { XMLParser } from 'fast-xml-parser';

@Injectable()
export class IntegrationsService {
  constructor(
    private prisma: PrismaService,
    private testResultsService: TestResultsService,
  ) {}

  async processCiWebhook(webhookDto: ProcessCiWebhookDto) {
    const { runId, format, data } = webhookDto;

    if (format === 'junit-xml') {
      return this.processJUnitXML(runId, typeof data === 'string' ? data : JSON.stringify(data));
    } else if (format === 'json') {
      return this.processJSONResults(runId, typeof data === 'string' ? JSON.parse(data) : data);
    } else {
      throw new BadRequestException('Formato no soportado. Use "junit-xml" o "json"');
    }
  }

  private async processJUnitXML(runId: string, xmlData: string) {
    const parser = new XMLParser();
    const result = parser.parse(xmlData);

    const results = [];
    const testSuites = Array.isArray(result.testsuites?.testsuite)
      ? result.testsuites.testsuite
      : result.testsuites?.testsuite
        ? [result.testsuites.testsuite]
        : [];

    for (const suite of testSuites) {
      const testCases = Array.isArray(suite.testcase) ? suite.testcase : suite.testcase ? [suite.testcase] : [];

      for (const testCase of testCases) {
        // Buscar TestCase por externalKey o nombre
        const testCaseEntity = await this.prisma.testCase.findFirst({
          where: {
            OR: [
              { externalKey: testCase.name },
              { title: { contains: testCase.name } },
            ],
            projectId: (await this.prisma.testRun.findUnique({ where: { id: runId } }))?.planId
              ? undefined
              : undefined,
          },
        });

        if (testCaseEntity) {
          const outcome = testCase.failure || testCase.error
            ? TestResultOutcome.Fail
            : testCase.skipped
              ? TestResultOutcome.Blocked
              : TestResultOutcome.Pass;

          results.push({
            caseId: testCaseEntity.id,
            outcome,
            comment: testCase.failure || testCase.error || undefined,
            evidenceUrl: undefined,
          });
        }
      }
    }

    if (results.length > 0) {
      return this.testResultsService.createBulk(runId, {
        runId,
        results: results as any,
      });
    }

    return { imported: 0, message: 'No se encontraron casos de prueba correspondientes' };
  }

  private async processJSONResults(runId: string, jsonData: any) {
    const results = Array.isArray(jsonData) ? jsonData : jsonData.results || [];

    const mappedResults = [];
    for (const result of results) {
      const testCase = await this.prisma.testCase.findFirst({
        where: {
          OR: [
            { externalKey: result.caseExternalId },
            { id: result.caseId },
          ],
        },
      });

      if (testCase) {
        mappedResults.push({
          caseId: testCase.id,
          outcome: result.outcome || TestResultOutcome.Pass,
          evidenceUrl: result.evidenceUrl,
          comment: result.comment,
        });
      }
    }

    if (mappedResults.length > 0) {
      return this.testResultsService.createBulk(runId, {
        runId,
        results: mappedResults as any,
      });
    }

    return { imported: 0, message: 'No se encontraron casos de prueba correspondientes' };
  }

  async saveJiraCredentials(credentials: JiraCredentialsDto) {
    // Stub: En producción esto se guardaría en una tabla de configuración o servicio de secretos
    return {
      message: 'Credenciales de Jira guardadas (stub)',
      url: credentials.url,
    };
  }

  async saveAzureDevOpsCredentials(credentials: AzureDevOpsCredentialsDto) {
    // Stub: En producción esto se guardaría en una tabla de configuración o servicio de secretos
    return {
      message: 'Credenciales de Azure DevOps guardadas (stub)',
      organization: credentials.organization,
    };
  }

  async createExternalKey(entity: 'defect' | 'requirement', entityId: string, externalKey: string) {
    // Stub: En producción esto llamaría a Jira/Azure DevOps API
    if (entity === 'defect') {
      await this.prisma.defect.update({
        where: { id: entityId },
        data: { externalKey },
      });
    } else if (entity === 'requirement') {
      await this.prisma.requirement.update({
        where: { id: entityId },
        data: { externalKey },
      });
    }

    return {
      message: `External key creado en ${entity === 'defect' ? 'Jira' : 'Azure DevOps'} (stub)`,
      entityId,
      externalKey,
    };
  }
}

