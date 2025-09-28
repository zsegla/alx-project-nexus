import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

// Get paginated products with filtering and sorting
export const getProducts = query({
  args: {
    paginationOpts: paginationOptsValidator,
    category: v.optional(v.string()),
    sortBy: v.optional(v.union(v.literal("price_asc"), v.literal("price_desc"), v.literal("rating"), v.literal("name"))),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Apply search if provided
    if (args.searchQuery) {
      return await ctx.db
        .query("products")
        .withSearchIndex("search_products", (q) => q.search("name", args.searchQuery!))
        .paginate(args.paginationOpts);
    }

    // Build query based on filters and sorting
    if (args.sortBy === "price_asc") {
      let query = ctx.db.query("products").withIndex("by_price").order("asc");
      if (args.category && args.category !== "all") {
        query = query.filter((q) => q.eq(q.field("category"), args.category!));
      }
      if (args.minPrice !== undefined || args.maxPrice !== undefined) {
        query = query.filter((q) => {
          let condition = q.gte(q.field("price"), args.minPrice ?? 0);
          if (args.maxPrice !== undefined) {
            condition = q.and(condition, q.lte(q.field("price"), args.maxPrice));
          }
          return condition;
        });
      }
      return await query.paginate(args.paginationOpts);
    } else if (args.sortBy === "price_desc") {
      let query = ctx.db.query("products").withIndex("by_price").order("desc");
      if (args.category && args.category !== "all") {
        query = query.filter((q) => q.eq(q.field("category"), args.category!));
      }
      if (args.minPrice !== undefined || args.maxPrice !== undefined) {
        query = query.filter((q) => {
          let condition = q.gte(q.field("price"), args.minPrice ?? 0);
          if (args.maxPrice !== undefined) {
            condition = q.and(condition, q.lte(q.field("price"), args.maxPrice));
          }
          return condition;
        });
      }
      return await query.paginate(args.paginationOpts);
    } else if (args.sortBy === "rating") {
      let query = ctx.db.query("products").withIndex("by_rating").order("desc");
      if (args.category && args.category !== "all") {
        query = query.filter((q) => q.eq(q.field("category"), args.category!));
      }
      if (args.minPrice !== undefined || args.maxPrice !== undefined) {
        query = query.filter((q) => {
          let condition = q.gte(q.field("price"), args.minPrice ?? 0);
          if (args.maxPrice !== undefined) {
            condition = q.and(condition, q.lte(q.field("price"), args.maxPrice));
          }
          return condition;
        });
      }
      return await query.paginate(args.paginationOpts);
    } else if (args.category && args.category !== "all") {
      let query = ctx.db.query("products").withIndex("by_category", (q) => q.eq("category", args.category!));
      if (args.minPrice !== undefined || args.maxPrice !== undefined) {
        query = query.filter((q) => {
          let condition = q.gte(q.field("price"), args.minPrice ?? 0);
          if (args.maxPrice !== undefined) {
            condition = q.and(condition, q.lte(q.field("price"), args.maxPrice));
          }
          return condition;
        });
      }
      return await query.paginate(args.paginationOpts);
    } else {
      // Default query with name sorting
      let query = ctx.db.query("products").order("asc");
      if (args.minPrice !== undefined || args.maxPrice !== undefined) {
        query = query.filter((q) => {
          let condition = q.gte(q.field("price"), args.minPrice ?? 0);
          if (args.maxPrice !== undefined) {
            condition = q.and(condition, q.lte(q.field("price"), args.maxPrice));
          }
          return condition;
        });
      }
      return await query.paginate(args.paginationOpts);
    }
  },
});

// Get all unique categories
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const categories = [...new Set(products.map(p => p.category))];
    return categories.sort();
  },
});

// Get price range for filters
export const getPriceRange = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    if (products.length === 0) return { min: 0, max: 1000 };
    
    const prices = products.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  },
});

// Seed products with sample data
export const seedProducts = mutation({
  args: {},
  handler: async (ctx) => {
    const sampleProducts = [
      {
        name: "iPhone 15 Pro",
        description: "Latest iPhone with advanced camera system and A17 Pro chip",
        price: 999,
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
        brand: "Apple",
        rating: 4.8,
        stock: 50,
        tags: ["smartphone", "premium", "camera"],
      },
      {
        name: "MacBook Air M2",
        description: "Lightweight laptop with M2 chip and all-day battery life",
        price: 1199,
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400",
        brand: "Apple",
        rating: 4.9,
        stock: 30,
        tags: ["laptop", "portable", "productivity"],
      },
      {
        name: "Nike Air Max 270",
        description: "Comfortable running shoes with Max Air cushioning",
        price: 150,
        category: "Fashion",
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        brand: "Nike",
        rating: 4.5,
        stock: 100,
        tags: ["shoes", "running", "comfort"],
      },
      {
        name: "Levi's 501 Jeans",
        description: "Classic straight-fit jeans made from premium denim",
        price: 89,
        category: "Fashion",
        imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
        brand: "Levi's",
        rating: 4.3,
        stock: 75,
        tags: ["jeans", "classic", "denim"],
      },
      {
        name: "The Great Gatsby",
        description: "Classic American novel by F. Scott Fitzgerald",
        price: 12,
        category: "Books",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
        brand: "Scribner",
        rating: 4.2,
        stock: 200,
        tags: ["fiction", "classic", "literature"],
      },
      {
        name: "Atomic Habits",
        description: "Life-changing guide to building good habits and breaking bad ones",
        price: 18,
        category: "Books",
        imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
        brand: "Avery",
        rating: 4.7,
        stock: 150,
        tags: ["self-help", "productivity", "habits"],
      },
      {
        name: "Yoga Mat Premium",
        description: "Non-slip yoga mat perfect for all types of yoga practice",
        price: 45,
        category: "Sports",
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
        brand: "YogaLife",
        rating: 4.4,
        stock: 80,
        tags: ["yoga", "fitness", "exercise"],
      },
      {
        name: "Protein Powder Vanilla",
        description: "High-quality whey protein powder for muscle building",
        price: 35,
        category: "Sports",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
        brand: "FitNutrition",
        rating: 4.1,
        stock: 120,
        tags: ["protein", "supplement", "fitness"],
      },
      {
        name: "Wireless Headphones",
        description: "Premium noise-cancelling wireless headphones",
        price: 299,
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        brand: "SoundTech",
        rating: 4.6,
        stock: 60,
        tags: ["headphones", "wireless", "audio"],
      },
      {
        name: "Coffee Maker Deluxe",
        description: "Programmable coffee maker with built-in grinder",
        price: 179,
        category: "Home",
        imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
        brand: "BrewMaster",
        rating: 4.3,
        stock: 40,
        tags: ["coffee", "kitchen", "appliance"],
      },
      {
        name: "Organic Face Cream",
        description: "Natural moisturizing cream for all skin types",
        price: 28,
        category: "Beauty",
        imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400",
        brand: "NaturalGlow",
        rating: 4.5,
        stock: 90,
        tags: ["skincare", "organic", "moisturizer"],
      },
      {
        name: "Gaming Mouse RGB",
        description: "High-precision gaming mouse with customizable RGB lighting",
        price: 79,
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400",
        brand: "GameTech",
        rating: 4.4,
        stock: 70,
        tags: ["gaming", "mouse", "rgb"],
      },
    ];

    // Check if products already exist
    const existingProducts = await ctx.db.query("products").collect();
    if (existingProducts.length > 0) {
      return "Products already seeded";
    }

    // Insert sample products
    for (const product of sampleProducts) {
      await ctx.db.insert("products", product);
    }

    return "Products seeded successfully";
  },
});
