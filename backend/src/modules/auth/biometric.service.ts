import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import type {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  PublicKeyCredentialDescriptorFuture,
  RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { UserDocument, WebAuthnCredential } from '../users/schemas/user.schema';
import { AuthException, ErrorCode } from '../../shared/exceptions';

type ChallengeType = 'register' | 'login';

interface ChallengeEntry {
  challenge: string;
  type: ChallengeType;
  expiresAt: number;
  deviceName?: string;
  userAgent?: string;
}

interface ChallengeMetadata {
  deviceName?: string;
  userAgent?: string;
}

@Injectable()
export class BiometricService {
  private static readonly allowedTransports: AuthenticatorTransportFuture[] = [
    'usb',
    'ble',
    'nfc',
    'internal',
    'cable',
    'hybrid',
    'smart-card',
  ];

  private readonly logger = new Logger(BiometricService.name);
  private readonly challengeStore = new Map<string, ChallengeEntry>();
  private readonly challengeTTL: number;
  private readonly rpId: string;
  private readonly rpName: string;
  private readonly origin: string;

  constructor(private readonly config: ConfigService) {
    const defaultOrigin = this.config.get<string>('APP_ORIGIN') || 'http://localhost:3000';
    this.origin = this.config.get<string>('WEBAUTHN_ORIGIN') || defaultOrigin;
    this.rpId =
      this.config.get<string>('WEBAUTHN_RP_ID') ||
      this.safeParseHostname(this.origin) ||
      'localhost';
    this.rpName = this.config.get<string>('WEBAUTHN_RP_NAME') || 'Tagdod Platform';
    this.challengeTTL =
      Number(this.config.get<number>('WEBAUTHN_CHALLENGE_TTL_MS')) || 1000 * 60 * 5;

    this.logger.log(
      `Initialized with rpId=${this.rpId}, origin=${this.origin}, ttl=${this.challengeTTL}ms`,
    );
  }

  async generateRegistrationChallenge(
    user: UserDocument,
    metadata: ChallengeMetadata = {},
  ) {
    const excludeCredentials: PublicKeyCredentialDescriptorFuture[] =
      user.webauthnCredentials?.map((credential) => ({
        id: this.base64ToBuffer(credential.credentialId),
        type: 'public-key',
        transports: this.mapTransports(credential.transports),
      })) || [];

    const options = await generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpId,
      userID: Buffer.from(String(user._id), 'utf8'),
      userName: user.phone,
      timeout: this.challengeTTL,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'required',
      },
      excludeCredentials: excludeCredentials.map((credential) => ({
        id: credential.id.toString(),
        transports: credential.transports,
      })),
    });

    this.storeChallenge(String(user._id), 'register', options.challenge, metadata);
    return options;
  }

  async verifyRegistration(
    user: UserDocument,
    credential: RegistrationResponseJSON,
    metadata: ChallengeMetadata = {},
  ) {
    const entry = this.consumeChallenge(String(user._id), 'register');

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: entry.challenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpId,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      this.logger.warn(`Biometric registration failed for user ${user.phone}`);
      throw new AuthException(ErrorCode.AUTH_INVALID_CREDENTIALS, {
        reason: 'biometric_registration_failed',
      });
    }

    const {
      credential: registeredCredential,
      credentialBackedUp,
      credentialDeviceType,
    } = verification.registrationInfo;

    const credentialIdBase64 = Buffer.from(registeredCredential.id).toString('base64');
    const credentialPublicKeyBase64 = Buffer.from(registeredCredential.publicKey).toString('base64');
    const counter = registeredCredential.counter;
    const transports =
      Array.isArray(credential.response?.transports) ?
        credential.response.transports :
        [];
    const existingIndex = user.webauthnCredentials?.findIndex(
      (item) => item.credentialId === credentialIdBase64,
    );

    const now = new Date();
    const record: WebAuthnCredential = {
      credentialId: credentialIdBase64,
      publicKey: credentialPublicKeyBase64,
      counter,
      transports,
      backedUp: credentialBackedUp,
      deviceType: credentialDeviceType,
      createdAt: now,
      friendlyName: metadata.deviceName,
      lastUsedAt: now,
      userAgent: metadata.userAgent,
    };

    if (existingIndex !== undefined && existingIndex >= 0) {
      user.webauthnCredentials[existingIndex] = {
        ...user.webauthnCredentials[existingIndex],
        ...record,
      };
    } else {
      user.webauthnCredentials = [
        ...(user.webauthnCredentials || []),
        record,
      ];
    }

    user.markModified?.('webauthnCredentials');
    await user.save();
  }

  async generateLoginChallenge(
    user: UserDocument,
    metadata: ChallengeMetadata = {},
  ) {
    if (!user.webauthnCredentials || user.webauthnCredentials.length === 0) {
      throw new AuthException(ErrorCode.AUTH_INVALID_CREDENTIALS, {
        reason: 'biometric_not_registered',
      });
    }

    const allowCredentials: PublicKeyCredentialDescriptorFuture[] =
      user.webauthnCredentials.map((credential) => ({
        id: this.base64ToBuffer(credential.credentialId),
        type: 'public-key',
        transports: this.mapTransports(credential.transports),
      }));

    const options = await generateAuthenticationOptions({
      userVerification: 'required',
      rpID: this.rpId,
      timeout: this.challengeTTL,
      allowCredentials: allowCredentials.map((credential) => ({
        id: credential.id.toString(),
        transports: credential.transports,
      })),
    });

    this.storeChallenge(String(user._id), 'login', options.challenge, metadata);
    return options;
  }

  async verifyLogin(
    user: UserDocument,
    credential: AuthenticationResponseJSON,
    metadata: ChallengeMetadata = {},
  ) {
    const entry = this.consumeChallenge(String(user._id), 'login');

    const credentialIdBuffer = this.base64urlToBuffer(credential.rawId || credential.id);
    const storedCredential = user.webauthnCredentials?.find((item) =>
      this.buffersEqual(this.base64ToBuffer(item.credentialId), credentialIdBuffer),
    );

    if (!storedCredential) {
      throw new AuthException(ErrorCode.AUTH_INVALID_CREDENTIALS, {
        reason: 'credential_not_found',
      });
    }

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: entry.challenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpId,
      credential: {
        id: storedCredential.credentialId,
        publicKey: new Uint8Array(this.base64ToBuffer(storedCredential.publicKey)),
        counter: storedCredential.counter,
        transports: this.mapTransports(storedCredential.transports),
      },
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.authenticationInfo) {
      this.logger.warn(`Biometric login failed for user ${user.phone}`);
      throw new AuthException(ErrorCode.AUTH_INVALID_CREDENTIALS, {
        reason: 'biometric_login_failed',
      });
    }

    const { newCounter } = verification.authenticationInfo;
    storedCredential.counter = newCounter;
    storedCredential.lastUsedAt = new Date();
    storedCredential.userAgent = metadata.userAgent || storedCredential.userAgent;

    user.markModified?.('webauthnCredentials');
    await user.save();
  }

  private storeChallenge(
    userId: string,
    type: ChallengeType,
    challenge: string,
    metadata: ChallengeMetadata = {},
  ) {
    const key = this.getChallengeKey(userId, type);
    this.challengeStore.set(key, {
      challenge,
      type,
      expiresAt: Date.now() + this.challengeTTL,
      deviceName: metadata.deviceName,
      userAgent: metadata.userAgent,
    });
  }

  private consumeChallenge(userId: string, type: ChallengeType): ChallengeEntry {
    const key = this.getChallengeKey(userId, type);
    const entry = this.challengeStore.get(key);
    this.challengeStore.delete(key);

    if (!entry) {
      throw new AuthException(ErrorCode.AUTH_INVALID_CREDENTIALS, {
        reason: 'challenge_not_found',
      });
    }

    if (entry.expiresAt < Date.now()) {
      throw new AuthException(ErrorCode.AUTH_INVALID_CREDENTIALS, {
        reason: 'challenge_expired',
      });
    }

    return entry;
  }

  private getChallengeKey(userId: string, type: ChallengeType) {
    return `${userId}:${type}`;
  }

  private safeParseHostname(origin: string): string | undefined {
    try {
      return new URL(origin).hostname;
    } catch {
      return undefined;
    }
  }

  private base64ToBuffer(value: string): Buffer {
    return Buffer.from(value, 'base64');
  }

  private base64urlToBuffer(value: string): Buffer {
    return Buffer.from(this.base64urlToBase64(value), 'base64');
  }

  private base64urlToBase64(value: string): string {
    const padding = value.length % 4 === 0 ? 0 : 4 - (value.length % 4);
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    return base64 + '='.repeat(padding);
  }

  private buffersEqual(a: Buffer, b: Buffer): boolean {
    if (a.length !== b.length) {
      return false;
    }
    return a.equals(b);
  }

  private mapTransports(transports?: string[]): AuthenticatorTransportFuture[] | undefined {
    if (!transports) {
      return undefined;
    }

    return transports.filter((transport): transport is AuthenticatorTransportFuture =>
      BiometricService.allowedTransports.includes(transport as AuthenticatorTransportFuture),
    );
  }
}

