import { Duration, Stack, StackProps } from "aws-cdk-lib";
import {
    Cors,
    EndpointType,
    LambdaIntegration,
    MethodLoggingLevel,
    RestApi
} from "aws-cdk-lib/aws-apigateway";
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import {
    Alarm,
    ComparisonOperator,
    MathExpression,
    Metric,
    TreatMissingData
} from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
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
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Topic } from "aws-cdk-lib/aws-sns";

import { Construct } from "constructs";
import { config } from "dotenv";

import { ApplicationEnvironment } from "./app";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";

class WebsiteAPIStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const env = config().parsed as ApplicationEnvironment | undefined;
        if (!env) {
            throw new Error("Environment variables not found");
        }

        const apiRole = this.createAPILambdaRole();
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
            registerLambda,
            sendEmailLambda,
            unsubscribeLambda
        );

        const alarmTopic = this.createAlarmActions();
        this.createLambdaErrorRateAlarm(alarmTopic, [
            registerLambda,
            sendEmailLambda,
            unsubscribeLambda
        ]);
        this.createRestAPIErrorRateAlarm(alarmTopic, restApi);
    }

    private createAPI(
        certificate: Certificate,
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
                tracingEnabled: true,
                loggingLevel: MethodLoggingLevel.ERROR
            },
            defaultCorsPreflightOptions: { allowOrigins: Cors.ALL_ORIGINS },
            endpointExportName: "WebsiteApiEndpoint"
        });
        api.root.addResource("register").addMethod("POST", new LambdaIntegration(registerLambda));
        api.root
            .addResource("send-email")
            .addMethod("POST", new LambdaIntegration(sendEmailLambda));
        api.root
            .addResource("unsubscribe")
            .addMethod("POST", new LambdaIntegration(unsubscribeLambda));
        return api;
    }

    private createRegisterLambda(env: ApplicationEnvironment, role: Role): LambdaFunction {
        return new LambdaFunction(this, "websiteRegisterLambda", {
            functionName: "website-register",
            handler: "register.handler",
            code: Code.fromAsset("dist/lambda"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(env, role)
        });
    }

    private createSendEmailLambda(env: ApplicationEnvironment, role: Role): LambdaFunction {
        return new LambdaFunction(this, "websiteSendEmailLambda", {
            functionName: "website-send-email",
            handler: "sendEmail.handler",
            code: Code.fromAsset("dist/lambda"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(env, role)
        });
    }

    private createUnsubscribeLambda(env: ApplicationEnvironment, role: Role): LambdaFunction {
        return new LambdaFunction(this, "websiteUnsubscribeLambda", {
            functionName: "website-unsubscribe",
            handler: "unsubscribe.handler",
            code: Code.fromAsset("dist/lambda"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(env, role)
        });
    }

    private createLambdaParams(env: ApplicationEnvironment, role: Role): Partial<FunctionProps> {
        return {
            role,
            memorySize: 2048,
            timeout: Duration.seconds(29),
            tracing: Tracing.ACTIVE,
            logRetention: RetentionDays.ONE_MONTH,
            loggingFormat: LoggingFormat.JSON,
            applicationLogLevelV2: ApplicationLogLevel.WARN,
            systemLogLevelV2: SystemLogLevel.WARN,
            environment: { ...env, NODE_OPTIONS: "--enable-source-maps" }
        };
    }

    private createAPILambdaRole(): Role {
        return new Role(this, "websiteApiLambdaRole", {
            roleName: "APILambdaRole",
            assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
                ManagedPolicy.fromAwsManagedPolicyName("AWSXrayWriteOnlyAccess")
            ]
        });
    }

    private createLambdaErrorRateAlarm(alarmTopic: Topic, lambdas: LambdaFunction[]): Alarm {
        const totalErrors = lambdas.map((lambda) => lambda.metricErrors());
        const totalInvocations = lambdas.map((lambda) => lambda.metricInvocations());

        const metricMap: Record<string, Metric> = {};
        totalErrors.forEach((metric, i) => (metricMap[`e${i}`] = metric));
        totalInvocations.forEach((metric, i) => (metricMap[`i${i}`] = metric));

        const errorSumExpr = totalErrors.map((_, i) => `e${i}`).join(" + ");
        const invocationSumExpr = totalInvocations.map((_, i) => `i${i}`).join(" + ");
        const successRateExpr = `(1 - (${errorSumExpr}) / (${invocationSumExpr})) * 100`;

        const alarm = new Alarm(this, `WebsiteLambdasSuccessRateAlarm`, {
            alarmName: "Website Lambdas Success Rate",
            metric: new MathExpression({
                label: "Website Lambdas Success Rate",
                expression: successRateExpr,
                usingMetrics: metricMap,
                period: Duration.minutes(5)
            }),
            threshold: 99.99,
            comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
            evaluationPeriods: 1,
            treatMissingData: TreatMissingData.NOT_BREACHING
        });

        alarm.addAlarmAction(new SnsAction(alarmTopic));
        return alarm;
    }

    private createRestAPIErrorRateAlarm(alarmTopic: Topic, api: RestApi): Alarm {
        const errorRateExpression = new MathExpression({
            label: "Website API Success Rate",
            expression: "(1 - (clientErrors + serverErrors) / invocations) * 100",
            usingMetrics: {
                clientErrors: api.metricClientError(),
                serverErrors: api.metricServerError(),
                invocations: api.metricCount()
            },
            period: Duration.minutes(5)
        });

        const alarm = new Alarm(this, `WebsiteRestApiSuccessRateAlarm`, {
            alarmName: "Website Rest API Success Rate",
            metric: errorRateExpression,
            threshold: 99.99,
            comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
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
