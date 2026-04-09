import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sprout, Users, ShoppingBag, MessageSquare, TrendingUp, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Farm Fresh,{' '}
                <span className="text-primary">
                  Direct
                  <br />
                  to You
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                Connect farmers directly with buyers. No middlemen, fair prices, fresh produce. Join our community
                marketplace today.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="text-base">
                  <Link to="/marketplace">Browse Marketplace</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base">
                  <Link to="/profile">Get Started</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="/assets/generated/farm-market-hero.dim_1600x900.png"
                alt="Farmers and buyers connecting"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose FarmDirect?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A platform built for the agricultural community, connecting producers and consumers directly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Sprout className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fresh & Local</h3>
                <p className="text-muted-foreground">
                  Get produce directly from local farmers. Know where your food comes from and support your community.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Direct Connection</h3>
                <p className="text-muted-foreground">
                  No intermediaries. Farmers set their own prices, buyers get fair deals. Everyone wins.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Ordering</h3>
                <p className="text-muted-foreground">
                  Browse listings, place orders, and coordinate pickup or delivery directly with farmers.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Direct Messaging</h3>
                <p className="text-muted-foreground">
                  Communicate directly with farmers about orders, availability, and special requests.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fair Pricing</h3>
                <p className="text-muted-foreground">
                  Farmers earn more, buyers pay less. Cutting out middlemen benefits everyone in the supply chain.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
                <p className="text-muted-foreground">
                  Built on Internet Computer with secure authentication. Your data and transactions are protected.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're a farmer looking to reach more customers or a buyer seeking fresh local produce, FarmDirect
            is here for you.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link to="/marketplace">Explore Marketplace</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <Link to="/profile">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
