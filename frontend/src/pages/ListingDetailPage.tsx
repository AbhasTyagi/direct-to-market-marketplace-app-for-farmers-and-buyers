import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { useGetListingById, useGetUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, MapPin, Calendar, Package } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import OrderRequestForm from '../components/OrderRequestForm';
import { ProductCategory } from '../backend';

export default function ListingDetailPage() {
  const { listingId } = useParams({ from: '/listing/$listingId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: listing, isLoading } = useGetListingById(listingId);
  const { data: farmerProfile } = useGetUserProfile(listing?.farmer.toString());

  const isAuthenticated = !!identity;
  const isOwner = listing && identity && listing.farmer.toString() === identity.getPrincipal().toString();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2">Listing Not Found</h2>
          <p className="text-muted-foreground mb-6">This listing may have been removed or doesn't exist.</p>
          <Button onClick={() => navigate({ to: '/marketplace' })}>Back to Marketplace</Button>
        </div>
      </div>
    );
  }

  const categoryLabel = getCategoryLabel(listing.category);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate({ to: '/marketplace' })} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Marketplace
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{listing.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{categoryLabel}</Badge>
                  {!listing.isPublished && (
                    <Badge variant="outline" className="text-xs">
                      Unpublished
                    </Badge>
                  )}
                </div>
              </div>
              {isOwner && (
                <Button asChild variant="outline">
                  <Link to="/edit-listing/$listingId" params={{ listingId: listing.id.toString() }}>
                    Edit
                  </Link>
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{listing.location}</span>
              </div>
              {listing.harvestDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Available: {listing.harvestDate}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>
                  {listing.availableQuantity} {listing.unit} available
                </span>
              </div>
            </div>

            <div className="text-3xl font-bold text-primary mb-6">
              ${listing.pricePerUnit.toFixed(2)}
              <span className="text-lg text-muted-foreground font-normal">/{listing.unit}</span>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
          </div>

          {/* Farmer Profile */}
          {farmerProfile && (
            <>
              <Separator />
              <Card>
                <CardHeader>
                  <CardTitle>About the Farmer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold">{farmerProfile.displayName}</p>
                    <p className="text-sm text-muted-foreground">{farmerProfile.location}</p>
                  </div>
                  {farmerProfile.bio && <p className="text-sm">{farmerProfile.bio}</p>}
                  {farmerProfile.contact && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Contact: </span>
                      <span>{farmerProfile.contact}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {!isOwner && listing.isPublished && <OrderRequestForm listing={listing} />}
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>Your Listing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  This is your listing. You can edit or manage it from your listings page.
                </p>
                <Button asChild className="w-full">
                  <Link to="/my-listings">Manage Listings</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {!isAuthenticated && (
            <Card>
              <CardHeader>
                <CardTitle>Sign In to Order</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Create an account or sign in to place an order with this farmer.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
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
