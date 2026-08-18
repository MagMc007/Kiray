import { describe, it, expect, jest, beforeEach } from "@jest/globals";

const mockInitializeApp = jest.fn();
const mockCert = jest.fn();
const mockGetApps = jest.fn();
const mockGetAuth = jest.fn();
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

jest.unstable_mockModule("firebase-admin/app", () => ({
  initializeApp: mockInitializeApp,
  cert: mockCert,
  getApps: mockGetApps,
}));

jest.unstable_mockModule("firebase-admin/auth", () => ({
  getAuth: mockGetAuth,
}));

jest.unstable_mockModule("../src/config/logger.js", () => ({
  __esModule: true,
  default: mockLogger,
}));

describe("Firebase Config", () => {
  beforeEach(() => {
    delete process.env.FIREBASE_SERVICE_ACCOUNT;
    jest.clearAllMocks();
    mockInitializeApp.mockReset();
    mockCert.mockReset();
    mockGetApps.mockReset();
    mockGetAuth.mockReset();
    mockGetApps.mockReturnValue([]);
    jest.resetModules();
  });

  it("should validate a valid service account and initialize Firebase", async () => {
    const validServiceAccount = {
      type: "service_account",
      project_id: "test-project",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEVQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4/4eoP+UtfLT90vLmKSaVxHCuP8rU5O48nJUf6YvIRh0gL1d4L3c0M\nNpTM9r0jZGG9+LqqA3E8bsV/EsNAi3K7f28Z/5yEvDblhcJbN7P7LS2JqJo1f3kW\n-----END PRIVATE KEY-----\n",
      client_email: "firebase-adminsdk@test-project.iam.gserviceaccount.com",
    };

    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify(validServiceAccount);
    mockCert.mockReturnValue({});
    mockInitializeApp.mockReturnValue({});

    const firebaseConfig = await import("../src/config/firebase.js");

    expect(mockLogger.info).toHaveBeenCalled();
    expect(typeof firebaseConfig.initializeFirebaseAdmin).toBe("function");
  });

  it("should lazily initialize the Admin SDK with the service account", async () => {
    const validServiceAccount = {
      type: "service_account",
      project_id: "test-project",
      private_key: "-----BEGIN PRIVATE KEY-----",
      client_email: "firebase-adminsdk@test-project.iam.gserviceaccount.com",
    };

    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify(validServiceAccount);
    mockCert.mockReturnValue({});
    mockInitializeApp.mockReturnValue({});
    mockGetApps.mockReturnValue([]);

    const { initializeFirebaseAdmin } =
      await import("../src/config/firebase.js");
    const instance = await initializeFirebaseAdmin();

    expect(mockCert).toHaveBeenCalledWith(validServiceAccount);
    expect(mockInitializeApp).toHaveBeenCalled();
    expect(instance.auth).toBe(mockGetAuth);
  });

  it("should throw error when FIREBASE_SERVICE_ACCOUNT env var is missing", async () => {
    delete process.env.FIREBASE_SERVICE_ACCOUNT;

    await expect(async () => {
      await import("../src/config/firebase.js");
    }).rejects.toThrow("FIREBASE_SERVICE_ACCOUNT env var is not set");
  });

  it("should throw error when FIREBASE_SERVICE_ACCOUNT is invalid JSON", async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT = "not valid json {";

    await expect(async () => {
      await import("../src/config/firebase.js");
    }).rejects.toThrow("FIREBASE_SERVICE_ACCOUNT is not valid JSON");
  });

  it("should throw error when service account is missing required fields", async () => {
    const incompleteServiceAccount = {
      type: "service_account",
      project_id: "test-project",
    };

    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify(
      incompleteServiceAccount,
    );

    await expect(async () => {
      await import("../src/config/firebase.js");
    }).rejects.toThrow("FIREBASE_SERVICE_ACCOUNT is missing required fields");
  });
});