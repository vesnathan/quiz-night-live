/**
 * Bootstrap Resource Checker
 *
 * Checks that the required bootstrap resources exist before deployment can proceed.
 * These resources must be created manually (one-time setup) for security reasons.
 *
 * WHY WE DO IT THIS WAY:
 * =====================
 *
 * Security Principle: Least Privilege
 *
 * The deployment user (wpq-deploy) has MINIMAL permissions:
 *   - Create/update CloudFormation stacks (scoped to wpq-* stacks only)
 *   - Upload templates to ONE specific S3 bucket
 *   - Pass the CloudFormation service role
 *
 * This means:
 *   - The deploy user CANNOT create IAM roles directly
 *   - The deploy user CANNOT access any S3 bucket except the template bucket
 *   - The deploy user CANNOT create/modify AWS resources directly
 *
 * All actual resource creation is done BY CloudFormation using a SERVICE ROLE
 * that has broader permissions.
 *
 * BOOTSTRAP RESOURCES:
 * ===================
 *
 * 1. S3 Bucket: wpq-deploy-templates (in ap-southeast-2)
 *    - Stores CloudFormation templates
 *    - Only the deploy user and CloudFormation need access
 *
 * 2. IAM Role: wpq-cloudformation-role
 *    - CloudFormation assumes this role to create resources
 *    - Has permissions to create all required AWS resources
 */

import {
  S3Client,
  GetBucketLocationCommand,
} from "@aws-sdk/client-s3";
import {
  IAMClient,
  GetRoleCommand,
} from "@aws-sdk/client-iam";

const ACCOUNT_ID = process.env.AWS_ACCOUNT_ID || "430118819356";

export interface BootstrapConfig {
  templateBucketName: string;
  cfnRoleName: string;
  cfnRoleArn: string;
  region: string;
}

const MAIN_REGION = "ap-southeast-2";
// Use existing bucket name from wpq bootstrap
const TEMPLATE_BUCKET_NAME = "wpq-deploy-templates";

export function getBootstrapConfig(): BootstrapConfig {
  // Use CFN_ROLE_ARN from .env if available
  const cfnRoleArn = process.env.CFN_ROLE_ARN || `arn:aws:iam::${ACCOUNT_ID}:role/wpq-cfn-role`;
  const cfnRoleName = cfnRoleArn.split('/').pop() || 'wpq-cfn-role';

  return {
    templateBucketName: TEMPLATE_BUCKET_NAME,
    cfnRoleName,
    cfnRoleArn,
    region: MAIN_REGION,
  };
}

export async function checkBootstrapResources(): Promise<{
  ready: boolean;
  missingBucket: boolean;
  missingRole: boolean;
  config: BootstrapConfig;
}> {
  const config = getBootstrapConfig();

  const s3 = new S3Client({ region: MAIN_REGION });
  const iam = new IAMClient({ region: MAIN_REGION });

  let missingBucket = false;
  let missingRole = false;

  // Check template bucket
  try {
    await s3.send(new GetBucketLocationCommand({ Bucket: config.templateBucketName }));
  } catch (error: unknown) {
    missingBucket = true;
  }

  // Check CloudFormation role
  try {
    await iam.send(new GetRoleCommand({ RoleName: config.cfnRoleName }));
  } catch (error: unknown) {
    missingRole = true;
  }

  return {
    ready: !missingBucket && !missingRole,
    missingBucket,
    missingRole,
    config,
  };
}

export function printBootstrapInstructions(
  missingBucket: boolean,
  missingRole: boolean,
  config: BootstrapConfig
): void {
  console.log("\n" + "=".repeat(70));
  console.log("  BOOTSTRAP SETUP REQUIRED");
  console.log("=".repeat(70));

  if (missingBucket) {
    console.log(`
MISSING: S3 Template Bucket
───────────────────────────
Create an S3 bucket named: ${config.templateBucketName}

AWS Console:
  1. Go to S3 > Create bucket
  2. Bucket name: ${config.templateBucketName}
  3. Region: ap-southeast-2
  4. Block all public access: YES (keep enabled)
  5. Create bucket

Or via CLI (with admin credentials):
  aws s3 mb s3://${config.templateBucketName} --region ap-southeast-2
`);
  }

  if (missingRole) {
    console.log(`
MISSING: CloudFormation Service Role
─────────────────────────────────────
Create an IAM role named: ${config.cfnRoleName}

AWS Console:
  1. Go to IAM > Roles > Create role
  2. Trusted entity: AWS service
  3. Service: CloudFormation
  4. Attach policy: AdministratorAccess (or use the policy in iam-policies/)
  5. Role name: ${config.cfnRoleName}
  6. Create role
`);
  }

  console.log("=".repeat(70));
  console.log("  After creating the missing resources, run the deploy again.");
  console.log("=".repeat(70) + "\n");
}
