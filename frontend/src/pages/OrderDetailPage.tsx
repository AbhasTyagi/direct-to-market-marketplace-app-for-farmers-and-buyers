import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetBuyerOrderRequests, useGetFarmerOrderRequests, useGetListingById } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2 } from 'lucide-react';
import OrderMessagesThread from '../components/OrderMessagesThread';
import { Variant_pending_accepted_declined } from '../backend';

export default function OrderDetailPage() {
  const { orderId } = useParams({ from: '/order/$orderId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: buyerOrders = [] } = useGetBuyerOrderRequests();
  const { data: farmerOrders = [] } = useGetFarmerOrderRequests();

  const order = [...buyerOrders, ...farmerOrders].find((o) => o.id.toString() === orderId);
  const { data: listing } = useGetListingById(order?.listingId.toString());

  const isBuyer = order && identity && order.buyer.toString() === identity.getPrincipal().toString();
  const isFarmer = listing && identity && listing.farmer.toString() === identity.getPrincipal().toString();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground">Please sign in to view order details.</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const statusLabel = getStatusLabel(order.status);
  const statusVariant = getStatusVariant(order.status);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: isBuyer ? '/purchases' : '/sales' })}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to {isBuyer ? 'Purchases' : 'Sales'}
      </Button>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Order #{order.id.toString()}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {isBuyer ? 'Your order request' : 'Order from buyer'}
                </p>
              </div>
              <Badge variant={statusVariant} className="text-sm">
                {statusLabel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Listing</p>
                <p className="text-sm">{listing?.title || `ID: ${order.listingId.toString()}`}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                <p className="text-sm">{order.quantity}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Pickup/Delivery Details</p>
              <p className="text-sm">{order.note}</p>
            </div>

            {order.message && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Initial Message</p>
                  <p className="text-sm">{order.message}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <OrderMessagesThread orderId={orderId} />
      </div>
    </div>
  );
}

function getStatusLabel(status: Variant_pending_accepted_declined): string {
  switch (status) {
    case Variant_pending_accepted_declined.pending:
      return 'Pending';
    case Variant_pending_accepted_declined.accepted:
      return 'Accepted';
    case Variant_pending_accepted_declined.declined:
      return 'Declined';
    default:
      return 'Unknown';
  }
}

function getStatusVariant(status: Variant_pending_accepted_declined): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case Variant_pending_accepted_declined.pending:
      return 'secondary';
    case Variant_pending_accepted_declined.accepted:
      return 'default';
    case Variant_pending_accepted_declined.declined:
      return 'destructive';
    default:
      return 'outline';
  }
}
