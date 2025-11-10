import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

export async function getSessions() {
  try {
    const command = new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || 'forever-english-corner-dev',
    });

    const response = await docClient.send(command);
    
    // Parse DynamoDB format to simple objects
    const sessions = response.Items.map(item => ({
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
