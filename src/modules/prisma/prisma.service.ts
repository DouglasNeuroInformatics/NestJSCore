import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import type { OnApplicationShutdown, OnModuleInit } from '@nestjs/common';

import { PRISMA_CLIENT_TOKEN } from './prisma.factory.js';

import type { ExtendedPrismaClient } from './prisma.types.js';

@Injectable()
export class PrismaService implements OnModuleInit, OnApplicationShutdown {
  constructor(@Inject(PRISMA_CLIENT_TOKEN) public readonly client: ExtendedPrismaClient) {}

  async dropDatabase() {
    const result = await this.client.$runCommandRaw({ dropDatabase: 1 });
    if (result.ok !== 1) {
      throw new InternalServerErrorException('Failed to drop database: raw mongodb command returned unexpected value', {
        cause: result
      });
    }
  }

  async getDbStats() {
    return (await this.client.$runCommandRaw({ dbStats: 1 })) as {
      collections: number;
      db: string;
      objects: number;
    };
  }

  async onApplicationShutdown() {
    await this.client.$disconnect();
  }

  async onModuleInit() {
    await this.client.$connect();
  }
}
