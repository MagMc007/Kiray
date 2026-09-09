import "dotenv/config";
import mongoose from "mongoose";
import Comment from "../src/models/Comment.js";
import Listing from "../src/models/Listing.js";
import logger from "../src/config/logger.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/Kiray";

/**
 * Recursively inspect execution stages to find scan types and index names.
 */
function inspectStages(stage) {
  let hasInMemorySort = false;
  let scanType = "COLLSCAN";
  let indexName = "none";

  function traverse(current) {
    if (!current) return;
    if (current.stage === "SORT") {
      hasInMemorySort = true;
    }
    if (current.stage === "IXSCAN") {
      scanType = "IXSCAN";
      indexName = current.indexName || "unknown";
    }
    if (current.inputStage) {
      traverse(current.inputStage);
    }
    if (Array.isArray(current.inputStages)) {
      current.inputStages.forEach(traverse);
    }
  }

  traverse(stage);
  return { hasInMemorySort, scanType, indexName };
}

function displayReport(title, explainResult) {
  const { queryPlanner, executionStats } = explainResult;
  const stages = executionStats ? executionStats.executionStages : queryPlanner.winningPlan;
  const { hasInMemorySort, scanType, indexName } = inspectStages(stages);

  console.log(`\n======================================================`);
  console.log(`🔍 QUERY: ${title}`);
  console.log(`------------------------------------------------------`);
  console.log(`  • Scan Strategy:     ${scanType === "IXSCAN" ? "✅ IXSCAN (Indexed)" : "⚠️ COLLSCAN (Full Table Scan)"}`);
  console.log(`  • Index Used:        ${indexName}`);
  console.log(`  • In-Memory Sort:    ${hasInMemorySort ? "⚠️ YES (Sorting in RAM)" : "✅ NO (Index-backed Sort)"}`);
  console.log(`  • Keys Examined:     ${executionStats?.totalKeysExamined ?? "N/A"}`);
  console.log(`  • Docs Examined:     ${executionStats?.totalDocsExamined ?? "N/A"}`);
  console.log(`  • Docs Returned:     ${executionStats?.nReturned ?? "N/A"}`);
  console.log(`  • Execution Time:    ${executionStats?.executionTimeMillis ?? 0} ms`);
  console.log(`======================================================`);
}

async function runExplain() {
  try {
    console.log("Connecting to MongoDB at:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected! Synchronizing schema indexes...");

    // Ensure all compound indexes declared in schemas are built in MongoDB
    await Comment.syncIndexes();
    await Listing.syncIndexes();
    console.log("Indexes synchronized successfully.");

    const sampleListingId = new mongoose.Types.ObjectId();

    // 1. Comment query (GET /api/v1/listings/:id/comments)
    const commentExplain = await Comment.find({
      listingId: sampleListingId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .explain("executionStats");

    displayReport("Listing Comments Query (listingId + isDeleted + sort(createdAt))", commentExplain);

    // 2. Public Open Listings Browse (GET /api/v1/listings)
    const listingBrowseExplain = await Listing.find({
      status: "open",
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .explain("executionStats");

    displayReport("Public Listings Browse (status='open' + isDeleted=false + sort(createdAt))", listingBrowseExplain);

    // 3. Price Filter Listings (GET /api/v1/listings?minPrice=1000&maxPrice=5000)
    const listingPriceExplain = await Listing.find({
      status: "open",
      isDeleted: false,
      price: { $gte: 1000, $lte: 5000 },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .explain("executionStats");

    displayReport("Price Filtered Listings (status + isDeleted + price range + sort)", listingPriceExplain);

  } catch (error) {
    console.error("Explain analysis failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  }
}

runExplain();
