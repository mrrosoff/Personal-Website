#!/usr/bin/env ts-node

import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { RegistrationResponseJSON, generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument, PutCommand } from '@aws-sdk/lib-dynamodb';

const PORT = 3456;
const RP_NAME = "Max Rosoff's Website";
const RP_ID = "maxrosoff.com";
const ORIGIN = "https://maxrosoff.com";
const PASSKEY_CREDENTIALS_TABLE = "website-passkey-credentials";

const dynamodbClient = new DynamoDBClient({});
const documentClient = DynamoDBDocument.from(dynamodbClient);

interface RegistrationResponse extends RegistrationResponseJSON { }

// Store the registration options and response
let registrationOptions: Awaited<ReturnType<typeof generateRegistrationOptions>> | null = null;
let registrationResponse: RegistrationResponse | null = null;
let server: http.Server | null = null;

function handleHomePage(res: http.ServerResponse): void {
    const htmlPath = path.join(__dirname, 'passkey-registration-ui', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
}

function handleRegistrationScript(res: http.ServerResponse): void {
    const tsPath = path.join(__dirname, 'passkey-registration-ui', 'registration.ts');
    const ts = fs.readFileSync(tsPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(ts);
}

async function handleGenerateOptions(res: http.ServerResponse): Promise<void> {
    try {
        registrationOptions = await generateRegistrationOptions({
            rpName: RP_NAME,
            rpID: RP_ID,
            userName: "admin",
            userDisplayName: "Admin",
            attestationType: "none",
            authenticatorSelection: {
                residentKey: "preferred",
                userVerification: "preferred",
                authenticatorAttachment: "platform"
            }
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(registrationOptions));
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('✗ Failed to generate options:', errorMessage);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: errorMessage }));
    }
}

async function handleRegistration(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    let body = '';
    req.on('data', chunk => body += chunk.toString());

    req.on('end', async () => {
        registrationResponse = JSON.parse(body);

        if (!registrationOptions) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No registration options found' }));
            return;
        }

        console.log('\n✓ Passkey created! Verifying...');

        try {
            if (!registrationResponse) {
                throw new Error('No registration response');
            }

            const verification = await verifyRegistrationResponse({
                response: registrationResponse,
                expectedChallenge: registrationOptions.challenge,
                expectedOrigin: ORIGIN,
                expectedRPID: RP_ID
            });

            if (!verification.verified || !verification.registrationInfo) {
                throw new Error('Passkey verification failed');
            }

            const { credential } = verification.registrationInfo;
            const credentialId = Buffer.from(credential.id).toString('base64');

            await documentClient.send(new PutCommand({
                TableName: PASSKEY_CREDENTIALS_TABLE,
                Item: {
                    id: credentialId,
                    credentialId: credentialId,
                    publicKey: Buffer.from(credential.publicKey).toString('base64'),
                    counter: credential.counter,
                    transports: registrationResponse.response.transports || [],
                    createdAt: new Date().toISOString()
                }
            }));

            console.log('✓ Passkey registered successfully!');
            console.log('\nYou can now use your passkey to authenticate with sudo console');

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('✗ Registration failed:', errorMessage);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: errorMessage }));
        }

        setTimeout(() => {
            server?.close();
            process.exit(0);
        }, 1000);
    });
}

function handleNotFound(res: http.ServerResponse): void {
    res.writeHead(404);
    res.end('Not found');
}

// Create a simple HTTP server
server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        return handleHomePage(res);
    }

    if (req.method === 'GET' && req.url === '/registration.js') {
        return handleRegistrationScript(res);
    }

    if (req.method === 'POST' && req.url === '/options') {
        return handleGenerateOptions(res);
    }

    if (req.method === 'POST' && req.url === '/register') {
        return handleRegistration(req, res);
    }

    return handleNotFound(res);
});

async function main(): Promise<void> {
    console.log('Passkey Registration Script');
    console.log('============================\n');

    // Start server
    server?.listen(PORT, () => {
        console.log(`Opening browser for passkey registration...`);
        const url = `http://localhost:${PORT}`;

        // Open browser based on platform
        const command = process.platform === 'darwin' ? 'open' :
            process.platform === 'win32' ? 'start' : 'xdg-open';

        exec(`${command} ${url}`, (err) => {
            if (err) {
                console.error('Could not open browser automatically.');
                console.log(`Please open: ${url}`);
            }
        });
    });

    console.log('\nWaiting for passkey registration...');
    console.log('(The browser window will close automatically when done)\n');
}

main().catch(console.error);
