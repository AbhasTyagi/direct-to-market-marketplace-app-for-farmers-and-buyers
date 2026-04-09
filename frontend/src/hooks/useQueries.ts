import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Listing, OrderRequest, OrderMessage, ProductCategory } from '../backend';

// Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(principal: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      const { Principal } = await import('@dfinity/principal');
      return actor.getUserProfile(Principal.fromText(principal));
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Listing Queries
export function useGetAllListings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Listing[]>({
    queryKey: ['listings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllListings();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetListingById(listingId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Listing | null>({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      if (!actor || !listingId) return null;
      return actor.getListingById(BigInt(listingId));
    },
    enabled: !!actor && !actorFetching && !!listingId,
  });
}

export function useGetListingsByFarmer(farmerPrincipal: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Listing[]>({
    queryKey: ['farmerListings', farmerPrincipal],
    queryFn: async () => {
      if (!actor || !farmerPrincipal) return [];
      const { Principal } = await import('@dfinity/principal');
      return actor.getListingsByFarmer(Principal.fromText(farmerPrincipal));
    },
    enabled: !!actor && !actorFetching && !!farmerPrincipal,
  });
}

export function useCreateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listing: Listing) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createListing(listing);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['farmerListings'] });
    },
  });
}

export function useUpdateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, listing }: { listingId: bigint; listing: Listing }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateListing(listingId, listing);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing'] });
      queryClient.invalidateQueries({ queryKey: ['farmerListings'] });
    },
  });
}

export function usePublishListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.publishListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing'] });
      queryClient.invalidateQueries({ queryKey: ['farmerListings'] });
    },
  });
}

export function useUnpublishListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unpublishListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing'] });
      queryClient.invalidateQueries({ queryKey: ['farmerListings'] });
    },
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['farmerListings'] });
    },
  });
}

// Order Queries
export function useGetBuyerOrderRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<OrderRequest[]>({
    queryKey: ['buyerOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBuyerOrderRequests();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetFarmerOrderRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<OrderRequest[]>({
    queryKey: ['farmerOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFarmerOrderRequests();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function usePlaceOrderRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listingId,
      quantity,
      note,
      message,
    }: {
      listingId: bigint;
      quantity: number;
      note: string;
      message: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrderRequest(listingId, quantity, note, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyerOrders'] });
    },
  });
}

export function useAcceptOrderRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.acceptOrderRequest(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerOrders'] });
      queryClient.invalidateQueries({ queryKey: ['buyerOrders'] });
    },
  });
}

export function useDeclineOrderRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.declineOrderRequest(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmerOrders'] });
      queryClient.invalidateQueries({ queryKey: ['buyerOrders'] });
    },
  });
}

// Order Messages
export function useGetOrderMessages(orderId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<OrderMessage[]>({
    queryKey: ['orderMessages', orderId],
    queryFn: async () => {
      if (!actor || !orderId) return [];
      return actor.getOrderMessages(BigInt(orderId));
    },
    enabled: !!actor && !actorFetching && !!orderId,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });
}

export function useAddOrderMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, message }: { orderId: bigint; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addOrderMessage(orderId, message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orderMessages', variables.orderId.toString()] });
    },
  });
}
