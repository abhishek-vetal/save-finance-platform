import crypto from "crypto";
import { plaidClient } from "@/lib/plaid";

// in-memory cache to store plaid webhook verification keys
const keyCache = new Map();

// verify that an incoming webhook request genuinely originated from plaid
export async function verifyPlaidWebhook(signedJwt, rawBody) {
  if (!signedJwt || typeof signedJwt !== "string") {
    return { isValid: false, error: "missing or invalid plaid-verification header" };
  }

  const parts = signedJwt.split(".");
  if (parts.length !== 3) {
    return { isValid: false, error: "invalid jwt structure" };
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  // parse jwt header and payload
  let header;
  let payload;
  try {
    header = JSON.parse(Buffer.from(headerB64, "base64url").toString("utf-8"));
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
  } catch {
    return { isValid: false, error: "failed to parse jwt header or payload" };
  }

  // verify algorithm
  if (header.alg !== "ES256") {
    return { isValid: false, error: `unsupported jwt algorithm: ${header.alg}` };
  }

  const keyId = header.kid;
  if (!keyId) {
    return { isValid: false, error: "missing kid in jwt header" };
  }

  // verify issued-at timestamp is within a 5-minute tolerance window
  const currentTime = Math.floor(Date.now() / 1000);
  if (!payload.iat || Math.abs(currentTime - payload.iat) > 300) {
    return { isValid: false, error: "webhook timestamp expired or out of tolerance" };
  }

  // verify request body sha256 hash matches the jwt payload
  const computedHash = crypto.createHash("sha256").update(rawBody).digest("hex");
  if (computedHash !== payload.request_body_sha256) {
    return { isValid: false, error: "request body hash mismatch" };
  }

  // retrieve verification key from cache or fetch from plaid api
  let jwk = keyCache.get(keyId);
  if (!jwk) {
    try {
      const response = await plaidClient.webhookVerificationKeyGet({
        key_id: keyId,
      });

      const keyData = response.data.key;
      if (!keyData) {
        return { isValid: false, error: "plaid returned empty verification key" };
      }

      // check if key is expired
      if (keyData.expired_at && currentTime > keyData.expired_at) {
        return { isValid: false, error: "verification key has expired" };
      }

      jwk = keyData;
      keyCache.set(keyId, jwk);
    } catch (apiErr) {
      return { isValid: false, error: `failed to fetch verification key from plaid: ${apiErr.message}` };
    }
  }

  // verify cryptographic signature using the public key
  try {
    const publicKey = crypto.createPublicKey({
      key: {
        kty: jwk.kty,
        crv: jwk.crv,
        x: jwk.x,
        y: jwk.y,
      },
      format: "jwk",
    });

    const signedData = `${headerB64}.${payloadB64}`;
    const isValidSignature = crypto.verify(
      "SHA256",
      Buffer.from(signedData),
      {
        key: publicKey,
        dsaEncoding: "ieee-p1363",
      },
      Buffer.from(signatureB64, "base64url")
    );

    if (!isValidSignature) {
      return { isValid: false, error: "invalid cryptographic signature" };
    }

    return { isValid: true };
  } catch (verifyErr) {
    return { isValid: false, error: `signature verification failed: ${verifyErr.message}` };
  }
}
