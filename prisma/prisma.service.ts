import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  implements OnModuleInit, OnModuleDestroy
{
  private prisma: PrismaClient;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set. Please configure it for Prisma.');
    }

    const pool = new Pool({
      connectionString: databaseUrl,
      ssl:
        databaseUrl.includes('sslmode=require') ||
        (!databaseUrl.includes('localhost') &&
          !databaseUrl.includes('127.0.0.1'))
          ? { rejectUnauthorized: false }
          : false,
    });
    const adapter = new PrismaPg(pool);

    this.prisma = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  get client() {
    return this.prisma;
  }
}
