import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";
import { toast } from "sonner";

interface FilterState {
  category: string;
  sortBy: string;
  minPrice: number;
  maxPrice: number;
  searchQuery: string;
}

export default function ProductCatalog() {
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    sortBy: "name",
    minPrice: 0,
    maxPrice: 1000,
    searchQuery: "",
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const seedProducts = useMutation(api.products.seedProducts);
  const categories = useQuery(api.products.getCategories);
  const priceRange = useQuery(api.products.getPriceRange);

  // Fetch products with current filters
  const productsResult = useQuery(api.products.getProducts, {
    paginationOpts: { numItems: 12, cursor: null },
    category: filters.category !== "all" ? filters.category : undefined,
    sortBy: filters.sortBy as any,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    searchQuery: filters.searchQuery || undefined,
  });

  // Initialize products and seed data if needed
  useEffect(() => {
    if (productsResult) {
      setAllProducts(productsResult.page);
      setHasMore(!productsResult.isDone);
      setCurrentPage(0);
    }
  }, [productsResult]);

  // Seed products on first load if no products exist
  useEffect(() => {
    if (productsResult && productsResult.page.length === 0 && !filters.searchQuery && filters.category === "all") {
      seedProducts().then(() => {
        toast.success("Sample products loaded!");
      }).catch(() => {
        toast.error("Failed to load sample products");
      });
    }
  }, [productsResult, seedProducts, filters]);

  // Load more products (infinite scroll)
  const loadMoreProducts = useQuery(
    api.products.getProducts,
    hasMore && currentPage > 0 ? {
      paginationOpts: { 
        numItems: 12, 
        cursor: productsResult?.continueCursor || null 
      },
      category: filters.category !== "all" ? filters.category : undefined,
      sortBy: filters.sortBy as any,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      searchQuery: filters.searchQuery || undefined,
    } : "skip"
  );

  useEffect(() => {
    if (loadMoreProducts && currentPage > 0) {
      setAllProducts(prev => [...prev, ...loadMoreProducts.page]);
      setHasMore(!loadMoreProducts.isDone);
      setIsLoadingMore(false);
    }
  }, [loadMoreProducts, currentPage]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(0);
    setAllProducts([]);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  };

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore]);

  if (!productsResult || !categories || !priceRange) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Catalog</h1>
        <p className="text-gray-600">Discover amazing products tailored for you</p>
      </div>

      {/* Filters */}
      <ProductFilters
        filters={filters}
        categories={categories}
        priceRange={priceRange}
        onFilterChange={handleFilterChange}
      />

      {/* Results count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {allProducts.length} products
          {filters.category !== "all" && ` in ${filters.category}`}
          {filters.searchQuery && ` for "${filters.searchQuery}"`}
        </p>
      </div>

      {/* Products Grid */}
      {allProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Loading more indicator */}
          {isLoadingMore && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading more products...</span>
            </div>
          )}

          {/* Load more button (fallback for infinite scroll) */}
          {hasMore && !isLoadingMore && (
            <div className="text-center py-8">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Load More Products
              </button>
            </div>
          )}

          {!hasMore && allProducts.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">You've reached the end of our catalog!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
