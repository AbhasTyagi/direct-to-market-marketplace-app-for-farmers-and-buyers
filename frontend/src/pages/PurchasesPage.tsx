import { Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetBuyerOrderRequests } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { OrderRequest, Variant_pending_accepted_declined } from '../backend';

export default function PurchasesPage() {
  const { identity } = useInternetIdentity();
  const { data: orders = [], isLoading } = useGetBuyerOrderRequests();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground">Please sign in to view your purchases.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Purchases</h1>
        <p className="text-muted-foreground">Track your order requests</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground mb-4">You haven't placed any orders yet</p>
          <Button asChild>
            <Link to="/marketplace">Browse Marketplace</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id.toString()} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: OrderRequest }) {
  const statusLabel = getStatusLabel(order.status);
  const statusVariant = getStatusVariant(order.status);

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
            <p className="text-sm font-medium mb-1">Your Message:</p>
            <p className="text-sm text-muted-foreground">{order.message}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to="/order/$orderId" params={{ orderId: order.id.toString() }}>
            View Details & Messages
          </Link>
        </Button>
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
