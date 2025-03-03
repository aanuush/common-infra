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

const commonInfra = new pulumi.StackReference("anush/common-infra/dev");

const certificateArn = commonInfra.getOutput("certificateArn");
const domainName = commonInfra.getOutput("domain");

const siteBucket = new aws.s3.Bucket("siteBucket", {
    website: { indexDocument: "index.html" }
});

new aws.s3.BucketObject("index", {
    bucket: siteBucket,
    source: new pulumi.asset.FileAsset("index.html"),
    contentType: "text/html"
});

const cloudfront = new aws.cloudfront.Distribution("cdn", {
    enabled: true,
    origins: [{
        domainName: siteBucket.bucketRegionalDomainName,
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
        acmCertificateArn: certificateArn.apply(arn => arn),
        sslSupportMethod: "sni-only"
    },
    restrictions: {
        geoRestriction: {
            restrictionType: "none"
        }
    }
});

export const cloudfrontUrl = pulumi.interpolate`${cloudfront.domainName}`; // ✅ Fix Output<T> issue




index.ts in common


import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";


const domainName = "anush.com";  // Replace with your actual domain


const hostedZone = new aws.route53.Zone("hostedZone", {
    name: domainName,
});


const certificate = new aws.acm.Certificate("sslCertificate", {
    domainName: domainName,
    validationMethod: "DNS",
}, { provider: new aws.Provider("useast1", { region: "us-east-1" }) });


export const hostedZoneId = hostedZone.id;
export const certificateArn = certificate.arn;
export const domain = domainName;


pulumi new aws-typescript --force
npm install
pulumi up

create hosted zone accordingly

