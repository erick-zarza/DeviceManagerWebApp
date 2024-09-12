# Data Catalog - Terraform

### Solution Version: v1.0.0

## Table of Contents

- [Solution Overview](#solution-overview)
- [Architecture](#architecture)
- [Prerequisites and Limitations](#prerequisites_and_limitations)
- [Best Practices](#best-practices)
- [Prerequisites](#prerequisites)
- [Deployment Instructions](#deployment-instructions)
- [Testing Instructions](#testing-instructions)  
- [Troubleshooting](#troubleshooting)
- [Removal and Rollback](#removal-instructions)
- [Tools](#tools)
- [Related Resources](#related-resources)
- [Additional Information](#additional-information)
- [FAQ](#faq)
- [Cost Estimates](#cost-estimates)
- [License](#license)
- [Contributing](#contributing)

## Solution Overview

This Terraform module creates a data catalog solution using AWS Glue, Amazon Redshift, and other related services. The module provisions an Amazon Redshift cluster and database, AWS Glue crawlers, jobs, and connections to extract, transform, and load data from various data sources into the Redshift database. The solution also includes an S3 bucket for storing Glue artifacts and a security group for Glue resources.

## Solution Details
**Main Technology:**
    -- Databases
**Additional Technologies:**
    -- Analytics
    -- Data lakes
    -- Storage & backup
    -- Development & testing
**Environment:** Production

## Architecture

### Target Technology Stack

**AWS Services Used:**
- AWS Glue
- Amazon Redshift
- Amazon S3
- AWS Secrets Manager
- AWS Identity and Access Management (IAM)

### Architecture Details

This module deploys a set of AWS Glue resources, including crawlers, jobs, and connections, to extract data from various sources, transform it, and load it into an Amazon Redshift cluster. The Redshift cluster serves as the central data repository, while the Glue resources handle the data processing and transformation tasks.

The module creates an Amazon Redshift cluster and database, along with a secret in AWS Secrets Manager to store the database credentials. It also provisions an S3 bucket for storing Glue artifacts, such as scripts and utilities.

Glue crawlers are created to crawl the data sources and populate the Glue Data Catalog with metadata. The module supports crawling both JDBC data sources (e.g., Redshift) and S3 data sources. Multiple crawlers are created, one for the Redshift data sources and others for different data transformation features.

Glue jobs are created for various tasks, including preprocessing, change data capture (CDC), field mapping, and loading data into the Redshift cluster. These jobs are configured with appropriate settings, such as Glue version, worker type, number of workers, and auto-scaling.

The module also creates an IAM role with the necessary permissions for Glue to access the required resources, such as S3 buckets, Redshift clusters, and Secrets Manager.

### Architecture Diagram

```mermaid
graph LR
subgraph AWS Cloud
    subgraph Account
        subgraph Region
            VPC[VPC]
            Subnet[Subnet]
            RedshiftCluster[Redshift Cluster]
            GlueConnection[Glue Connection]
            GlueCrawlers[Glue Crawlers]
            GlueJobs[Glue Jobs]
            S3Bucket[S3 Bucket]
            SecurityGroup[Security Group]
            IAMRole[IAM Role]
            SecretsManagerSecret[Secrets Manager Secret]

            VPC --> Subnet
            Subnet --> RedshiftCluster
            Subnet --> GlueConnection
            GlueConnection --> RedshiftCluster
            GlueConnection --> GlueCrawlers
            GlueCrawlers --> GlueJobs
            GlueJobs --> RedshiftCluster
            GlueJobs --> S3Bucket
            S3Bucket --> GlueCrawlers
            SecurityGroup --> RedshiftCluster
            SecurityGroup --> GlueConnection
            IAMRole --> GlueCrawlers
            IAMRole --> GlueJobs
            SecretsManagerSecret --> RedshiftCluster
            SecretsManagerSecret --> GlueConnection
        end
    end
end

classDef container fill:#f9f,stroke:#333
classDef resource fill:#f9f,stroke:#333
classDef region fill:#ddd,stroke:#333
classDef account fill:#fff,stroke:#000

class AWS Cloud fill:#fff,stroke:#000
class Account fill:#fff,stroke:#000
class Region region
class VPC,Subnet container
class RedshiftCluster,GlueConnection,GlueCrawlers,GlueJobs,S3Bucket,SecurityGroup,IAMRole,SecretsManagerSecret resource
```

### Module structure

```
root_module/
├── data_catalog.tf
├── variables.tf
└── modules/
    └── data_catalog/
        ├── main.tf
        ├── variables.tf
        └── outputs.tf
```

### Module Variables

**root_module/variables.tf**

| Variable Name                | Description                                                                    | Type           | Required              | Default               |
| ----------------------------- | ------------------------------------------------------------------------------ | -------------- | --------------------- | --------------------- |
| `vpc_id`                      | Security Group VPC Id                                                          | `string`       | Yes                   |                       |
| `subnet_id`                   | Subnets Configuration List                                                    | `string`       | Yes                   |                       |
| `redshift_connection_subnet_az` | Redshift Connection Subnet Availability Zone                                  | `string`       | Yes                   |                       |
| `master_user`                 | Redshift Cluster Database Master User Name                                    | `string`       | Yes                   |                       |
| `master_password`             | Redshift Cluster Database Master Password                                     | `string`       | Yes                   |                       |
| `data_sources`                | Data Catalog Data sources                                                     | `list(string)` | Yes                   |                       |
| `transform_features`          | Transform Features                                                             | `list(string)` | Yes                   |                       |
| `s3_bucket_versioning`        | S3 Bucket Versioning                                                          | `string`       | Yes                   |                       |
| `region`                      | AWS Region                                                                    | `string`       | Yes                   |                       |
| `user_defined_tags`           | User defined tags                                                             | `map(string)`  | Yes, but may be empty |                       |
| `recrawl_behavior`            | Recrawl Behavior                                                              | `string`       | No                    | `CRAWL_EVERYTHING`    |
| `delete_behavior`             | Delete Behavior                                                               | `string`       | No                    | `DEPRECATE_IN_DATABASE` |
| `update_behavior`             | Update Behavior                                                               | `string`       | No                    | `UPDATE_IN_DATABASE`  |
| `glue_version`                | Glue version                                                                  | `string`       | No                    | `4.0`                 |
| `worker_type`                 | Worker Type                                                                   | `string`       | No                    | `G.4X`                |
| `number_of_workers`           | Number of Workers                                                             | `number`       | No                    | `20`                  |
| `max_retries`                 | Max Retries                                                                    | `number`       | No                    | `0`                   |
| `timeout`                     | Timeout                                                                        | `number`       | No                    | `120`                 |
| `python_version`              | Python Version                                                                | `string`       | No                    | `3`                   |
| `command_name`                | Command Name                                                                  | `string`       | No                    | `glueetl`             |
| `enable_auto_scaling`         | Enable Auto Scaling                                                           | `string`       | No                    | `true`                |
| `max_concurrent_runs`         | Max Concurrent Runs                                                           | `number`       | No                    | `20`                  |
| `jdbc_enforce_ssl`            | Jdbc Enforce Ssl                                                              | `string`       | No                    | `false`               |

### Template Resources

| Logical ID | Type | Purpose | Additional Details |  
|-|-|-|-|
| redshift_cluster | AWS::RDS::Cluster | Amazon Redshift cluster | Engine: aurora-mysql, Version: 5.7.mysql_aurora.2.07.2 |
| redshift_cluster_instance_1 | AWS::RDS::ClusterInstance | Amazon Redshift cluster instance | Instance class: db.t3.medium |
| redshift_cluster_instance_2 | AWS::RDS::ClusterInstance | Amazon Redshift cluster instance | Instance class: db.t3.medium |
| db_secret | AWS::SecretsManager::Secret | Secret for storing Redshift database credentials | Recovery window: 0 days |
| db_secret_version | AWS::SecretsManager::SecretVersion | Secret version with database credentials | - |
| redshift_glue_database | AWS::Glue::Database | Glue database for Redshift data sources | - |
| redshift_crawler | AWS::Glue::Crawler | Glue crawler for Redshift data sources | Crawls JDBC data sources |
| redshift_connection | AWS::Glue::Connection | Glue connection for Redshift | - |
| datalake_enr_databases | AWS::Glue::Database | Glue databases for data transformation features | One database per feature |
| datalake_enr_crawlers | AWS::Glue::Crawler | Glue crawlers for data transformation features | Crawls S3 data sources |
| preprocessing_job | AWS::Glue::Job | Glue job for data preprocessing | - |
| cdc_job | AWS::Glue::Job | Glue job for change data capture | - |
| field_mapping_job | AWS::Glue::Job | Glue job for field mapping | - |
| redshift_load_job | AWS::Glue::Job | Glue job for loading data into Redshift | Connects to Redshift using the Glue connection |
| glue_artifacts_bucket | AWS::S3::Bucket | S3 bucket for storing Glue artifacts | Versioning can be enabled or suspended |
| glue_security_group | AWS::EC2::SecurityGroup | Security group for Glue resources | Allows inbound and outbound traffic within the security group |
| db_subnet_group | AWS::RDS::DBSubnetGroup | Subnet group for Redshift cluster | - |
| glue_role | AWS::IAM::Role | IAM role for Glue resources | Includes AWSGlueServiceRole managed policy and inline policy |

#### IAM permissions

##### Roles Summary Table

| Role | Purpose | Permissions Required |
|-|-|-|
| `glue_role` | IAM role for Glue resources | AWSGlueServiceRole, S3, Redshift, Secrets Manager |

##### Permissions Details

**glue_role**

- Permissions:
- `arn:aws:iam::aws:policy/service-role/AWSGlueServiceRole` (Managed Policy)
- s3:GetObject
- s3:ListBucket
- redshift:GetClusterCredentials
- secretsmanager:GetSecretValue

## Best Practices

- Deploy the IPAM module first before creating spoke accounts.
- Use consistent user-defined tags configured in the root module.
- Deploy this module in a central Network Hub account suitable for all ingress/egress for your AWS environment.
- Carefully plan your IP address pools to account for future expansion.
- Minimize modifications/removals of IPAM pools once deployed to reduce the chances of errors for workloads using allocated IPs.

### Anti-Patterns

- This solution should not be deployed in the Control Tower Management account.

## Prerequisites and Limitations

### Prerequisites

- **An existing Control Tower environment with Account Factory for Terraform (AFT) deployed.**
- **Ensure you have vended/created a Network Hub Account suitable for centralized network infrastructure in the Infrastructure OU.**
- **Ensure All Features are Enabled in AWS Organizations**
- **Ensure the Network Hub Account is a [delegated administrator for IPAM Management](https://docs.aws.amazon.com/vpc/latest/ipam/enable-integ-ipam.html)**
- **Enable resource sharing within AWS Organizations**

### Limitations

- Each user-defined tag "key" must be unique and cannot begin with "aws:".
- Each user-defined tag "value" must be a minimum length of 1 character.
- Exactly four SDLC environments are supported. Modify the names for SDLC 1-4 in the AWS Systems Manager Parameter Store SDLC parameters deployed by the [Enterprise SSM Parameter Store Replication](https://gitlab.aws.dev/delivery-excellence-center-platform/operations/enterprise-ssm-parameter-store-replication-terraform) module.

## Deployment Instructions

### Account Factory for Terraform

1. **Ensure Prerequisites are met** (see **[Prerequisites and Requirements](#prerequisites-and-requirements) section**).

2. **Plan network topology and prepare for deployment**

The organization should evaluate Regions for deployment and carefully choose which Regions to operate in. Then, a network administrator should plan the allocation of IP pools for each Region and the six environments within them. The following pool structure will be created (decision points are in bold):

- IPAM operating in **selected Regions**
    - Private scope
    - **Top-level pool**
        - **A pool for each region**, with the following pools in each Region:
        - **SDLC1 pool**
        - **SDLC2 pool**
        - **SDLC3 pool**
        - **SDLC4 pool**
        - **Infrastructure pool**
        - **Security pool**
    - (optional) Sandbox scope
    - **Sandbox top-level pool**
        - **A pool for each region**

Consider the following when allocating IP pools:

- Allocate an appropriate amount of IPs for the size of the workloads
- Ensure that the IP pools allow for future expansion
- Confirm that the chosen ranges do not overlap with existing VPCs or on-premises networks, especially if intercommunication is needed.

3. **Create or copy the contents of the `code/terraform/` folder into the Network Hub customizations folder of your `aft-account-customizations` repository**

4. **Configure the arguments in the module call within the root `main.tf` file**

5. **Invoke the account customizations process**

### CLI

[CLI deployment instructions]

## Testing Instructions

### Post deployment testing

[Post deployment testing steps]

### Integrated Testing

[Terratest integration testing instructions]

## Troubleshooting

[Troubleshooting steps]

## Removal and Rollback

- Comment out or remove the module call in the root `main.tf` file, push the changes to the repository you are using for AFT and then invoke the `aft-invoke-customizations` step function for that specific account that module was deployed in.
- Reference: https://docs.aws.amazon.com/controltower/latest/userguide/aft-account-customization-options.html
- Verify resources have been deleted through the account management console, or by viewing the logs on the AWS CodeBuild project logs.
- Once resources have been deleted, you can remove the customization from the accounts in the `aft-account-request` repo, under the `account_customizations_name` argument.

## Tools

- Account Factory for Terraform

## Related Resources

- [AWS Glue Documentation](https://docs.aws.amazon.com/glue/index.html)
- [Amazon Redshift Documentation](https://docs.aws.amazon.com/redshift/index.html)
- [Amazon S3 Documentation](https://docs.aws.amazon.com/s3/index.html)
- [AWS Secrets Manager Documentation](https://docs.aws.amazon.com/secretsmanager/index.html)
- [AWS IAM Documentation](https://docs.aws.amazon.com/iam/index.html)
- [Terraform aws_rds_cluster Resource](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/rds_cluster)
- [Terraform aws_glue_crawler Resource](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/glue_crawler)
- [Terraform aws_glue_job Resource](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/glue_job)
- [Terraform aws_s3_bucket Resource](https://registry.terraform.io/providers/
hashicorp/aws/latest/docs/resources/s3_bucket)
- [Terraform aws_iam_role Resource](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role)

## Additional Information

### Suppressed Checkov and cfn_nag rules

[List of suppressed security scan findings, if any]

## FAQ

1. **What data sources are supported by this module?**
   This module supports both JDBC data sources (e.g., Amazon Redshift) and S3 data sources. The `data_sources` and `transform_features` variables allow you to specify the data sources and transformation features to be included in the solution.

2. **Can I customize the Glue job configurations?**
   Yes, you can customize the Glue job configurations by modifying the corresponding variables in the module. For example, you can change the Glue version, worker type, number of workers, and other settings by adjusting the respective variables.

3. **How do I access the Redshift database credentials?**
   The Redshift database credentials are stored in an AWS Secrets Manager secret. The ARN of the secret is provided as an output (`db_secret_arn`) of the module. You can retrieve the credentials using the AWS CLI or SDK.

4. **Can I enable versioning for the S3 bucket used for Glue artifacts?**
   Yes, you can enable or suspend versioning for the S3 bucket by setting the `s3_bucket_versioning` variable to `"Enabled"` or `"Suspended"`, respectively.

5. **How do I add or modify the IAM permissions for the Glue role?**
   The IAM role for Glue resources is created with the `AWSGlueServiceRole` managed policy and an inline policy. You can modify the inline policy by updating the `data.aws_iam_policy_document.glue_role_policy` data source in the `main.tf` file.

## Cost Estimates

| Service | Pricing Model | Monthly Estimate |
|-|-|-|
| Amazon Redshift | Pay per node-hour and storage | $100-$500 |
| AWS Glue | Pay per Data Processing Unit (DPU) hour | $50-$200 |
| Amazon S3 | Pay per GB stored and data transfer | $10-$50 |
| AWS Secrets Manager | Pay per secret and operation | $1-$5 |
| **Total** | | **$161-$755** |

Cost estimate assumes a medium-sized Redshift cluster, moderate Glue job usage, and typical S3 storage and data transfer. Actual costs will depend on your specific usage patterns and configurations.

## License

This solution is released under the MIT-0 License.

## Contributing

Contributions to this solution are welcome. Please follow the standard GitHub workflow for contributing to open-source projects.
