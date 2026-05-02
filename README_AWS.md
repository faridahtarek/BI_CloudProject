# AWS Cloud Student Project Guide

This project is a skeleton designed for students taking AWS courses. It demonstrates a full-stack application lifecycle: **Frontend (React) -> Backend (Express/Node.js) -> Storage (Multer/Filesystem) -> Database (In-memory)**.

To complete your cloud deployment on AWS, follow these steps to replace local modules with AWS managed services.

## 1. IAM (Identity and Access Management)
Your EC2 instance needs permissions to talk to S3 and DynamoDB.
- **Action**: Create an IAM Role for EC2.
- **Policies**: `AmazonS3FullAccess` and `AmazonDynamoDBFullAccess` (or more restrictive custom policies).
- **Execution**: Attach this role to your EC2 instance instead of hardcoding AWS access keys in `.env`.

## 2. Amazon S3 (Simple Storage Service)
The app currently saves images to the `/uploads` folder.
- **AWS Integration**: Use the `@aws-sdk/client-s3` and `@aws-sdk/lib-storage` (Upload) packages.
- **Code Change**: In `server.ts`, modify the `POST /api/profiles` route to upload the `req.file` buffer directly to your S3 bucket.
- **URL**: Update the `imageUrl` in the database to point to the S3 Object URL or a CloudFront distribution.

## 3. Amazon DynamoDB or RDS
The app current uses an in-memory `profiles` array.
- **DynamoDB**: Use `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb`. Replace the `profiles.push()` and `profiles` array with `PutCommand` and `ScanCommand`.
- **RDS (SQL)**: Set up a PostgreSQL or MySQL instance. Use `pg` or `mysql2` drivers in the backend to perform `INSERT` and `SELECT` queries.

## 4. Amazon EC2 (Elastic Compute Cloud)
This is where your Node.js application will live.
- **Action**: Launch a T2/T3 micro instance (Amazon Linux or Ubuntu).
- **Setup**: Install Node.js, clone your repo, run `npm install`, then `npm run build` and `npm start`.
- **Security Groups**: Ensure Port 80 (HTTP) or 3000 is open to your IP or the world.

---

### Pro-Tips for Students:
- **Environment Variables**: Use `.env` files for bucket names and database names.
- **Monitoring**: Check **CloudWatch Logs** if your app crashes on EC2.
- **Cost**: Remember to delete your RDS/EC2 instances after the course to avoid charges!
