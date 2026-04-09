import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetListingById, useCreateListing, useUpdateListing } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Listing, ProductCategory } from '../backend';

export default function ListingFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { listingId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: existingListing, isLoading: loadingListing } = useGetListingById(mode === 'edit' ? listingId : undefined);
  const createListing = useCreateListing();
  const updateListing = useUpdateListing();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('vegetables');
  const [unit, setUnit] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (mode === 'edit' && existingListing) {
      setTitle(existingListing.title);
      setCategory(getCategoryKey(existingListing.category));
      setUnit(existingListing.unit);
      setQuantity(existingListing.availableQuantity.toString());
      setPrice(existingListing.pricePerUnit.toString());
      setHarvestDate(existingListing.harvestDate || '');
      setLocation(existingListing.location);
      setDescription(existingListing.description);
    }
  }, [mode, existingListing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please sign in to continue');
      return;
    }

    const qty = parseFloat(quantity);
    const priceNum = parseFloat(price);

    if (!title.trim() || !unit.trim() || !location.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const listingData: Listing = {
      id: mode === 'edit' && existingListing ? existingListing.id : BigInt(0),
      farmer: identity.getPrincipal(),
      title: title.trim(),
      category: buildCategory(category),
      unit: unit.trim(),
      availableQuantity: qty,
      pricePerUnit: priceNum,
      harvestDate: harvestDate.trim() || undefined,
      location: location.trim(),
      description: description.trim(),
      createdAt: mode === 'edit' && existingListing ? existingListing.createdAt : BigInt(0),
      updatedAt: undefined,
      isPublished: mode === 'edit' && existingListing ? existingListing.isPublished : false,
    };

    try {
      if (mode === 'create') {
        await createListing.mutateAsync(listingData);
        toast.success('Listing created successfully!');
        navigate({ to: '/my-listings' });
      } else if (existingListing) {
        await updateListing.mutateAsync({ listingId: existingListing.id, listing: listingData });
        toast.success('Listing updated successfully!');
        navigate({ to: '/my-listings' });
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to ${mode} listing`);
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground">Please sign in to create or edit listings.</p>
        </div>
      </div>
    );
  }

  if (mode === 'edit' && loadingListing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (mode === 'edit' && !existingListing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2">Listing Not Found</h2>
          <Button onClick={() => navigate({ to: '/my-listings' })}>Back to My Listings</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" onClick={() => navigate({ to: '/my-listings' })} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to My Listings
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? 'Create New Listing' : 'Edit Listing'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Product Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Fresh Organic Tomatoes"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="fruits">Fruits</SelectItem>
                    <SelectItem value="grains">Grains</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="livestock">Livestock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">
                  Unit <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g., kg, lb, crate, bunch"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Available Quantity <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">
                  Price per Unit ($) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="harvestDate">Harvest/Availability Date (Optional)</Label>
              <Input
                id="harvestDate"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                placeholder="e.g., Available from March 15"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Region"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product, growing methods, quality, etc."
                rows={5}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={createListing.isPending || updateListing.isPending}
                className="flex-1"
              >
                {createListing.isPending || updateListing.isPending
                  ? mode === 'create'
                    ? 'Creating...'
                    : 'Updating...'
                  : mode === 'create'
                    ? 'Create Listing'
                    : 'Update Listing'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate({ to: '/my-listings' })}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function getCategoryKey(category: ProductCategory): string {
  if ('vegetables' in category) return 'vegetables';
  if ('fruits' in category) return 'fruits';
  if ('grains' in category) return 'grains';
  if ('dairy' in category) return 'dairy';
  if ('livestock' in category) return 'livestock';
  return 'vegetables';
}

function buildCategory(key: string): ProductCategory {
  switch (key) {
    case 'vegetables':
      return { __kind__: 'vegetables', vegetables: null };
    case 'fruits':
      return { __kind__: 'fruits', fruits: null };
    case 'grains':
      return { __kind__: 'grains', grains: null };
    case 'dairy':
      return { __kind__: 'dairy', dairy: null };
    case 'livestock':
      return { __kind__: 'livestock', livestock: null };
    default:
      return { __kind__: 'vegetables', vegetables: null };
  }
}
