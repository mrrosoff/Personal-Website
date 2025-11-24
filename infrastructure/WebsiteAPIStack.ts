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
import { config } from "dotenv";

import { ApplicationEnvironment } from "./app";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { AttributeType, BillingMode, StreamViewType, Table } from "aws-cdk-lib/aws-dynamodb";

export const FLAVORS_TABLE = "website-flavors";

class WebsiteAPIStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const env = config().parsed as ApplicationEnvironment | undefined;
        if (!env) {
            throw new Error("Environment variables not found");
        }

        const flavorsTable = this.createFlavorsTable();

        const apiRole = this.createAPILambdaRole(flavorsTable);
        const inventoryLambda = this.createInventoryLambda(env, apiRole);
        const checkoutLambda = this.createCheckoutLambda(env, apiRole);
        const checkoutStatusLambda = this.createCheckoutStatusLambda(env, apiRole);
        const receiveLambda = this.createReceiveLambda(env, apiRole);
        const registerLambda = this.createRegisterLambda(env, apiRole);
        const sendEmailLambda = this.createSendEmailLambda(env, apiRole);
        const unsubscribeLambda = this.createUnsubscribeLambda(env, apiRole);

        const certificate = new Certificate(this, "websiteCertificate", {
            domainName: "maxrosoff.com",
            subjectAlternativeNames: ["*.maxrosoff.com"],
            validation: CertificateValidation.fromDns()
        });
        const restApi = this.createAPI(
            certificate,
            inventoryLambda,
            checkoutLambda,
            checkoutStatusLambda,
            receiveLambda,
            registerLambda,
            sendEmailLambda,
            unsubscribeLambda
        );

        const alarmTopic = this.createAlarmActions();
        this.createLambdaErrorAlarms(alarmTopic, [
            inventoryLambda,
            checkoutLambda,
            checkoutStatusLambda,
            receiveLambda,
            registerLambda,
            sendEmailLambda,
            unsubscribeLambda
        ]);
        this.createRestAPIErrorsAlarm(alarmTopic, restApi);
    }

    private createFlavorsTable(): Table {
        return new Table(this, "cantaloupePartiesTable", {
            tableName: FLAVORS_TABLE,
            partitionKey: { name: "priceId", type: AttributeType.STRING },
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
            deletionProtection: true
        });
    }

    private createAPI(
        certificate: Certificate,
        inventoryLambda: LambdaFunction,
        checkoutLambda: LambdaFunction,
        checkoutReturnLambda: LambdaFunction,
        receiveLambda: LambdaFunction,
        registerLambda: LambdaFunction,
        sendEmailLambda: LambdaFunction,
        unsubscribeLambda: LambdaFunction
    ): RestApi {
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
            .addMethod("POST", new LambdaIntegration(checkoutReturnLambda));
        api.root.addResource("receive").addMethod("POST", new LambdaIntegration(receiveLambda));
        api.root.addResource("register").addMethod("POST", new LambdaIntegration(registerLambda));
        api.root
            .addResource("send-email")
            .addMethod("POST", new LambdaIntegration(sendEmailLambda));
        api.root
            .addResource("unsubscribe")
            .addMethod("POST", new LambdaIntegration(unsubscribeLambda));
        return api;
    }

    private createInventoryLambda(env: ApplicationEnvironment, role: Role): LambdaFunction {
        const functionName = "website-inventory";
        return new LambdaFunction(this, "websiteInventoryLambda", {
            functionName,
            handler: "inventory.handler",
            code: Code.fromAsset("dist/lambda/inventory"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(env, functionName, role)
        });
    }

    private createCheckoutLambda(env: ApplicationEnvironment, role: Role): LambdaFunction {
        const functionName = "website-checkout";
        return new LambdaFunction(this, "websiteCheckoutLambda", {
            functionName,
            handler: "checkout.handler",
            code: Code.fromAsset("dist/lambda/checkout"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(env, functionName, role)
        });
    }

    private createCheckoutStatusLambda(env: ApplicationEnvironment, role: Role): LambdaFunction {
        const functionName = "website-checkout-status";
        return new LambdaFunction(this, "websiteCheckoutStatusLambda", {
            functionName,
            handler: "checkoutStatus.handler",
            code: Code.fromAsset("dist/lambda/checkoutStatus"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(env, functionName, role)
        });
    }

    private createReceiveLambda(env: ApplicationEnvironment, role: Role): LambdaFunction {
        const functionName = "website-receive";
        return new LambdaFunction(this, "websiteReceiveLambda", {
            functionName,
            handler: "receive.handler",
            code: Code.fromAsset("dist/lambda/receive"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(env, functionName, role)
        });
    }

    private createRegisterLambda(env: ApplicationEnvironment, role: Role): LambdaFunction {
        const functionName = "website-register";
        return new LambdaFunction(this, "websiteRegisterLambda", {
            functionName,
            handler: "register.handler",
            code: Code.fromAsset("dist/lambda/register"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(env, functionName, role)
        });
    }

    private createSendEmailLambda(env: ApplicationEnvironment, role: Role): LambdaFunction {
        const functionName = "website-send-email";
        return new LambdaFunction(this, "websiteSendEmailLambda", {
            functionName,
            handler: "sendEmail.handler",
            code: Code.fromAsset("dist/lambda/sendEmail"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(env, functionName, role)
        });
    }

    private createUnsubscribeLambda(env: ApplicationEnvironment, role: Role): LambdaFunction {
        const functionName = "website-unsubscribe";
        return new LambdaFunction(this, "websiteUnsubscribeLambda", {
            functionName,
            handler: "unsubscribe.handler",
            code: Code.fromAsset("dist/lambda/unsubscribe"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(env, functionName, role)
        });
    }

    private createLambdaParams(
        env: ApplicationEnvironment,
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
            environment: { ...env, NODE_OPTIONS: "--enable-source-maps" }
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
                TableAccessPolicy: new PolicyDocument({
                    statements: [
                        new PolicyStatement({
                            actions: [
                                "dynamodb:DeleteItem",
                                "dynamodb:DescribeStream",
                                "dynamodb:GetItem",
                                "dynamodb:GetShardIterator",
                                "dynamodb:ListStreams",
                                "dynamodb:PutItem",
                                "dynamodb:Query",
                                "dynamodb:UpdateItem"
                            ],
                            resources: tables.flatMap((table) => [
                                table.tableArn,
                                table.tableArn + "/index/*"
                            ])
                        })
                    ]
                })
            }
        });
    }

    private createLambdaErrorAlarms(alarmTopic: Topic, lambdas: LambdaFunction[]): Alarm[] {
        return lambdas.map((lambda) => {
            const alarm = new Alarm(this, `${lambda.node.id}-ErrorsAlarm`, {
                alarmName: `${lambda.functionName} Errors`,
                metric: lambda.metricErrors(),
                threshold: 0,
                comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
                evaluationPeriods: 1,
                treatMissingData: TreatMissingData.NOT_BREACHING
            });
            alarm.addAlarmAction(new SnsAction(alarmTopic));
            return alarm;
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
