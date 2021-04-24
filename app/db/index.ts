import { PrismaClient } from "@prisma/client";

export class Database {
  private prisma: PrismaClient;

  createInstance() {
    this.prisma = new PrismaClient();
  }

  public db(): PrismaClient {
    return this.prisma;
  }
}

export const db = new Database();
