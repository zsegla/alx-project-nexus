import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    imageUrl: v.string(),
    brand: v.string(),
    rating: v.number(),
    stock: v.number(),
    tags: v.array(v.string()),
  })
    .index("by_category", ["category"])
    .index("by_price", ["price"])
    .index("by_rating", ["rating"])
    .searchIndex("search_products", {
      searchField: "name",
      filterFields: ["category", "brand"],
    }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
