import { jest } from "@jest/globals";

const mockInitializeFirebaseAdmin = jest.fn();
const mockFindOne = jest.fn();
const mockCreate = jest.fn();

jest.unstable_mockModule("../src/config/firebase.js", () => ({
  initializeFirebaseAdmin: mockInitializeFirebaseAdmin,
}));

jest.unstable_mockModule("../src/models/User.js", () => ({
  default: {
    findOne: mockFindOne,
    create: mockCreate,
  },
}));

const { bootstrapAdminUser } = await import("../src/services/adminService.js");

describe("bootstrapAdminUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_EMAIL = "admin@example.com";
    process.env.ADMIN_PASSWORD = "super-secret";
    process.env.ADMIN_DISPLAY_NAME = "Kiray Admin";
  });

  afterEach(() => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_DISPLAY_NAME;
  });

  it("creates a Firebase user and a MongoDB admin profile when admin credentials are present", async () => {
    const auth = {
      getUserByEmail: jest
        .fn()
        .mockRejectedValue({ code: "auth/user-not-found" }),
      createUser: jest.fn().mockResolvedValue({ uid: "firebase-admin-123" }),
    };

    mockInitializeFirebaseAdmin.mockResolvedValue({ auth: () => auth });
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ firebaseUid: "firebase-admin-123" });

    await bootstrapAdminUser();

    expect(auth.createUser).toHaveBeenCalledWith({
      email: "admin@example.com",
      password: "super-secret",
      displayName: "Kiray Admin",
      emailVerified: true,
    });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        firebaseUid: "firebase-admin-123",
        role: "admin",
        email: "admin@example.com",
        displayName: "Kiray Admin",
      }),
    );
  });
});
