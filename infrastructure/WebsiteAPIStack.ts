import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Cors, EndpointType, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import { Alarm, ComparisonOperator, MathExpression } from "aws-cdk-lib/aws-cloudwatch";
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
        this.createLambdaErrorRateAlarms(alarmTopic, [
            registerLambda,
            sendEmailLambda,
            unsubscribeLambda
        ]);
        this.createRestAPIErrorRateAlarms(alarmTopic, restApi);
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
            deployOptions: { stageName: "production", tracingEnabled: true },
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

    private createLambdaErrorRateAlarms(alarmTopic: Topic, lambdas: LambdaFunction[]): Alarm[] {
        return lambdas.map((lambda) => {
            const alarm = new Alarm(this, `${lambda.node.id}-sucessRate`, {
                alarmName: `${lambda.functionName} Success Rate`,
                metric: new MathExpression({
                    label: "Success Rate",
                    expression: "1 - errors / invocations",
                    usingMetrics: {
                        errors: lambda.metricErrors(),
                        invocations: lambda.metricInvocations()
                    },
                    period: Duration.minutes(1)
                }),
                threshold: 0.99,
                comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
                evaluationPeriods: 5
            });
            alarm.addAlarmAction(new SnsAction(alarmTopic));
            return alarm;
        });
    }

    private createRestAPIErrorRateAlarms(alarmTopic: Topic, api: RestApi): Alarm[] {
        const errorRateMetrics = [api.metricClientError(), api.metricServerError()];
        return errorRateMetrics.map((metric) => {
            const alarm = new Alarm(this, `${api.node.id}-${metric.metricName}`, {
                alarmName: `website-${metric.metricName}`,
                metric: new MathExpression({
                    label: "Success Rate",
                    expression: "1 - errors / invocations",
                    usingMetrics: {
                        errors: metric,
                        invocations: api.metricCount()
                    },
                    period: Duration.minutes(1)
                }),
                threshold: 0.99,
                comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
                evaluationPeriods: 5
            });
            alarm.addAlarmAction(new SnsAction(alarmTopic));
            return alarm;
        });
    }

    private createAlarmActions() {
        return new Topic(this, "websiteAlarmTopic", {
            topicName: "website-alarms"
        });
    }
}

export default WebsiteAPIStack;
