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
});
