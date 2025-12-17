import {
    ApplicationAssociator,
    TargetApplication
} from "@aws-cdk/aws-servicecatalogappregistry-alpha";
import { App, Environment } from "aws-cdk-lib";
import WebsiteAPIStack from "./WebsiteAPIStack";

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

new WebsiteAPIStack(app, "WebsiteAPIStack", { env });
