#!/usr/bin/env ts-node

import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { RegistrationResponseJSON, generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument, PutCommand } from '@aws-sdk/lib-dynamodb';
import { putItem } from '../api/aws/services/dynamodb';

const PORT = 3456;
const RP_NAME = "Max Rosoff's Website";
const RP_ID = "maxrosoff.com";
const ORIGIN = "https://maxrosoff.com";
const PASSKEY_CREDENTIALS_TABLE = "website-passkey-credentials";

const dynamodbClient = new DynamoDBClient({});
const documentClient = DynamoDBDocument.from(dynamodbClient);

// Store the registration options and response
let registrationOptions: Awaited<ReturnType<typeof generateRegistrationOptions>> | null = null;
let registrationResponse: RegistrationResponseJSON | null = null;
let server: http.Server | null = null;

function handleHomePage(res: http.ServerResponse): void {
    const htmlPath = path.join(__dirname, 'passkeyRegistrationUI', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
    res.end(html);
}

function handleRegistrationScript(res: http.ServerResponse): void {
    const tsPath = path.join(__dirname, 'passkeyRegistrationUI', 'registration.ts');
    const ts = fs.readFileSync(tsPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/javascript', 'Access-Control-Allow-Origin': '*' });
    res.end(ts);
}

async function handleGenerateOptions(res: http.ServerResponse): Promise<void> {
    try {
        registrationOptions = await generateRegistrationOptions({
            rpName: RP_NAME,
            rpID: RP_ID,
            userName: "admin",
        });

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(registrationOptions));
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('✗ Failed to generate options:', errorMessage);
        res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
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
            await putItem(PASSKEY_CREDENTIALS_TABLE, {
                id: Buffer.from(credential.id).toString('base64'),
                publicKey: Buffer.from(credential.publicKey).toString('base64'),
                counter: credential.counter,
                transports: registrationResponse.response.transports
            })

            console.log('✓ Passkey registered successfully!');
            console.log('\nYou can now use your passkey to authenticate with sudo console');

            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ success: true }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('✗ Registration failed:', errorMessage);
            res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ error: errorMessage }));
        }

        setTimeout(() => {
            server?.close();
            process.exit(0);
        }, 1000);
    });
}

server = http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
        });
        return res.end();
    }

    switch (req.url) {
        case '/':
            return handleHomePage(res);
        case '/registration.js':
            return handleRegistrationScript(res);
        case '/options':
            return handleGenerateOptions(res);
        case '/register':
            return handleRegistration(req, res);
    }

    res.writeHead(404);
    res.end('Not found');
});

async function main(): Promise<void> {
    console.log('Passkey Registration Script');
    console.log('===========================');

    server?.listen(PORT, () => {
        console.log(`Opening browser for passkey registration...`);
        exec("NODE_ENV=development vite");
    });

    console.log('\nWaiting for passkey registration (the browser will close automatically when finished)...');
    console.log();
}

main().catch(console.error);
