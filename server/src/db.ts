import { PrismaClient } from "@prisma/client";

// Single shared PrismaClient instance for the process.
export const prisma = new PrismaClient();
