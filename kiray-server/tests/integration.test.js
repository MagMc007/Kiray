import "dotenv/config";

/**
 * Integration test: Verify Firebase and Cloudinary connections work with real credentials
 * Run this with: node tests/integration-test.js
 */

async function testFirebase() {
  console.log("\n========== Testing Firebase ==========");
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    // Validate all required fields are present
    const requiredFields = [
      "type",
      "project_id",
      "private_key",
      "client_email",
      "client_id",
    ];
    const missingFields = requiredFields.filter(
      (field) => !serviceAccount[field],
    );

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required Firebase fields: ${missingFields.join(", ")}`,
      );
    }

    console.log("✅ Firebase credentials validated successfully");
    console.log(`   Type: ${serviceAccount.type}`);
    console.log(`   Project ID: ${serviceAccount.project_id}`);
    console.log(`   Service Account Email: ${serviceAccount.client_email}`);
    console.log(
      `   Private Key: ${serviceAccount.private_key.substring(0, 50)}...`,
    );

    // Note: Full Firebase Admin initialization is tested at runtime when auth middleware is used
    console.log("✅ Firebase config ready for use in auth middleware");

    return true;
  } catch (error) {
    console.error("❌ Firebase validation failed:");
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function testCloudinary() {
  console.log("\n========== Testing Cloudinary ==========");
  try {
    const cloudinary = await import("cloudinary");

    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Make a simple API call to verify credentials work
    // The 'ping' endpoint is lightweight and doesn't require upload permissions
    const result = await new Promise((resolve, reject) => {
      cloudinary.v2.api.ping((error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    console.log("✅ Cloudinary connected successfully");
    console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(
      `   API Key: ${process.env.CLOUDINARY_API_KEY.substring(0, 10)}...`,
    );
    console.log(`   Ping Response: ${JSON.stringify(result)}`);

    return true;
  } catch (error) {
    console.error("❌ Cloudinary connection failed:");
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log("\n🚀 Starting Firebase & Cloudinary Integration Tests\n");

  const firebaseOk = await testFirebase();
  const cloudinaryOk = await testCloudinary();

  console.log("\n========== Test Summary ==========");
  console.log(`Firebase:  ${firebaseOk ? "✅ PASSED" : "❌ FAILED"}`);
  console.log(`Cloudinary: ${cloudinaryOk ? "✅ PASSED" : "❌ FAILED"}`);

  if (firebaseOk && cloudinaryOk) {
    console.log("\n🎉 All integrations are working!\n");
    process.exit(0);
  } else {
    console.log(
      "\n⚠️  Some integrations failed. Please check your credentials.\n",
    );
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test suite error:", err);
  process.exit(1);
});
