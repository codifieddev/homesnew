import * as dotenv from "dotenv";
import path from "node:path";
import { getProperties } from "./src/lib/db/actions/property.actions";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const params: any = {};
  const page = 1;

  const args = {
    status: "active",
    propertyType: params.type,
    search: params.search,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    possessionStatus: params.possession,
    page,
    limit: 12,
    sortBy: "isFeatured",
    sortOrder: "desc",
  };

  console.log("Passing args to getProperties:", args);
  const res = await getProperties(args as any);
  console.log("Result:", JSON.stringify(res, null, 2));
  process.exit(0);
}

main().catch(console.error);
