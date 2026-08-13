import { Duration, RemovalPolicy, Stack, type StackProps } from "aws-cdk-lib";
import { Cors, EndpointType, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
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
    type FunctionProps,
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
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { CfnGroup } from "aws-cdk-lib/aws-resourcegroups";

import {
    FLAVORS_TABLE,
    PASSKEY_CHALLENGES_TABLE,
    PASSKEYS_TABLE,
    POLAROID_PHOTOS_BUCKET
} from "../api/common";

class WebsiteAPIStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const flavorsTable = this.createFlavorsTable();
        const passkeyChallengesTable = this.createPasskeyChallengesTable();
        const passkeysTable = this.createPasskeysTable();

        const certificate = new Certificate(this, "websiteCertificate", {
            domainName: "maxrosoff.com",
            subjectAlternativeNames: ["*.maxrosoff.com"],
            validation: CertificateValidation.fromDns()
        });
        const apiRole = this.createAPILambdaRole(
            flavorsTable,
            passkeyChallengesTable,
            passkeysTable
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
            description: "© Max Rosoff",
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
        return new Table(this, "websitePasskeysTable", {
            tableName: PASSKEYS_TABLE,
            partitionKey: { name: "credentialId", type: AttributeType.STRING },
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
            deployOptions: {
                stageName: "production",
                tracingEnabled: true
            },
            defaultCorsPreflightOptions: { allowOrigins: Cors.ALL_ORIGINS },
            endpointExportName: "WebsiteApiEndpoint"
        });

        this.createAdminRoutes(api, apiRole);
        this.createFriendsRoutes(api, apiRole);
        this.createEmailRoutes(api, apiRole);
        this.createJWKRoutes(api, apiRole);
        this.createIceCreamRoutes(api, apiRole);
        this.createSpotifyRoutes(api, apiRole);
        this.createPolaroidRoutes(api, apiRole);
        return api;
    }

    private createAdminRoutes(api: RestApi, apiRole: Role) {
        const provisionFlavorLambda = this.createProvisionFlavorLambda(apiRole);
        const updateInventoryLambda = this.createUpdateInventoryLambda(apiRole);
        const passkeyAuthOptionsLambda = this.createPasskeyAuthOptionsLambda(apiRole);
        const passkeyAuthLambda = this.createPasskeyAuthLambda(apiRole);
        const createFriendInviteLambda = this.createCreateFriendInviteLambda(apiRole);

        const adminResource = api.root.addResource("admin");
        adminResource
            .addResource("provision-flavor")
            .addMethod("POST", new LambdaIntegration(provisionFlavorLambda));
        adminResource
            .addResource("update-inventory")
            .addMethod("POST", new LambdaIntegration(updateInventoryLambda));
        adminResource
            .addResource("passkey-auth-options")
            .addMethod("POST", new LambdaIntegration(passkeyAuthOptionsLambda));
        adminResource
            .addResource("passkey-auth")
            .addMethod("POST", new LambdaIntegration(passkeyAuthLambda));
        adminResource
            .addResource("create-friend-invite")
            .addMethod("POST", new LambdaIntegration(createFriendInviteLambda));
    }

    private createFriendsRoutes(api: RestApi, apiRole: Role) {
        const passkeyRegisterOptionsLambda = this.createPasskeyRegisterOptionsLambda(apiRole);
        const passkeyRegisterLambda = this.createPasskeyRegisterLambda(apiRole);
        const suggestFlavorLambda = this.createSuggestFlavorLambda(apiRole);

        const friendsResource = api.root.addResource("friends");
        friendsResource
            .addResource("passkey-register-options")
            .addMethod("POST", new LambdaIntegration(passkeyRegisterOptionsLambda));
        friendsResource
            .addResource("passkey-register")
            .addMethod("POST", new LambdaIntegration(passkeyRegisterLambda));
        friendsResource
            .addResource("suggest-flavor")
            .addMethod("POST", new LambdaIntegration(suggestFlavorLambda));
    }

    private createEmailRoutes(api: RestApi, apiRole: Role) {
        const receiveLambda = this.createReceiveLambda(apiRole);
        const registerLambda = this.createRegisterLambda(apiRole);
        const sendEmailLambda = this.createSendEmailLambda(apiRole);
        const unsubscribeLambda = this.createUnsubscribeLambda(apiRole);

        const emailResource = api.root.addResource("email");
        emailResource
            .addResource("receive")
            .addMethod("POST", new LambdaIntegration(receiveLambda));
        emailResource
            .addResource("register")
            .addMethod("POST", new LambdaIntegration(registerLambda));
        emailResource
            .addResource("send-email")
            .addMethod("POST", new LambdaIntegration(sendEmailLambda));
        emailResource
            .addResource("unsubscribe")
            .addMethod("POST", new LambdaIntegration(unsubscribeLambda));
    }

    private createJWKRoutes(api: RestApi, apiRole: Role) {
        const jwksLambda = this.createJWKLambda(apiRole);

        const jwks = api.root.addResource("jwks");
        jwks.addMethod("GET", new LambdaIntegration(jwksLambda));
    }

    private createIceCreamRoutes(api: RestApi, apiRole: Role) {
        const inventoryLambda = this.createInventoryLambda(apiRole);
        const checkoutLambda = this.createCheckoutLambda(apiRole);
        const checkoutStatusLambda = this.createCheckoutStatusLambda(apiRole);
        const checkoutSuccessLambda = this.createCheckoutSuccessLambda(apiRole);

        const iceCreamResource = api.root.addResource("ice-cream");
        iceCreamResource
            .addResource("inventory")
            .addMethod("POST", new LambdaIntegration(inventoryLambda));
        iceCreamResource
            .addResource("checkout")
            .addMethod("POST", new LambdaIntegration(checkoutLambda));
        iceCreamResource
            .addResource("checkout-status")
            .addMethod("POST", new LambdaIntegration(checkoutStatusLambda));
        iceCreamResource
            .addResource("checkout-success")
            .addMethod("POST", new LambdaIntegration(checkoutSuccessLambda));
    }

    private createSpotifyRoutes(api: RestApi, apiRole: Role) {
        const spotifyConnectLambda = this.createSpotifyConnectLambda(apiRole);
        const spotifyExchangeLambda = this.createSpotifyExchangeLambda(apiRole);
        const spotifyTokenLambda = this.createSpotifyTokenLambda(apiRole);

        const spotifyResource = api.root.addResource("spotify");
        spotifyResource
            .addResource("connect")
            .addMethod("POST", new LambdaIntegration(spotifyConnectLambda));
        spotifyResource
            .addResource("exchange")
            .addMethod("POST", new LambdaIntegration(spotifyExchangeLambda));
        spotifyResource
            .addResource("token")
            .addMethod("GET", new LambdaIntegration(spotifyTokenLambda));
    }

    private createPolaroidRoutes(api: RestApi, apiRole: Role) {
        const photoLambda = this.createPolaroidPhotoLambda(apiRole);
        const photosLambda = this.createPolaroidPhotosLambda(apiRole);
        const uploadLambda = this.createPolaroidUploadLambda(apiRole);
        const removeLambda = this.createPolaroidRemoveLambda(apiRole);

        const polaroidResource = api.root.addResource("polaroid");
        polaroidResource
            .addResource("photos")
            .addMethod("GET", new LambdaIntegration(photosLambda));
        polaroidResource
            .addResource("upload")
            .addMethod("POST", new LambdaIntegration(uploadLambda));
        polaroidResource.addResource("photo").addMethod("POST", new LambdaIntegration(photoLambda));
        polaroidResource
            .addResource("remove")
            .addMethod("POST", new LambdaIntegration(removeLambda));
    }

    private createSpotifyConnectLambda(role: Role): LambdaFunction {
        const functionName = "website-spotify-connect";
        return new LambdaFunction(this, "websiteSpotifyConnectLambda", {
            functionName,
            handler: "connect.handler",
            code: Code.fromAsset("dist/lambda/spotify/connect"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createSpotifyExchangeLambda(role: Role): LambdaFunction {
        const functionName = "website-spotify-exchange";
        return new LambdaFunction(this, "websiteSpotifyExchangeLambda", {
            functionName,
            handler: "exchange.handler",
            code: Code.fromAsset("dist/lambda/spotify/exchange"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createSpotifyTokenLambda(role: Role): LambdaFunction {
        const functionName = "website-spotify-token";
        return new LambdaFunction(this, "websiteSpotifyTokenLambda", {
            functionName,
            handler: "token.handler",
            code: Code.fromAsset("dist/lambda/spotify/token"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createSpotifyReauthSchedule(role: Role) {
        const reminderLambda = this.createSpotifyReauthReminderLambda(role);
        new Rule(this, "websiteSpotifyReauthReminderRule", {
            ruleName: "website-spotify-reauth-reminder",
            schedule: Schedule.rate(Duration.days(7)),
            targets: [new LambdaTarget(reminderLambda)]
        });
    }

    private createSpotifyReauthReminderLambda(role: Role): LambdaFunction {
        const functionName = "website-spotify-reauth-reminder";
        return new LambdaFunction(this, "websiteSpotifyReauthReminderLambda", {
            functionName,
            handler: "reauthReminder.handler",
            code: Code.fromAsset("dist/lambda/spotify/reauthReminder"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createJWKLambda(role: Role): LambdaFunction {
        const functionName = "website-jwks";
        return new LambdaFunction(this, "websiteJWKsLambda", {
            functionName,
            handler: "jwks.handler",
            code: Code.fromAsset("dist/lambda/jwks"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
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

    private createPasskeyRegisterOptionsLambda(role: Role): LambdaFunction {
        const functionName = "website-passkey-register-options";
        return new LambdaFunction(this, "websitePasskeyRegisterOptionsLambda", {
            functionName,
            handler: "passkeyRegisterOptions.handler",
            code: Code.fromAsset("dist/lambda/friends/passkeyRegisterOptions"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createPasskeyRegisterLambda(role: Role): LambdaFunction {
        const functionName = "website-passkey-register";
        return new LambdaFunction(this, "websitePasskeyRegisterLambda", {
            functionName,
            handler: "passkeyRegister.handler",
            code: Code.fromAsset("dist/lambda/friends/passkeyRegister"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createSuggestFlavorLambda(role: Role): LambdaFunction {
        const functionName = "website-suggest-flavor";
        return new LambdaFunction(this, "websiteSuggestFlavorLambda", {
            functionName,
            handler: "suggestFlavor.handler",
            code: Code.fromAsset("dist/lambda/friends/suggestFlavor"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createPasskeyAuthOptionsLambda(role: Role): LambdaFunction {
        const functionName = "website-passkey-auth-options";
        return new LambdaFunction(this, "websitePasskeyAuthOptionsLambda", {
            functionName,
            handler: "passkeyAuthOptions.handler",
            code: Code.fromAsset("dist/lambda/admin/passkeyAuthOptions"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createPasskeyAuthLambda(role: Role): LambdaFunction {
        const functionName = "website-passkey-auth";
        return new LambdaFunction(this, "websitePasskeyAuthLambda", {
            functionName,
            handler: "passkeyAuth.handler",
            code: Code.fromAsset("dist/lambda/admin/passkeyAuth"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createCreateFriendInviteLambda(role: Role): LambdaFunction {
        const functionName = "website-create-friend-invite";
        return new LambdaFunction(this, "websiteCreateFriendInviteLambda", {
            functionName,
            handler: "createFriendInvite.handler",
            code: Code.fromAsset("dist/lambda/admin/createFriendInvite"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createLambdaParams(functionName: string, role: Role): Partial<FunctionProps> {
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

    private createPolaroidPhotoLambda(role: Role): LambdaFunction {
        const functionName = "website-polaroid-photo";
        return new LambdaFunction(this, "websitePolaroidPhotoLambda", {
            functionName,
            handler: "photo.handler",
            code: Code.fromAsset("dist/lambda/polaroid/photo"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role),
            timeout: Duration.seconds(10)
        });
    }

    private createPolaroidPhotosLambda(role: Role): LambdaFunction {
        const functionName = "website-polaroid-photos";
        return new LambdaFunction(this, "websitePolaroidPhotosLambda", {
            functionName,
            handler: "photos.handler",
            code: Code.fromAsset("dist/lambda/polaroid/photos"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role),
            timeout: Duration.seconds(10)
        });
    }

    private createPolaroidUploadLambda(role: Role): LambdaFunction {
        const functionName = "website-polaroid-upload";
        return new LambdaFunction(this, "websitePolaroidUploadLambda", {
            functionName,
            handler: "upload.handler",
            code: Code.fromAsset("dist/lambda/polaroid/upload"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
    }

    private createPolaroidRemoveLambda(role: Role): LambdaFunction {
        const functionName = "website-polaroid-remove";
        return new LambdaFunction(this, "websitePolaroidRemoveLambda", {
            functionName,
            handler: "remove.handler",
            code: Code.fromAsset("dist/lambda/polaroid/remove"),
            runtime: Runtime.NODEJS_22_X,
            ...this.createLambdaParams(functionName, role)
        });
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
                    statements: [new PolicyStatement({ actions: ["ssm:*"], resources: ["*"] })]
                }),
                TableAccessPolicy: new PolicyDocument({
                    statements: [
                        new PolicyStatement({
                            actions: [
                                "dynamodb:GetItem",
                                "dynamodb:DeleteItem",
                                "dynamodb:PutItem",
                                "dynamodb:Scan",
                                "dynamodb:UpdateItem"
                            ],
                            resources: tables.flatMap((table) => [table.tableArn])
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
