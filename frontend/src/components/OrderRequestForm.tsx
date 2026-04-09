import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePlaceOrderRequest } from '../hooks/useQueries';
import { Listing } from '../backend';
import { toast } from 'sonner';

export default function OrderRequestForm({ listing }: { listing: Listing }) {
  const navigate = useNavigate();
  const placeOrder = usePlaceOrderRequest();
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (qty > listing.availableQuantity) {
      toast.error(`Maximum available quantity is ${listing.availableQuantity} ${listing.unit}`);
      return;
    }

    if (!note.trim()) {
      toast.error('Please provide pickup/delivery details');
      return;
    }

    try {
      await placeOrder.mutateAsync({
        listingId: listing.id,
        quantity: qty,
        note: note.trim(),
        message: message.trim() || null,
      });
      toast.success('Order request placed successfully!');
      navigate({ to: '/purchases' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order request');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Place Order Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity ({listing.unit}) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              min="0"
              max={listing.availableQuantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={`Max: ${listing.availableQuantity}`}
              required
            />
            <p className="text-xs text-muted-foreground">
              Total: ${((parseFloat(quantity) || 0) * listing.pricePerUnit).toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">
              Pickup/Delivery Details <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Preferred pickup time, delivery address, etc."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message to Farmer (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Any special requests or questions..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={placeOrder.isPending}>
            {placeOrder.isPending ? 'Placing Order...' : 'Place Order Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
