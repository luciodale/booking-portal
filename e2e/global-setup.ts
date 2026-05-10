import { clerkSetup } from "@clerk/testing/playwright";
import dotenv from "dotenv";

dotenv.config({ path: ".dev.vars" });
dotenv.config({ path: ".env" });

export default async function globalSetup() {
  await clerkSetup({
    publishableKey: process.env.PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  });
}
