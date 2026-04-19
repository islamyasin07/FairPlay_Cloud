import { ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../config/dynamo.js";
import { env } from "../config/env.js";

export async function getAllPlayers() {
  const command = new ScanCommand({
    TableName: env.playersTable,
  });

  const result = await dynamo.send(command);
  return result.Items ?? [];
}

export async function getPlayerById(playerId) {
  const command = new GetCommand({
    TableName: env.playersTable,
    Key: {
      playerId,
    },
  });

  const result = await dynamo.send(command);
  return result.Item ?? null;
}