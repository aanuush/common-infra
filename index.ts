import * as aws from "@pulumi/aws";

// Define domain
const domainName = "example.com"; // Change to your domain

// Create a Route 53 hosted zone
const hostedZone = new aws.route53.Zone("myHostedZone", {
    name: domainName,
});

export const hostedZoneId = hostedZone.id;
export const hostedZoneName = hostedZone.name;

const certificate = new aws.acm.Certificate("myCertificate", {
    domainName: domainName,
    validationMethod: "DNS",
}, { provider: new aws.Provider("useast1", { region: "us-east-1" }) });

export const certificateArn = certificate.arn;
