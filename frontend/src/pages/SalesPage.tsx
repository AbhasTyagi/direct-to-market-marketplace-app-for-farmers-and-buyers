import { Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetFarmerOrderRequests, useAcceptOrderRequest, useDeclineOrderRequest } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { OrderRequest, Variant_pending_accepted_declined } from '../backend';

export default function SalesPage() {
  const { identity } = useInternetIdentity();
  const { data: orders = [], isLoading } = useGetFarmerOrderRequests();
  const acceptOrder = useAcceptOrderRequest();
  const declineOrder = useDeclineOrderRequest();

  const handleAccept = async (orderId: bigint) => {
    try {
      await acceptOrder.mutateAsync(orderId);
      toast.success('Order accepted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept order');
    }
  };

  const handleDecline = async (orderId: bigint) => {
    try {
      await declineOrder.mutateAsync(orderId);
      toast.success('Order declined');
    } catch (error: any) {
      toast.error(error.message || 'Failed to decline order');
    }
  };

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground">Please sign in to view your sales.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Sales</h1>
        <p className="text-muted-foreground">Manage incoming order requests</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">No order requests yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id.toString()} order={order} onAccept={handleAccept} onDecline={handleDecline} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({
  order,
  onAccept,
  onDecline,
}: {
  order: OrderRequest;
  onAccept: (id: bigint) => void;
  onDecline: (id: bigint) => void;
}) {
  const statusLabel = getStatusLabel(order.status);
  const statusVariant = getStatusVariant(order.status);
  const isPending = order.status === Variant_pending_accepted_declined.pending;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">Order #{order.id.toString()}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Listing ID: {order.listingId.toString()} • Quantity: {order.quantity}
            </p>
          </div>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium mb-1">Pickup/Delivery Details:</p>
          <p className="text-sm text-muted-foreground">{order.note}</p>
        </div>
        {order.message && (
          <div>
            <p className="text-sm font-medium mb-1">Buyer Message:</p>
            <p className="text-sm text-muted-foreground">{order.message}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        {isPending ? (
          <>
            <Button onClick={() => onAccept(order.id)} size="sm" className="flex-1">
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button onClick={() => onDecline(order.id)} variant="outline" size="sm" className="flex-1">
              <X className="h-4 w-4 mr-1" />
              Decline
            </Button>
          </>
        ) : (
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to="/order/$orderId" params={{ orderId: order.id.toString() }}>
              View Details
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
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
