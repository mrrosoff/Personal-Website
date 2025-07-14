import {
    ApplicationAssociator,
    TargetApplication
} from "@aws-cdk/aws-servicecatalogappregistry-alpha";
import { App, Environment } from "aws-cdk-lib";
import WebsiteAPIStack from "./WebsiteAPIStack";

export type ApplicationEnvironment = {
    readonly NODE_ENV: string;
};

const app = new App();
const env: Environment = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
};

new ApplicationAssociator(app, "WebsiteAssociatedApplication", {
    applications: [
        TargetApplication.createApplicationStack({
            applicationName: "Personal-Website",
            applicationDescription: "© Max Rosoff",
            stackName: "WebsiteApplicationStack"
        })
    ]
});

// Have to hardcode for now, but this should be application.appRegistryApplication.applicationArn
const applicationArn =
    "arn:aws:resource-groups:us-east-1:170267588697:group/Personal-Website/0abs35le8462l8rrusswjgo1x8";
const tags = { awsApplication: applicationArn };

new WebsiteAPIStack(app, "WebsiteAPIStack", { env, tags });
