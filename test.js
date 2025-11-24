// test-stripe-keys.js
import Stripe from "stripe";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

console.log("🔍 Checking Stripe Configuration...\n");

// Check if keys are loaded
console.log("1. Environment Variables Loaded:");
console.log("   - STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY);
console.log(
  "   - STRIPE_PUBLISHABLE_KEY exists:",
  !!process.env.STRIPE_PUBLISHABLE_KEY
);
console.log("   - CLIENT_URL:", process.env.CLIENT_URL);

// Check key format
if (process.env.STRIPE_SECRET_KEY) {
  console.log("\n2. Stripe Secret Key Analysis:");
  console.log("   - Length:", process.env.STRIPE_SECRET_KEY.length);
  console.log(
    "   - Starts with:",
    process.env.STRIPE_SECRET_KEY.substring(0, 7)
  );
  console.log("   - Expected length: 98-100 characters");
  console.log(
    "   - Valid format:",
    process.env.STRIPE_SECRET_KEY.startsWith("sk_test_")
  );
}

if (process.env.STRIPE_PUBLISHABLE_KEY) {
  console.log("\n3. Stripe Publishable Key Analysis:");
  console.log("   - Length:", process.env.STRIPE_PUBLISHABLE_KEY.length);
  console.log(
    "   - Starts with:",
    process.env.STRIPE_PUBLISHABLE_KEY.substring(0, 7)
  );
  console.log("   - Expected length: 98-100 characters");
  console.log(
    "   - Valid format:",
    process.env.STRIPE_PUBLISHABLE_KEY.startsWith("pk_test_")
  );
}

// Test Stripe connection
async function testStripeConnection() {
  console.log("\n4. Testing Stripe Connection...");

  if (!process.env.STRIPE_SECRET_KEY) {
    console.log("   ❌ No Stripe secret key found");
    return;
  }

  // if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
  //   console.log('   ❌ Invalid key format - must start with "sk_test_"');
  //   return;
  // }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    // Make a simple API call to test the key
    const balance = await stripe.balance.retrieve();
    console.log("   ✅ Stripe connection successful!");
    console.log(
      "   💰 Available balance:",
      balance.available[0].amount,
      balance.available[0].currency
    );
  } catch (error) {
    console.log("   ❌ Stripe connection failed:");
    console.log("   Error type:", error.type);
    console.log("   Error message:", error.message);

    if (error.type === "StripeAuthenticationError") {
      console.log("   💡 Solution: Get new API keys from Stripe Dashboard");
      console.log("   🔗 https://dashboard.stripe.com/test/apikeys");
    }
  }
}

testStripeConnection();
