import AuditLog from "../models/AuditLog.js";

/**
 * Log an administrative action to the AuditLog collection.
 * 
 * @param {Object} params
 * @param {string} params.adminId - ObjectId string or ObjectId of the admin
 * @param {string} params.action - Descriptive action code (e.g. 'BAN_USER', 'RESOLVE_FLAG')
 * @param {string} params.targetType - 'User' | 'Listing' | 'Comment' | 'Report' | 'System'
 * @param {any} [params.targetId] - ID of target resource
 * @param {Object} [params.metadata] - Extra metadata payload
 * @param {string} [params.ipAddress] - IP address of admin
 */
export const logAuditAction = async ({
  adminId,
  action,
  targetType,
  targetId = null,
  metadata = {},
  ipAddress = null,
}) => {
  try {
    return await AuditLog.create({
      adminId,
      action,
      targetType,
      targetId,
      metadata,
      ipAddress,
    });
  } catch (err) {
    // Audit log failure should be recorded in console/logger without breaking request flow
    console.error("Failed to write audit log:", err);
    return null;
  }
};
