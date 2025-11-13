import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  DYNAMODB_TABLE_NAME,
} = process.env;

if (!AWS_REGION) {
  throw new Error('AWS_REGION is not defined. Please configure your AWS region.');
}

if (!DYNAMODB_TABLE_NAME) {
  throw new Error('DYNAMODB_TABLE_NAME is not defined. Please set the DynamoDB table name.');
}

const clientConfig = { region: AWS_REGION };

if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
  clientConfig.credentials = {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  };
} else if (AWS_ACCESS_KEY_ID || AWS_SECRET_ACCESS_KEY) {
  throw new Error('Both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be provided together.');
}

const client = new DynamoDBClient(clientConfig);

const docClient = DynamoDBDocumentClient.from(client);

export async function getSessions() {
  try {
    const command = new ScanCommand({
      TableName: DYNAMODB_TABLE_NAME,
    });

    const response = await docClient.send(command);
    
    // Parse DynamoDB format to simple objects
    const items = response.Items || [];
    const sessions = items.map(item => ({
      id: item.id,
      date: item.date,
      time: item.time,
      location: item.location,
      topic: item.topic,
      participants: item.participants || [],
    }));

    // Sort by date (newest first)
    sessions.sort((a, b) => new Date(b.date) - new Date(a.date));

    return sessions;
  } catch (error) {
    console.error('Error fetching sessions from DynamoDB:', error);
    throw error;
  }
}
