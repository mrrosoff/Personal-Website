// @ts-ignore - ESM CDN import works in browser
import { startRegistration } from 'https://esm.sh/@simplewebauthn/browser@latest';

declare global {
    interface Window {
        registerPasskey: () => Promise<void>;
    }
}

window.registerPasskey = async function(): Promise<void> {
    const btn = document.getElementById('registerBtn') as HTMLButtonElement;
    const status = document.getElementById('status') as HTMLDivElement;

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Registering...';
    status.className = 'status info';
    status.textContent = 'Fetching registration options...';

    try {
        // Get registration options from local server
        const optionsRes = await fetch('http://localhost:3456/options', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!optionsRes.ok) {
            throw new Error('Failed to get registration options');
        }

        const options = await optionsRes.json();

        status.textContent = 'Please authenticate with your device...';

        // Start WebAuthn registration
        const registrationResponse = await startRegistration(options);

        // Send to local server for verification
        const verifyRes = await fetch('http://localhost:3456/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationResponse)
        });

        if (verifyRes.ok) {
            status.className = 'status success';
            status.textContent = '✓ Passkey registered successfully! You can close this window.';
            btn.style.display = 'none';

            // Auto-close after 2 seconds
            setTimeout(() => {
                window.close();
            }, 2000);
        } else {
            throw new Error('Registration verification failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        status.className = 'status error';
        status.textContent = `✗ Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        btn.disabled = false;
        btn.textContent = 'Try Again';
    }
};
