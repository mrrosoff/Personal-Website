import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Cors, EndpointType, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import { Alarm, ComparisonOperator, TreatMissingData } from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import {
    ManagedPolicy,
    PolicyDocument,
    PolicyStatement,
    Role,
    ServicePrincipal
} from "aws-cdk-lib/aws-iam";
import {
    ApplicationLogLevel,
    Code,
    FunctionProps,
    Function as LambdaFunction,
    LoggingFormat,
    Runtime,
    SystemLogLevel,
    Tracing
} from "aws-cdk-lib/aws-lambda";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { Topic } from "aws-cdk-lib/aws-sns";

import { Construct } from "constructs";

import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";

export const FLAVORS_TABLE = "website-flavors";

class WebsiteAPIStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const flavorsTable = this.createFlavorsTable();

        const certificate = new Certificate(this, "websiteCertificate", {
            domainName: "maxrosoff.com",
            subjectAlternativeNames: ["*.maxrosoff.com"],
            validation: CertificateValidation.fromDns()
        });
        const apiRole = this.createAPILambdaRole(flavorsTable);
        const restApi = this.createAPI(
            certificate,
            apiRole,
        );

        const alarmTopic = this.createAlarmActions();
        this.createRestAPIErrorsAlarm(alarmTopic, restApi);
    }

    private createFlavorsTable(): Table {
        return new Table(this, "websiteFlavorsTable", {
            tableName: FLAVORS_TABLE,
            partitionKey: { name: "productId", type: AttributeType.STRING },
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
            deletionProtection: true
        });
    }

    private createAPI(
        certificate: Certificate,
        apiRole: Role
    ): RestApi {
        const inventoryLambda = this.createInventoryLambda(apiRole);
        const checkoutLambda = this.createCheckoutLambda(apiRole);
        const checkoutStatusLambda = this.createCheckoutStatusLambda(apiRole);
        const checkoutSuccessLambda = this.createCheckoutSuccessLambda(apiRole);

        const receiveLambda = this.createReceiveLambda(apiRole);
        const registerLambda = this.createRegisterLambda(apiRole);
        const sendEmailLambda = this.createSendEmailLambda(apiRole);
        const unsubscribeLambda = this.createUnsubscribeLambda(apiRole);

        const passwordCheckLambda = this.createPasswordCheckLambda(apiRole);
        const provisionFlavorLambda = this.createProvisionFlavorLambda(apiRole);
        const updateInventoryLambda = this.createUpdateInventoryLambda(apiRole);

        const api = new RestApi(this, "websiteRestApi", {
            restApiName: "Website API",
            description: "The service endpoint for Personal Website API",
            domainName: {
                domainName: "api.maxrosoff.com",
                endpointType: EndpointType.EDGE,
                certificate
            },
            disableExecuteApiEndpoint: true,
            deployOptions: {
                stageName: "production",
                tracingEnabled: true
            },
            defaultCorsPreflightOptions: { allowOrigins: Cors.ALL_ORIGINS },
            endpointExportName: "WebsiteApiEndpoint"
        });
        api.root.addResource("inventory").addMethod("POST", new LambdaIntegration(inventoryLambda));
        api.root.addResource("checkout").addMethod("POST", new LambdaIntegration(checkoutLambda));
        api.root
            .addResource("checkout-status")
            .addMethod("POST", new LambdaIntegration(checkoutStatusLambda));
        api.root
            .addResource("checkout-success")
            .addMethod("POST", new LambdaIntegration(checkoutSuccessLambda));
        api.root.addResource("receive").addMethod("POST", new LambdaIntegration(receiveLambda));
        api.root.addResource("register").addMethod("POST", new LambdaIntegration(registerLambda));
        api.root
            .addResource("send-email")
            .addMethod("POST", new LambdaIntegration(sendEmailLambda));
        api.root
            .addResource("unsubscribe")
            .addMethod("POST", new LambdaIntegration(unsubscribeLambda));

        const adminResource = api.root.addResource("admin");
        adminResource
            .addResource("password-check")
            .addMethod("POST", new LambdaIntegration(passwordCheckLambda));
        adminResource
            .addResource("provision-flavor")
            .addMethod("POST", new LambdaIntegration(provisionFlavorLambda));
        adminResource
            .addResource("update-inventory")
            .addMethod("POST", new LambdaIntegration(updateInventoryLambda));
        return api;
    }

    private createInventoryLambda(role: Role): LambdaFunction {
        const functionName = "website-inventory";
        return new LambdaFunction(this, "websiteInventoryLambda", {
            functionName,
            handler: "inventory.handler",
            code: Code.fromAsset("dist/lambda/ice-cream/inventory"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createCheckoutLambda(role: Role): LambdaFunction {
        const functionName = "website-checkout";
        return new LambdaFunction(this, "websiteCheckoutLambda", {
            functionName,
            handler: "checkout.handler",
            code: Code.fromAsset("dist/lambda/ice-cream/checkout"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createCheckoutStatusLambda(role: Role): LambdaFunction {
        const functionName = "website-checkout-status";
        return new LambdaFunction(this, "websiteCheckoutStatusLambda", {
            functionName,
            handler: "checkoutStatus.handler",
            code: Code.fromAsset("dist/lambda/ice-cream/checkoutStatus"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createCheckoutSuccessLambda(role: Role): LambdaFunction {
        const functionName = "website-checkout-success";
        return new LambdaFunction(this, "websiteCheckoutSuccessLambda", {
            functionName,
            handler: "checkoutSuccess.handler",
            code: Code.fromAsset("dist/lambda/ice-cream/checkoutSuccess"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createReceiveLambda(role: Role): LambdaFunction {
        const functionName = "website-receive";
        return new LambdaFunction(this, "websiteReceiveLambda", {
            functionName,
            handler: "receive.handler",
            code: Code.fromAsset("dist/lambda/email/receive"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createRegisterLambda(role: Role): LambdaFunction {
        const functionName = "website-register";
        return new LambdaFunction(this, "websiteRegisterLambda", {
            functionName,
            handler: "register.handler",
            code: Code.fromAsset("dist/lambda/email/register"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createSendEmailLambda(role: Role): LambdaFunction {
        const functionName = "website-send-email";
        return new LambdaFunction(this, "websiteSendEmailLambda", {
            functionName,
            handler: "sendEmail.handler",
            code: Code.fromAsset("dist/lambda/email/sendEmail"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createUnsubscribeLambda(role: Role): LambdaFunction {
        const functionName = "website-unsubscribe";
        return new LambdaFunction(this, "websiteUnsubscribeLambda", {
            functionName,
            handler: "unsubscribe.handler",
            code: Code.fromAsset("dist/lambda/email/unsubscribe"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createPasswordCheckLambda(role: Role): LambdaFunction {
        const functionName = "website-password-check";
        return new LambdaFunction(this, "websitePasswordCheckLambda", {
            functionName,
            handler: "passwordCheck.handler",
            code: Code.fromAsset("dist/lambda/admin/passwordCheck"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createProvisionFlavorLambda(role: Role): LambdaFunction {
        const functionName = "website-provision-flavor";
        return new LambdaFunction(this, "websiteProvisionFlavorLambda", {
            functionName,
            handler: "provisionFlavor.handler",
            code: Code.fromAsset("dist/lambda/admin/provisionFlavor"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createUpdateInventoryLambda(role: Role): LambdaFunction {
        const functionName = "website-update-inventory";
        return new LambdaFunction(this, "websiteUpdateInventoryLambda", {
            functionName,
            handler: "updateInventory.handler",
            code: Code.fromAsset("dist/lambda/admin/updateInventory"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createLambdaParams(
        functionName: string,
        role: Role
    ): Partial<FunctionProps> {
        return {
            role,
            memorySize: 2048,
            timeout: Duration.seconds(29),
            tracing: Tracing.ACTIVE,
            logGroup: new LogGroup(this, `${functionName}LambdaLogGroup`, {
                logGroupName: `/aws/lambda/${functionName}`,
                retention: RetentionDays.ONE_MONTH,
                removalPolicy: RemovalPolicy.DESTROY
            }),
            loggingFormat: LoggingFormat.JSON,
            applicationLogLevelV2: ApplicationLogLevel.WARN,
            systemLogLevelV2: SystemLogLevel.WARN,
            environment: { NODE_ENV: "production", NODE_OPTIONS: "--enable-source-maps" }
        };
    }

    private createAPILambdaRole(...tables: Table[]): Role {
        return new Role(this, "websiteApiLambdaRole", {
            roleName: "APILambdaRole",
            assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
                ManagedPolicy.fromAwsManagedPolicyName("AWSXrayWriteOnlyAccess")
            ],
            inlinePolicies: {
                SSMAccessPolicy: new PolicyDocument({
                    statements: [
                        new PolicyStatement({ actions: ["ssm:*"], resources: ["*"] })
                    ]
                }),
                TableAccessPolicy: new PolicyDocument({
                    statements: [
                        new PolicyStatement({
                            actions: ["dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:Scan"],
                            resources: tables.flatMap((table) => [table.tableArn])
                        })
                    ]
                })
            }
        });
    }

    private createRestAPIErrorsAlarm(alarmTopic: Topic, api: RestApi): Alarm {
        const alarm = new Alarm(this, `WebsiteApiServerErrorsAlarm`, {
            alarmName: "Website API Server Errors",
            metric: api.metricServerError(),
            threshold: 0,
            comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
            evaluationPeriods: 1,
            treatMissingData: TreatMissingData.NOT_BREACHING
        });

        alarm.addAlarmAction(new SnsAction(alarmTopic));
        return alarm;
    }

    private createAlarmActions() {
        const topic = new Topic(this, "websiteAlarmTopic", {
            topicName: "website-alarms"
        });
        topic.addSubscription(new EmailSubscription("me@maxrosoff.com"));
        return topic;
    }
}

export default WebsiteAPIStack;
