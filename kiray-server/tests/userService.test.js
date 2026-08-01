import { jest } from "@jest/globals";

const findOneMock = jest.fn();
const findByIdMock = jest.fn();

jest.unstable_mockModule("../src/models/User.js", () => ({
  default: {
    findOne: findOneMock,
    findById: findByIdMock,
  },
}));

const { getPublicProfile, updateOwnProfile } = await import("../src/services/userService.js");

describe("userService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a public-safe profile for an existing user", async () => {
    findByIdMock.mockResolvedValue({
      _id: "user-1",
      displayName: "Jane",
      fullName: "Jane Doe",
      bio: "Host",
      email: "private@example.com",
      role: "renter",
      photoURL: null,
      socials: {},
      isDeleted: false,
    });

    const profile = await getPublicProfile("user-1");

    expect(profile.displayName).toBe("Jane");
    expect(profile.fullName).toBe("Jane Doe");
    expect(profile.email).toBeUndefined();
  });

  it("updates allowed profile fields for the current user", async () => {
    const user = {
      _id: "user-1",
      displayName: "Old Name",
      fullName: null,
      bio: "",
      photoURL: null,
      role: "rentee",
      profileCompleted: false,
      save: jest.fn().mockResolvedValue(true),
    };

    findOneMock.mockResolvedValue(user);

    const updated = await updateOwnProfile("firebase-123", {
      displayName: "New Name",
      fullName: "New Name",
      bio: "Updated bio",
      role: "renter",
      profileCompleted: true,
    });

    expect(updated.displayName).toBe("New Name");
    expect(updated.fullName).toBe("New Name");
    expect(updated.profileCompleted).toBe(true);
  });
});
