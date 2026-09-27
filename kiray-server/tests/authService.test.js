import { jest } from "@jest/globals";

const findOneMock = jest.fn();
const createMock = jest.fn();

jest.unstable_mockModule("../src/models/User.js", () => ({
  default: {
    findOne: findOneMock,
    create: createMock,
  },
}));

const { syncUser } = await import("../src/services/authService.js");

describe("syncUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("persists fullName, phoneNumber, and profileCompleted on new users", async () => {
    const createdUser = { save: jest.fn().mockResolvedValue(undefined) };
    findOneMock.mockResolvedValue(null);
    createMock.mockResolvedValue(createdUser);

    await syncUser(
      "firebase-123",
      { email: "jane@example.com", displayName: "Jane" },
      {
        role: "rentee",
        fullName: "Jane Doe",
        phoneNumber: ["+1-555-111-2222"],
        profileCompleted: true,
      },
    );

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        firebaseUid: "firebase-123",
        role: "rentee",
        fullName: "Jane Doe",
        phoneNumber: ["+1-555-111-2222"],
        profileCompleted: true,
      }),
    );
  });

  it("accepts admin as a valid role for new users", async () => {
    const createdUser = { save: jest.fn().mockResolvedValue(undefined) };
    findOneMock.mockResolvedValue(null);
    createMock.mockResolvedValue(createdUser);

    await syncUser(
      "firebase-admin",
      { email: "admin@example.com", displayName: "Admin" },
      {
        role: "admin",
        fullName: "Admin User",
        phoneNumber: ["+1-555-000-0000"],
        profileCompleted: true,
      },
    );

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        firebaseUid: "firebase-admin",
        role: "admin",
        fullName: "Admin User",
        phoneNumber: ["+1-555-000-0000"],
        profileCompleted: true,
      }),
    );
  });

  it("does not update role for existing users during sync", async () => {
    const existingUser = {
      firebaseUid: "firebase-123",
      role: "rentee",
      displayName: "Old Name",
      email: "old@example.com",
      fullName: null,
      phoneNumber: [],
      profileCompleted: false,
      save: jest.fn().mockResolvedValue(undefined),
    };
    findOneMock.mockResolvedValue(existingUser);

    const result = await syncUser(
      "firebase-123",
      { email: "new@example.com", displayName: "New Name" },
      { role: "admin", fullName: "New Full Name" },
    );

    expect(result.role).toBe("rentee");
    expect(result.save).toHaveBeenCalled();
  });
});
