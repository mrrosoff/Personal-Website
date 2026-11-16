import { globSync } from "node:fs";

import { Duration, RemovalPolicy, Stack, type StackProps } from "aws-cdk-lib";
import {
    ContentHandling,
    Cors,
    EndpointType,
    LambdaIntegration,
    RestApi
} from "aws-cdk-lib/aws-apigateway";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction as LambdaTarget } from "aws-cdk-lib/aws-events-targets";
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
import { AttributeType, BillingMode, ProjectionType, Table } from "aws-cdk-lib/aws-dynamodb";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { CfnGroup } from "aws-cdk-lib/aws-resourcegroups";

import {
    DEVICES_TABLE,
    FLAVORS_TABLE,
    PASSKEY_CHALLENGES_TABLE,
    PASSKEYS_TABLE,
    POLAROID_PHOTOS_BUCKET
} from "../api/common";

const ENDPOINTS = globSync("api/endpoints/*/*.{ts,tsx}")
    .map((file) => file.replace(/^api\/|\.tsx?$/g, ""))
    .filter((endpoint) => endpoint !== "endpoints/preview/preview");

function routeForLambda(lambda: string): string {
    return [...new Set(lambda.split("/").slice(1))]
        .join("/")
        .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

class WebsiteAPIStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const flavorsTable = this.createFlavorsTable();
        const passkeyChallengesTable = this.createPasskeyChallengesTable();
        const passkeysTable = this.createPasskeysTable();
        const devicesTable = this.createDevicesTable();

        const certificate = new Certificate(this, "websiteCertificate", {
            domainName: "maxrosoff.com",
            subjectAlternativeNames: ["*.maxrosoff.com"],
            validation: CertificateValidation.fromDns()
        });
        const apiRole = this.createAPILambdaRole(
            flavorsTable,
            passkeyChallengesTable,
            passkeysTable,
            devicesTable
        );
        this.createPolaroidPhotosBucket(apiRole);
        const restApi = this.createAPI(certificate, apiRole);
        this.createSpotifyReauthSchedule(apiRole);

        const alarmTopic = this.createAlarmActions();
        this.createRestAPIErrorsAlarm(alarmTopic, restApi);

        this.createResourceGroup();
    }

    private createResourceGroup(): CfnGroup {
        return new CfnGroup(this, "websiteResourceGroup", {
            name: "Personal-Website",
            description: "Copyright Max Rosoff",
            resourceQuery: {
                type: "CLOUDFORMATION_STACK_1_0",
                query: {
                    stackIdentifier: this.stackId,
                    resourceTypeFilters: ["AWS::AllSupported"]
                }
            }
        });
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

    private createPasskeyChallengesTable(): Table {
        return new Table(this, "websitePasskeyChallengesTable", {
            tableName: PASSKEY_CHALLENGES_TABLE,
            partitionKey: { name: "id", type: AttributeType.STRING },
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
            deletionProtection: true,
            timeToLiveAttribute: "expiresAt"
        });
    }

    private createPasskeysTable(): Table {
        const passkeysTable = new Table(this, "websitePasskeysTable", {
            tableName: PASSKEYS_TABLE,
            partitionKey: { name: "credentialId", type: AttributeType.STRING },
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
            deletionProtection: true
        });
        passkeysTable.addGlobalSecondaryIndex({
            indexName: "email",
            partitionKey: { name: "email", type: AttributeType.STRING },
            projectionType: ProjectionType.ALL
        });
        return passkeysTable;
    }

    private createDevicesTable(): Table {
        return new Table(this, "websiteDevicesTableV2", {
            tableName: DEVICES_TABLE,
            partitionKey: { name: "deviceId", type: AttributeType.STRING },
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
            deletionProtection: true
        });
    }

    private createAPI(certificate: Certificate, apiRole: Role): RestApi {
        const api = new RestApi(this, "websiteRestApi", {
            restApiName: "Website API",
            description: "The service endpoint for Personal Website API",
            domainName: {
                domainName: "api.maxrosoff.com",
                endpointType: EndpointType.EDGE,
                certificate
            },
            disableExecuteApiEndpoint: true,
            // API Gateway assumes every request and response body is UTF-8
            // text. A content type not listed here gets decoded on the way in
            // and re-encoded on the way out, which corrupts an image upload
            // and turns the 120,000 byte framebuffer into 160,000 base64
            // characters the device then rejects as the wrong size.
            binaryMediaTypes: [
                "image/jpeg",
                "image/png",
                "image/heic",
                "image/heif",
                "application/octet-stream"
            ],
            deployOptions: {
                stageName: "production",
                tracingEnabled: true
            },
            defaultCorsPreflightOptions: { allowOrigins: Cors.ALL_ORIGINS },
            endpointExportName: "WebsiteApiEndpoint"
        });

        this.createLambdaRoutes(api, apiRole);
        this.createPreviewRoute(api, apiRole);
        return api;
    }

    private createLambdaRoutes(api: RestApi, role: Role) {
        for (const endpoint of ENDPOINTS) {
            api.root
                .resourceForPath(routeForLambda(endpoint))
                .addMethod("ANY", new LambdaIntegration(this.createLambda(endpoint, role)));
        }
    }

    private createSpotifyReauthSchedule(role: Role) {
        const reminderLambda = this.createLambda("jobs/spotify/reauthReminder", role);
        new Rule(this, "websiteSpotifyReauthReminderRule", {
            ruleName: "website-spotify-reauth-reminder",
            schedule: Schedule.rate(Duration.days(7)),
            targets: [new LambdaTarget(reminderLambda)]
        });
    }

    private createLambda(lambda: string, role: Role): LambdaFunction {
        const functionName = `website-${routeForLambda(lambda).replaceAll("/", "-")}`;
        const id = `${functionName.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase())}Lambda`;
        return new LambdaFunction(this, id, {
            functionName,
            handler: `${lambda.split("/").at(-1)}.handler`,
            code: Code.fromAsset(`dist/lambda/${lambda}`),
            runtime: Runtime.NODEJS_22_X,
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
        });
    }

    private createPreviewRoute(api: RestApi, role: Role) {
        const previewLambda = this.createLambda("endpoints/preview/preview", role);

        api.root.addResource("preview.png").addMethod(
            "GET",
            new LambdaIntegration(previewLambda, {
                proxy: false,
                integrationResponses: [
                    {
                        statusCode: "200",
                        contentHandling: ContentHandling.CONVERT_TO_BINARY,
                        responseParameters: {
                            "method.response.header.Content-Type": "'image/png'"
                        }
                    }
                ]
            }),
            {
                methodResponses: [
                    {
                        statusCode: "200",
                        responseParameters: { "method.response.header.Content-Type": true }
                    }
                ]
            }
        );
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
                        new PolicyStatement({
                            actions: ["ssm:GetParameters", "ssm:PutParameter"],
                            resources: [
                                this.formatArn({
                                    service: "ssm",
                                    resource: "parameter",
                                    resourceName: "website/*"
                                })
                            ]
                        })
                    ]
                }),
                TableAccessPolicy: new PolicyDocument({
                    statements: [
                        new PolicyStatement({
                            actions: [
                                "dynamodb:GetItem",
                                "dynamodb:DeleteItem",
                                "dynamodb:PutItem",
                                "dynamodb:Query",
                                "dynamodb:Scan",
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

    private createPolaroidPhotosBucket(role: Role): Bucket {
        const bucket = new Bucket(this, "websitePolaroidPhotosBucket", {
            bucketName: POLAROID_PHOTOS_BUCKET,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.RETAIN
        });

        bucket.grantReadWrite(role);
        return bucket;
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
