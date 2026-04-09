import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useGetAllListings } from '../hooks/useQueries';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { Listing, ProductCategory } from '../backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

const ITEMS_PER_PAGE = 12;

export default function MarketplacePage() {
  const { identity } = useInternetIdentity();
  const { data: listings = [], isLoading } = useGetAllListings();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  const isAuthenticated = !!identity;

  const filteredAndSortedListings = useMemo(() => {
    let filtered = listings.filter((listing) => {
      // Only show published listings to non-owners
      if (!listing.isPublished && listing.farmer.toString() !== identity?.getPrincipal().toString()) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = listing.title.toLowerCase().includes(term);
        const matchesDescription = listing.description.toLowerCase().includes(term);
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Category filter
      if (categoryFilter !== 'all') {
        const categoryKey = getCategoryKey(listing.category);
        if (categoryKey !== categoryFilter) return false;
      }

      // Location filter
      if (locationFilter) {
        const term = locationFilter.toLowerCase();
        if (!listing.location.toLowerCase().includes(term)) return false;
      }

      return true;
    });

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => Number(b.createdAt - a.createdAt));
    } else if (sortBy === 'price_asc') {
      filtered.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
    }

    return filtered;
  }, [listings, searchTerm, categoryFilter, locationFilter, sortBy, identity]);

  const displayedListings = filteredAndSortedListings.slice(0, displayCount);
  const hasMore = displayCount < filteredAndSortedListings.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Marketplace</h1>
        <p className="text-muted-foreground">Browse fresh produce from local farmers</p>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-lg p-4 mb-8 space-y-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="vegetables">Vegetables</SelectItem>
              <SelectItem value="fruits">Fruits</SelectItem>
              <SelectItem value="grains">Grains</SelectItem>
              <SelectItem value="dairy">Dairy</SelectItem>
              <SelectItem value="livestock">Livestock</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {displayedListings.length} of {filteredAndSortedListings.length} listings
          </span>
          {(searchTerm || categoryFilter !== 'all' || locationFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setLocationFilter('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : displayedListings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground mb-4">No listings found</p>
          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground">Sign in to see all available listings</p>
          )}
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedListings.map((listing) => (
              <ListingCard key={listing.id.toString()} listing={listing} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-8">
              <Button onClick={() => setDisplayCount((prev) => prev + ITEMS_PER_PAGE)} variant="outline" size="lg">
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const categoryLabel = getCategoryLabel(listing.category);

  return (
    <Link to="/listing/$listingId" params={{ listingId: listing.id.toString() }}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {categoryLabel}
            </Badge>
            {!listing.isPublished && (
              <Badge variant="outline" className="text-xs">
                Draft
              </Badge>
            )}
          </div>
          <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">{listing.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{listing.description}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-semibold">
                ${listing.pricePerUnit.toFixed(2)}/{listing.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Available:</span>
              <span className="font-medium">
                {listing.availableQuantity} {listing.unit}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          <span className="truncate">{listing.location}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}

function getCategoryKey(category: ProductCategory): string {
  if ('vegetables' in category) return 'vegetables';
  if ('fruits' in category) return 'fruits';
  if ('grains' in category) return 'grains';
  if ('dairy' in category) return 'dairy';
  if ('livestock' in category) return 'livestock';
  if ('other' in category) return 'other';
  return 'other';
}

function getCategoryLabel(category: ProductCategory): string {
  if ('vegetables' in category) return 'Vegetables';
  if ('fruits' in category) return 'Fruits';
  if ('grains' in category) return 'Grains';
  if ('dairy' in category) return 'Dairy';
  if ('livestock' in category) return 'Livestock';
  if ('other' in category) return category.other;
  return 'Other';
}
