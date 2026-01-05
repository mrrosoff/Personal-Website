# Admin Scripts

## Register Passkey

To register your passkey for admin authentication:

```bash
npm run register-passkey
```

This will:
1. Start a local server on port 3456
2. Open your browser to the registration page
3. Prompt you to register your passkey (Touch ID, Face ID, or security key)
4. Verify the passkey with the backend
5. Close automatically when complete

After registration, you can authenticate to the admin console using:
```bash
sudo console
```

The passkey modal will appear automatically for authentication.
