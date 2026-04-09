import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data Type Declarations
  public type UserRole = { #farmer; #buyer };
  public type UserProfile = {
    displayName : Text;
    role : UserRole;
    location : Text;
    contact : ?Text;
    bio : Text;
  };

  public type ProductCategory = {
    #vegetables;
    #fruits;
    #grains;
    #livestock;
    #dairy;
    #other : Text;
  };

  public type Listing = {
    id : Nat;
    farmer : Principal;
    title : Text;
    category : ProductCategory;
    unit : Text;
    availableQuantity : Float;
    pricePerUnit : Float;
    harvestDate : ?Text;
    location : Text;
    description : Text;
    createdAt : Time.Time;
    updatedAt : ?Time.Time;
    isPublished : Bool;
  };

  public type OrderRequest = {
    id : Nat;
    listingId : Nat;
    buyer : Principal;
    quantity : Float;
    note : Text;
    message : ?Text;
    status : { #pending; #accepted; #declined };
    createdAt : Time.Time;
    updatedAt : ?Time.Time;
  };

  public type OrderMessage = {
    orderId : Nat;
    author : Principal;
    message : Text;
    timestamp : Time.Time;
  };

  // System State
  var nextListingId = 1;
  var nextOrderId = 1;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let listings = Map.empty<Nat, Listing>();
  let orderRequests = Map.empty<Nat, OrderRequest>();
  let orderMessages = Map.empty<Nat, List.List<OrderMessage>>();

  // Profile Management
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getAllProfiles() : async [(Principal, UserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all profiles");
    };
    userProfiles.toArray();
  };

  // Listing Management
  public shared ({ caller }) func createListing(listing : Listing) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create listings");
    };
    if (listing.title == "" or listing.unit == "" or listing.availableQuantity <= 0 or listing.pricePerUnit <= 0 or listing.location == "" or listing.description == "") {
      Runtime.trap("Missing or invalid required fields");
    };

    let newListing : Listing = {
      listing with
      id = nextListingId;
      farmer = caller;
      createdAt = Time.now();
      updatedAt = null;
      isPublished = false;
    };

    listings.add(nextListingId, newListing);
    nextListingId += 1;
    newListing.id;
  };

  public shared ({ caller }) func updateListing(listingId : Nat, updated : Listing) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update listings");
    };
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?existing) {
        if (existing.farmer != caller) { Runtime.trap("Not the owner") };
        let newListing : Listing = {
          updated with
          id = listingId;
          farmer = caller;
          createdAt = existing.createdAt;
          updatedAt = ?Time.now();
        };
        listings.add(listingId, newListing);
      };
    };
  };

  public shared ({ caller }) func publishListing(listingId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can publish listings");
    };
    updatePublishedStatus(caller, listingId, true);
  };

  public shared ({ caller }) func unpublishListing(listingId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unpublish listings");
    };
    updatePublishedStatus(caller, listingId, false);
  };

  public shared ({ caller }) func deleteListing(listingId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete listings");
    };
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        if (listing.farmer != caller) { Runtime.trap("Not the owner") };
        listings.remove(listingId);
      };
    };
  };

  func updatePublishedStatus(caller : Principal, listingId : Nat, published : Bool) {
    switch (listings.get(listingId)) {
      case (?listing) {
        if (listing.farmer != caller) { Runtime.trap("Not the owner") };
        let updatedListing = {
          listing with
          isPublished = published;
          updatedAt = ?Time.now();
        };
        listings.add(listingId, updatedListing);
      };
      case (null) { Runtime.trap("Listing not found") };
    };
  };

  public query ({ caller }) func getAllListings() : async [Listing] {
    listings.values().toArray();
  };

  public query ({ caller }) func getListingById(id : Nat) : async ?Listing {
    listings.get(id);
  };

  public query ({ caller }) func getListingsByFarmer(farmer : Principal) : async [Listing] {
    listings.toArray().map(func((_, l)) { l }).filter(func(l) { l.farmer == farmer });
  };

  public query ({ caller }) func searchListings(searchTerm : Text) : async [Listing] {
    let lowerTerm = searchTerm.toLower();
    listings.toArray().map(func((_, l)) { l }).filter(
      func(listing) {
        let lowerTitle = listing.title.toLower();
        let lowerDesc = listing.description.toLower();
        lowerTitle.contains(#text lowerTerm) or lowerDesc.contains(#text lowerTerm);
      }
    );
  };

  public query ({ caller }) func filterListingsByCategory(category : ProductCategory) : async [Listing] {
    listings.toArray().map(func((_, l)) { l }).filter(
      func(l) { l.category == category }
    );
  };

  // Orders / Requests
  public shared ({ caller }) func placeOrderRequest(listingId : Nat, quantity : Float, note : Text, message : ?Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place order requests");
    };
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        if (quantity <= 0 or quantity > listing.availableQuantity) {
          Runtime.trap("Invalid quantity");
        };
        let orderRequest : OrderRequest = {
          id = nextOrderId;
          listingId;
          buyer = caller;
          quantity;
          note;
          message;
          status = #pending;
          createdAt = Time.now();
          updatedAt = null;
        };
        orderRequests.add(nextOrderId, orderRequest);
        nextOrderId += 1;
        orderRequest.id;
      };
    };
  };

  public shared ({ caller }) func acceptOrderRequest(orderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept order requests");
    };
    switch (orderRequests.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        switch (listings.get(order.listingId)) {
          case (null) { Runtime.trap("Listing not found") };
          case (?listing) {
            if (listing.farmer != caller) { Runtime.trap("Not the owner of the listing") };
            if (order.status != #pending) {
              Runtime.trap("Order is not in pending status");
            };
            let updatedOrder = {
              order with
              status = #accepted;
              updatedAt = ?Time.now();
            };
            orderRequests.add(orderId, updatedOrder);
          };
        };
      };
    };
  };

  public shared ({ caller }) func declineOrderRequest(orderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can decline order requests");
    };
    switch (orderRequests.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        switch (listings.get(order.listingId)) {
          case (null) { Runtime.trap("Listing not found") };
          case (?listing) {
            if (listing.farmer != caller) { Runtime.trap("Not the owner of the listing") };
            if (order.status != #pending) {
              Runtime.trap("Order is not in pending status");
            };
            let updatedOrder = {
              order with
              status = #declined;
              updatedAt = ?Time.now();
            };
            orderRequests.add(orderId, updatedOrder);
          };
        };
      };
    };
  };

  public query ({ caller }) func getOrderRequestsForListing(listingId : Nat) : async [OrderRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view order requests");
    };
    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        if (listing.farmer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the listing owner can view order requests");
        };
        orderRequests.toArray().map(func((_, o)) { o }).filter(
          func(o) { o.listingId == listingId }
        );
      };
    };
  };

  public query ({ caller }) func getBuyerOrderRequests() : async [OrderRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view order requests");
    };
    orderRequests.toArray().map(func((_, o)) { o }).filter(
      func(o) { o.buyer == caller }
    );
  };

  // Explicitly annotate types for farmerListingIds and hasListingId
  public query ({ caller }) func getFarmerOrderRequests() : async [OrderRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view order requests");
    };

    let farmerListings = listings.values().toArray().filter(
      func(l) { l.farmer == caller }
    );
    let farmerListingIds : [Nat] = farmerListings.map(func(l) { l.id });

    let hasListingId : Nat -> Bool = func(id) {
      let iter = farmerListingIds.values();
      switch (iter.find(func(listingId) { listingId == id })) {
        case (null) { false };
        case (?_) { true };
      };
    };

    orderRequests.toArray().map(func((_, o)) { o }).filter(
      func(o) {
        hasListingId(o.listingId);
      }
    );
  };

  // Asynchronous Order Messages
  public shared ({ caller }) func addOrderMessage(orderId : Nat, message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add order messages");
    };
    switch (orderRequests.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        switch (listings.get(order.listingId)) {
          case (null) { Runtime.trap("Listing not found") };
          case (?listing) {
            if (caller != order.buyer and caller != listing.farmer) {
              Runtime.trap("Unauthorized: Only the buyer or farmer can add messages to this order");
            };
            let newMessage : OrderMessage = {
              orderId;
              author = caller;
              message;
              timestamp = Time.now();
            };
            let existingMessages = switch (orderMessages.get(orderId)) {
              case (null) { List.empty<OrderMessage>() };
              case (?msgs) { msgs };
            };
            existingMessages.add(newMessage);
            orderMessages.add(orderId, existingMessages);
          };
        };
      };
    };
  };

  public query ({ caller }) func getOrderMessages(orderId : Nat) : async [OrderMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view order messages");
    };
    switch (orderRequests.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        switch (listings.get(order.listingId)) {
          case (null) { Runtime.trap("Listing not found") };
          case (?listing) {
            if (caller != order.buyer and caller != listing.farmer and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Only the buyer or farmer can view messages for this order");
            };
            switch (orderMessages.get(orderId)) {
              case (null) { [] };
              case (?messages) {
                messages.reverse().toArray();
              };
            };
          };
        };
      };
    };
  };

  // Marketplace Sorting
  module Listing {
    public func compareByPriceAsc(a : Listing, b : Listing) : Order.Order {
      Float.compare(a.pricePerUnit, b.pricePerUnit);
    };
    public func compareByPriceDesc(a : Listing, b : Listing) : Order.Order {
      Float.compare(b.pricePerUnit, a.pricePerUnit);
    };
    public func compareByCreatedAt(a : Listing, b : Listing) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
  };

  public query ({ caller }) func getListingsSorted(sortBy : Text) : async [Listing] {
    let allListings = listings.values().toArray();
    switch (sortBy) {
      case ("price_asc") {
        allListings.sort(Listing.compareByPriceAsc);
      };
      case ("price_desc") {
        allListings.sort(Listing.compareByPriceDesc);
      };
      case ("newest") {
        allListings.sort(Listing.compareByCreatedAt);
      };
      case (_) { allListings }; // default
    };
  };
};
