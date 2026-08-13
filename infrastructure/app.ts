import { App, type Environment } from "aws-cdk-lib";
import WebsiteAPIStack from "./WebsiteAPIStack";

const app = new App();
const env: Environment = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
};

new WebsiteAPIStack(app, "WebsiteAPIStack", { env });
