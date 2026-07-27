import admin from 'firebase-admin';

// Mock firebase-admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
}));

// Mock logger to avoid console output during tests
jest.mock('../src/config/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('Firebase Config', () => {
  beforeEach(() => {
    // Clear all env vars before each test
    delete process.env.FIREBASE_SERVICE_ACCOUNT;
    jest.clearAllMocks();
    // Clear the require cache to reimport the module fresh
    jest.resetModules();
  });

  it('should initialize Firebase Admin SDK with valid service account', async () => {
    const validServiceAccount = {
      type: 'service_account',
      project_id: 'test-project',
      private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4/4eoP+UtfLT90vLmKSaVxHCuP8rU5O48nJUf6YvIRh0gL1d4L3c0M\nNpTM9r0jZGG9+LqqA3E8bsV/EsNAi3K7f28Z/5yEvDblhcJbN7P7LS2JqJo1f3kW\n-----END PRIVATE KEY-----\n',
      client_email: 'firebase-adminsdk@test-project.iam.gserviceaccount.com',
    };

    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify(validServiceAccount);
    admin.initializeApp.mockReturnValue({});
    admin.credential.cert.mockReturnValue({});

    // Dynamic import to use the new env vars
    const firebaseConfig = await import('../src/config/firebase.js');

    expect(admin.credential.cert).toHaveBeenCalledWith(validServiceAccount);
    expect(admin.initializeApp).toHaveBeenCalled();
  });

  it('should throw error when FIREBASE_SERVICE_ACCOUNT env var is missing', async () => {
    delete process.env.FIREBASE_SERVICE_ACCOUNT;

    await expect(async () => {
      await import('../src/config/firebase.js');
    }).rejects.toThrow('FIREBASE_SERVICE_ACCOUNT env var is not set');
  });

  it('should throw error when FIREBASE_SERVICE_ACCOUNT is invalid JSON', async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT = 'not valid json {';

    await expect(async () => {
      await import('../src/config/firebase.js');
    }).rejects.toThrow('FIREBASE_SERVICE_ACCOUNT is not valid JSON');
  });

  it('should throw error when service account is missing required fields', async () => {
    const incompleteServiceAccount = {
      type: 'service_account',
      project_id: 'test-project',
      // missing private_key and client_email
    };

    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify(incompleteServiceAccount);

    await expect(async () => {
      await import('../src/config/firebase.js');
    }).rejects.toThrow('FIREBASE_SERVICE_ACCOUNT is missing required fields');
  });
});
