# Sessions Feature

## Overview
The home page now displays English Corner sessions fetched from AWS DynamoDB, allowing users to:
- View upcoming sessions with registration
- Browse past sessions
- See session details (date, time, location, topic, participants)

## Setup

### 1. AWS Credentials
Add your AWS credentials to `.env.local`:

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
DYNAMODB_TABLE_NAME=forever-english-corner-dev
```

### 2. DynamoDB Table Structure
The application expects sessions in the following format:

```json
{
  "id": "33",
  "date": "2025-10-29",
  "time": "19:30-22:00",
  "location": "Starbucks(深圳联通大厦店)",
  "topic": "Japan's Trailblazing Leader: Sanae Takaichi Breaks the Glass Ceiling",
  "participants": [
    {
      "name": "Andy",
      "email": "416331796@qq.com",
      "gender": "boy"
    }
  ]
}
```

### 3. IAM Permissions
Ensure your AWS IAM user has the following permissions:
- `dynamodb:Scan` on the table
- `dynamodb:GetItem` (optional, for future features)

## Features

### Upcoming Sessions
- Displayed at the top of the home page
- Shows all sessions with dates >= today
- Green "Sign Up" button (requires authentication)
- Sorted by date (earliest first for upcoming)

### Past Sessions
- Shows up to 6 most recent past sessions
- Grayed out to indicate they've passed
- No registration button
- Shows attendance count

### Session Cards Display
Each card shows:
- 📅 Date
- 🕐 Time
- 📍 Location
- 💬 Topic
- 👥 Number of participants

## API Endpoints

### GET /api/sessions
Returns all sessions from DynamoDB

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "33",
      "date": "2025-10-29",
      "time": "19:30-22:00",
      "location": "Starbucks(深圳联通大厦店)",
      "topic": "Session topic",
      "participants": []
    }
  ]
}
```

## File Structure

```
app/
├── api/
│   └── sessions/
│       └── route.js          # API endpoint for fetching sessions
├── components/
│   ├── Sessions.js           # Sessions display component
│   └── Sessions.css          # Sessions styling
└── page.js                   # Updated home page

lib/
└── dynamodb.js               # DynamoDB client and utilities
```

## Future Enhancements

1. **Registration System**
   - Implement actual signup functionality
   - Add/remove participants from DynamoDB
   - Send confirmation emails

2. **User Dashboard**
   - Show user's registered sessions
   - Allow cancellation
   - Session reminders

3. **Admin Features**
   - Create new sessions
   - Edit existing sessions
   - Manage participants

4. **Advanced Features**
   - Session capacity limits
   - Waitlist functionality
   - Session materials/notes
   - Post-session feedback
