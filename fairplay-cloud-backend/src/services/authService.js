import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dynamo } from "../config/dynamo.js";
import { env } from "../config/env.js";

function ensureAdminTable() {
  if (!env.adminUsersTable) {
    throw new Error("ADMINUSERS_TABLE is not configured.");
  }
}

export async function findAdminByEmail(email) {
  ensureAdminTable();

  const result = await dynamo.send(
    new ScanCommand({
      TableName: env.adminUsersTable,
      FilterExpression: "email = :emailValue",
      ExpressionAttributeValues: {
        ":emailValue": email,
      },
    })
  );

  return result.Items?.[0] ?? null;
}

export async function findAdminById(adminId) {
  ensureAdminTable();

  const result = await dynamo.send(
    new GetCommand({
      TableName: env.adminUsersTable,
      Key: { adminId },
    })
  );

  return result.Item ?? null;
}

export async function getAdminCount() {
  ensureAdminTable();

  const result = await dynamo.send(
    new ScanCommand({
      TableName: env.adminUsersTable,
      Select: "COUNT",
    })
  );

  return Number(result.Count ?? 0);
}

export async function createAdminUser({
  adminId,
  email,
  fullName,
  role,
  password,
}) {
  ensureAdminTable();

  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();

  const item = {
    adminId,
    email,
    fullName,
    role,
    passwordHash,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  await dynamo.send(
    new PutCommand({
      TableName: env.adminUsersTable,
      Item: item,
    })
  );

  return {
    adminId: item.adminId,
    email: item.email,
    fullName: item.fullName,
    role: item.role,
    isActive: item.isActive,
  };
}

export async function loginAdmin(email, password) {
  const admin = await findAdminByEmail(email);

  if (!admin || !admin.isActive) {
    return null;
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return null;
  }

  const token = jwt.sign(
    {
      sub: admin.adminId,
      email: admin.email,
      role: admin.role,
      fullName: admin.fullName,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
      issuer: env.jwtIssuer,
      audience: env.jwtAudience,
    }
  );

  return {
    token,
    admin: {
      adminId: admin.adminId,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      isActive: admin.isActive,
    },
  };
}