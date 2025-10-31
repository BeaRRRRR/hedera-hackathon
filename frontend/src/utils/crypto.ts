// Simple decryption placeholder. Replace with your real decryption if needed.
export async function decryptToken(encryptedToken: string): Promise<string> {
    try {
        const parsed = JSON.parse(encryptedToken);
        if (parsed?.token) return parsed.token;
    } catch {}
    return encryptedToken;
}
