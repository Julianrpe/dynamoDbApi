import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "DynamoTestApi";

export const handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    switch (event.routeKey) {
      case "DELETE /items/{user}":
        await dynamo.send(
          new DeleteCommand({
            TableName: tableName,
            Key: {
              user: event.pathParameters.user,
            },
          })
        );
        body = `Deleted item ${event.pathParameters.user}`;
        break;
      case "GET /items/{user}":
        body = await dynamo.send(
          new GetCommand({
            TableName: tableName,
            Key: {
              user: event.pathParameters.user,
            },
          })
        );
        body = body.Item;
        break;
      case "GET /items":
        body = await dynamo.send(
          new ScanCommand({ TableName: tableName })
        );
        body = body.Items;
        break;
      case "PUT /items":
        let requestJSON = JSON.parse(event.body);
        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              user: requestJSON.user,
              order: requestJSON.order,
              city: requestJSON.city,
            },
          })
        );
        body = `Put item ${requestJSON.user}`;
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};
