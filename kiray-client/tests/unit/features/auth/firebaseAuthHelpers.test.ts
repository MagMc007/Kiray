import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as firebaseAuth from 'firebase/auth';
import {
  auth,
  sendResetPasswordEmail,
  changeUserPassword,
  getUserAuthProviders,
} from '@/features/auth/firebase';

const mockCredential = {
  providerId: 'password',
  signInMethod: 'password',
};

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual<typeof import('firebase/auth')>('firebase/auth');
  return {
    ...actual,
    sendPasswordResetEmail: vi.fn(),
    reauthenticateWithCredential: vi.fn(),
    updatePassword: vi.fn(),
    EmailAuthProvider: {
      credential: vi.fn(() => mockCredential),
    },
  };
});

describe('Firebase Auth Helpers (Layer 1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendResetPasswordEmail', () => {
    it('calls firebase sendPasswordResetEmail with auth and email', async () => {
      vi.mocked(firebaseAuth.sendPasswordResetEmail).mockResolvedValueOnce(undefined);

      await sendResetPasswordEmail('test@kiray.et');

      expect(firebaseAuth.sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'test@kiray.et');
    });

    it('propagates errors when sendPasswordResetEmail fails', async () => {
      vi.mocked(firebaseAuth.sendPasswordResetEmail).mockRejectedValueOnce(
        new Error('auth/user-not-found')
      );

      await expect(sendResetPasswordEmail('notfound@kiray.et')).rejects.toThrow(
        'auth/user-not-found'
      );
    });
  });

  describe('changeUserPassword', () => {
    it('throws error if no currentUser is signed in', async () => {
      const originalUser = auth?.currentUser;
      Object.defineProperty(auth, 'currentUser', {
        get: () => null,
        configurable: true,
      });

      await expect(changeUserPassword('oldPass123', 'newPass456')).rejects.toThrow(
        'No authenticated user found'
      );

      Object.defineProperty(auth, 'currentUser', {
        get: () => originalUser,
        configurable: true,
      });
    });

    it('reauthenticates and updates password when currentUser exists with email', async () => {
      const mockUser = {
        email: 'user@kiray.et',
      };
      const originalUser = auth?.currentUser;
      Object.defineProperty(auth, 'currentUser', {
        get: () => mockUser,
        configurable: true,
      });

      vi.mocked(firebaseAuth.reauthenticateWithCredential).mockResolvedValueOnce({} as any);
      vi.mocked(firebaseAuth.updatePassword).mockResolvedValueOnce(undefined);

      await changeUserPassword('oldPass123', 'newPass456');

      expect(firebaseAuth.EmailAuthProvider.credential).toHaveBeenCalledWith(
        'user@kiray.et',
        'oldPass123'
      );
      expect(firebaseAuth.reauthenticateWithCredential).toHaveBeenCalledWith(
        mockUser,
        mockCredential
      );
      expect(firebaseAuth.updatePassword).toHaveBeenCalledWith(mockUser, 'newPass456');

      Object.defineProperty(auth, 'currentUser', {
        get: () => originalUser,
        configurable: true,
      });
    });
  });

  describe('getUserAuthProviders', () => {
    it('returns empty array if no user is signed in', () => {
      const originalUser = auth?.currentUser;
      Object.defineProperty(auth, 'currentUser', {
        get: () => null,
        configurable: true,
      });

      expect(getUserAuthProviders()).toEqual([]);

      Object.defineProperty(auth, 'currentUser', {
        get: () => originalUser,
        configurable: true,
      });
    });

    it('returns array of provider ids from currentUser providerData', () => {
      const mockUser = {
        providerData: [{ providerId: 'password' }, { providerId: 'google.com' }],
      };
      const originalUser = auth?.currentUser;
      Object.defineProperty(auth, 'currentUser', {
        get: () => mockUser,
        configurable: true,
      });

      expect(getUserAuthProviders()).toEqual(['password', 'google.com']);

      Object.defineProperty(auth, 'currentUser', {
        get: () => originalUser,
        configurable: true,
      });
    });
  });
});
