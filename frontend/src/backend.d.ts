import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Listing {
    id: bigint;
    title: string;
    isPublished: boolean;
    availableQuantity: number;
    createdAt: Time;
    unit: string;
    description: string;
    pricePerUnit: number;
    updatedAt?: Time;
    category: ProductCategory;
    harvestDate?: string;
    location: string;
    farmer: Principal;
}
export interface OrderMessage {
    author: Principal;
    orderId: bigint;
    message: string;
    timestamp: Time;
}
export type ProductCategory = {
    __kind__: "grains";
    grains: null;
} | {
    __kind__: "other";
    other: string;
} | {
    __kind__: "livestock";
    livestock: null;
} | {
    __kind__: "fruits";
    fruits: null;
} | {
    __kind__: "vegetables";
    vegetables: null;
} | {
    __kind__: "dairy";
    dairy: null;
};
export interface UserProfile {
    bio: string;
    contact?: string;
    displayName: string;
    role: UserRole;
    location: string;
}
export interface OrderRequest {
    id: bigint;
    status: Variant_pending_accepted_declined;
    listingId: bigint;
    note: string;
    createdAt: Time;
    updatedAt?: Time;
    message?: string;
    quantity: number;
    buyer: Principal;
}
export enum UserRole {
    buyer = "buyer",
    farmer = "farmer"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_accepted_declined {
    pending = "pending",
    accepted = "accepted",
    declined = "declined"
}
export interface backendInterface {
    acceptOrderRequest(orderId: bigint): Promise<void>;
    addOrderMessage(orderId: bigint, message: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    createListing(listing: Listing): Promise<bigint>;
    declineOrderRequest(orderId: bigint): Promise<void>;
    deleteListing(listingId: bigint): Promise<void>;
    filterListingsByCategory(category: ProductCategory): Promise<Array<Listing>>;
    getAllListings(): Promise<Array<Listing>>;
    getAllProfiles(): Promise<Array<[Principal, UserProfile]>>;
    getBuyerOrderRequests(): Promise<Array<OrderRequest>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getFarmerOrderRequests(): Promise<Array<OrderRequest>>;
    getListingById(id: bigint): Promise<Listing | null>;
    getListingsByFarmer(farmer: Principal): Promise<Array<Listing>>;
    getListingsSorted(sortBy: string): Promise<Array<Listing>>;
    getOrderMessages(orderId: bigint): Promise<Array<OrderMessage>>;
    getOrderRequestsForListing(listingId: bigint): Promise<Array<OrderRequest>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrderRequest(listingId: bigint, quantity: number, note: string, message: string | null): Promise<bigint>;
    publishListing(listingId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchListings(searchTerm: string): Promise<Array<Listing>>;
    unpublishListing(listingId: bigint): Promise<void>;
    updateListing(listingId: bigint, updated: Listing): Promise<void>;
}
