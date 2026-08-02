import { jest } from "@jest/globals";

const mockInitializeFirebaseAdmin = jest.fn();
const mockFindOne = jest.fn();

jest.unstable_mockModule("../src/config/firebase.js", () => ({
  initializeFirebaseAdmin: mockInitializeFirebaseAdmin,
}));

jest.unstable_mockModule("../src/models/User.js", () => ({
  __esModule: true,
  default: {
    findOne: mockFindOne,
  },
}));

describe("auth middleware", () => {
  let verifyAuth;
  let requireRole;
  let req;
  let res;
  let next;

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();

    mockInitializeFirebaseAdmin.mockReset();
    mockFindOne.mockReset();

    const authMiddlewareModule =
      await import("../src/middleware/authMiddleware.js");
    verifyAuth = authMiddlewareModule.default;
    requireRole = (await import("../src/middleware/requireRole.js")).default;

    req = { headers: {} };
    res = {};
    next = jest.fn();
  });

  it("rejects requests missing an authorization header", async () => {
    await verifyAuth(req, res, next);

    expect(mockInitializeFirebaseAdmin).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(next.mock.calls[0][0].message).toBe("No token provided");
  });

  it("rejects requests with a malformed authorization header", async () => {
    req.headers.authorization = "Token abc123";

    await verifyAuth(req, res, next);

    expect(mockInitializeFirebaseAdmin).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toBe("No token provided");
  });

  it("rejects requests when Firebase token verification fails", async () => {
    req.headers.authorization = "Bearer invalid-token";
    const mockVerifyIdToken = jest
      .fn()
      .mockRejectedValue(new Error("bad token"));

    mockInitializeFirebaseAdmin.mockResolvedValue({
      auth: () => ({ verifyIdToken: mockVerifyIdToken }),
    });

    await verifyAuth(req, res, next);

    expect(mockVerifyIdToken).toHaveBeenCalledWith("invalid-token");
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toBe("Invalid or expired token");
  });

  it("rejects requests when the matching user cannot be found", async () => {
    req.headers.authorization = "Bearer valid-token";
    const mockVerifyIdToken = jest
      .fn()
      .mockResolvedValue({ uid: "firebase-uid" });

    mockInitializeFirebaseAdmin.mockResolvedValue({
      auth: () => ({ verifyIdToken: mockVerifyIdToken }),
    });
    mockFindOne.mockResolvedValue(null);

    await verifyAuth(req, res, next);

    expect(mockFindOne).toHaveBeenCalledWith({
      firebaseUid: "firebase-uid",
      isDeleted: false,
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toBe(
      "User not found. Please sync first.",
    );
  });

  it("attaches the authenticated user and firebase uid to the request", async () => {
    req.headers.authorization = "Bearer valid-token";
    const mockUser = {
      _id: "user-123",
      firebaseUid: "firebase-uid",
      displayName: "Test User",
    };
    const mockVerifyIdToken = jest
      .fn()
      .mockResolvedValue({ uid: "firebase-uid" });

    mockInitializeFirebaseAdmin.mockResolvedValue({
      auth: () => ({ verifyIdToken: mockVerifyIdToken }),
    });
    mockFindOne.mockResolvedValue(mockUser);

    await verifyAuth(req, res, next);

    expect(mockFindOne).toHaveBeenCalledWith({
      firebaseUid: "firebase-uid",
      isDeleted: false,
    });
    expect(req.user).toEqual(mockUser);
    expect(req.firebaseUid).toBe("firebase-uid");
    expect(next).toHaveBeenCalledWith();
  });

  it("blocks access when the authenticated user does not have the required role", async () => {
    req.user = { role: "renter" };

    await requireRole("admin")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(next.mock.calls[0][0].message).toBe(
      "Forbidden: admin role required",
    );
  });

  it("allows access when the authenticated user has the required role", async () => {
    req.user = { role: "admin" };

    await requireRole("admin")(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
