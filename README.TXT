Test
1. frst setup AWSCli 
2. config it using aws configure cmd
3. map AWS Access Key ID and AWS Secret Acess Key
Default region
Defult output format 
4. verify usinf 
aws sts get-caller-identity
5. install Pulumi



 index.ts file in app


import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Reference common-infra stack
const commonInfra = new pulumi.StackReference("anush/common-infra/dev");

// Fetch certificate and domain from common-infra
const certificateArn = commonInfra.getOutput("certificateArn");
const domainName = commonInfra.getOutput("domain");

// Create an S3 Bucket for hosting
const siteBucket = new aws.s3.Bucket("siteBucket", {
    website: { indexDocument: "index.html" }
});

// Upload an example index.html (Fix missing file in Step 2)
new aws.s3.BucketObject("index", {
    bucket: siteBucket,
    source: new pulumi.asset.FileAsset("index.html"),
    contentType: "text/html"
});

// Fix CloudFront Output Handling
const cloudfront = new aws.cloudfront.Distribution("cdn", {
    enabled: true,
    origins: [{
        domainName: siteBucket.bucketRegionalDomainName,  // ✅ Fix Output<T> issue
        originId: "s3Origin",
        s3OriginConfig: {
            originAccessIdentity: ""
        }
    }],
    defaultCacheBehavior: {
        targetOriginId: "s3Origin",
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD"],
        cachedMethods: ["GET", "HEAD"],
        forwardedValues: {
            queryString: false,
            cookies: { forward: "none" },
        }
    },
    viewerCertificate: {
        acmCertificateArn: certificateArn.apply(arn => arn), // ✅ Fix Output<T> issue
        sslSupportMethod: "sni-only"
    },
    restrictions: {
        geoRestriction: {
            restrictionType: "none"
        }
    }
});

// Export CloudFront URL
export const cloudfrontUrl = pulumi.interpolate`${cloudfront.domainName}`; // ✅ Fix Output<T> issue




index.ts in common


import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Configuration
const domainName = "anush.com";  // Replace with your actual domain

// Create a Route 53 Hosted Zone
const hostedZone = new aws.route53.Zone("hostedZone", {
    name: domainName,
});

// Create an ACM Certificate
const certificate = new aws.acm.Certificate("sslCertificate", {
    domainName: domainName,
    validationMethod: "DNS",
}, { provider: new aws.Provider("useast1", { region: "us-east-1" }) });

// Export values to be used by app-infra
export const hostedZoneId = hostedZone.id;
export const certificateArn = certificate.arn;
export const domain = domainName;


pulumi new aws-typescript --force
npm install
pulumi up

create hosted zone accordingly

