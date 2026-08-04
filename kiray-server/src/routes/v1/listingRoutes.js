/**
 * @openapi
 * /api/v1/listings:
 *   post:
 *     summary: Create a listing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               ownerId: 507f191e810c19729de860ea
 *               title: Sunny apartment
 *               description: Bright two-bedroom apartment in a quiet neighborhood
 *               price: 1200
 *               propertyType: apartment
 *               bedrooms: 2
 *               bathrooms: 1
 *               location:
 *                 type: Point
 *                 coordinates: [40.7128, -74.006]
 *               address:
 *                 street: Main Street
 *                 city: New York
 *     responses:
 *       '201':
 *         description: Listing created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 success: true
 *                 message: Listing created successfully
 *                 data:
 *                   _id: 507f191e810c19729de860ea
 *                   title: Sunny apartment
 *                   slug: sunny-apartment
 *                   status: open
 *                   isDeleted: false
 */

export default function listingRoutes() {
  return null;
}
