# IAM Policy Setup for Live Pub Quiz

## Overview

This directory contains IAM policies for secure CloudFormation-based deployments.

## Security Architecture

The deployment uses a **least-privilege** approach:

1. **wpq-deploy user** - Minimal permissions to:
   - Create/update/delete CloudFormation stacks (scoped to wpq-* stacks only)
   - Upload templates to the wpq-deploy-templates S3 bucket
   - Pass the CloudFormation service role
   - Assume app-specific deploy roles (created by CloudFormation)

2. **wpq-cloudformation-role** - CloudFormation execution role with permissions to:
   - Create all AWS resources (S3, CloudFront, Cognito, DynamoDB, Lambda, AppSync, etc.)
   - Must be created manually before first deployment

## Bootstrap Setup

Before deploying, you must create two resources manually:

### Step 1: Create S3 Template Bucket

```bash
aws s3 mb s3://wpq-deploy-templates --region ap-southeast-2
```

Or via AWS Console:
1. Go to S3 > Create bucket
2. Bucket name: wpq-deploy-templates
3. Region: ap-southeast-2
4. Block all public access: YES
5. Create bucket

### Step 2: Create CloudFormation Service Role

Via AWS Console:
1. Go to IAM > Roles > Create role
2. Trusted entity: AWS service
3. Service: CloudFormation
4. Attach policy: AdministratorAccess
5. Role name: wpq-cloudformation-role
6. Create role

### Step 3: Update wpq-deploy user policy

1. Go to IAM > Users > wpq-deploy
2. Remove any existing inline policies
3. Create a new inline policy with the contents of `wpq-deploy-minimal.json`

## How It Works

1. **Template upload**: Deploy script uploads CFN templates to wpq-deploy-templates bucket
2. **Stack deployment**: CloudFormation creates/updates stack using wpq-cloudformation-role
3. **Frontend upload**: Stack creates a deploy role, deploy script assumes it to upload files
4. **Role cleanup**: Roles are deleted when stack is deleted

## Security Benefits

- Deploy user has minimal permissions
- All resource creation goes through CloudFormation
- Audit trail in CloudFormation events
- Easy to revoke access by deleting the deploy user
