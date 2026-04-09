import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetListingsByFarmer,
  usePublishListing,
  useUnpublishListing,
  useDeleteListing,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Loader2, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Listing, ProductCategory } from '../backend';

export default function MyListingsPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: listings = [], isLoading } = useGetListingsByFarmer(identity?.getPrincipal().toString());
  const publishListing = usePublishListing();
  const unpublishListing = useUnpublishListing();
  const deleteListing = useDeleteListing();

  const handlePublish = async (listingId: bigint) => {
    try {
      await publishListing.mutateAsync(listingId);
      toast.success('Listing published successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish listing');
    }
  };

  const handleUnpublish = async (listingId: bigint) => {
    try {
      await unpublishListing.mutateAsync(listingId);
      toast.success('Listing unpublished');
    } catch (error: any) {
      toast.error(error.message || 'Failed to unpublish listing');
    }
  };

  const handleDelete = async (listingId: bigint) => {
    try {
      await deleteListing.mutateAsync(listingId);
      toast.success('Listing deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete listing');
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground">Please sign in to view your listings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Listings</h1>
          <p className="text-muted-foreground">Manage your product listings</p>
        </div>
        <Button asChild>
          <Link to="/create-listing">
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground mb-4">You haven't created any listings yet</p>
          <Button asChild>
            <Link to="/create-listing">Create Your First Listing</Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id.toString()}
              listing={listing}
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingCard({
  listing,
  onPublish,
  onUnpublish,
  onDelete,
}: {
  listing: Listing;
  onPublish: (id: bigint) => void;
  onUnpublish: (id: bigint) => void;
  onDelete: (id: bigint) => void;
}) {
  const categoryLabel = getCategoryLabel(listing.category);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">
            {categoryLabel}
          </Badge>
          <Badge variant={listing.isPublished ? 'default' : 'outline'} className="text-xs">
            {listing.isPublished ? 'Published' : 'Draft'}
          </Badge>
        </div>
        <CardTitle className="line-clamp-2">{listing.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
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
      <CardFooter className="flex flex-col gap-2">
        <div className="flex gap-2 w-full">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to="/edit-listing/$listingId" params={{ listingId: listing.id.toString() }}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (listing.isPublished ? onUnpublish(listing.id) : onPublish(listing.id))}
          >
            {listing.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this listing? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(listing.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <Button asChild variant="ghost" size="sm" className="w-full">
          <Link to="/listing/$listingId" params={{ listingId: listing.id.toString() }}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
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
