import { z } from "zod";

export const stripeProductAvaliableDatesSchema = z.object({
  availableFrom: z.date().optional(), // Date the product will be available
  availableUntil: z.date().optional(), // Date when the product will no longer be available
});

export const visibilityRestrictionSchema = z.object({
  planId: z.string(), // The subscription plan ID that allows access to this product
  required: z.boolean(), // Is this product restricted to certain plans?
});

export const purchaseLimitSchema = z.object({
  maxPerUser: z.number().min(1).optional(), // Max items a single user can purchase
  maxOverall: z.number().min(1).optional(), // Max overall purchases allowed for this product
});

export const subscriptionOptionsSchema = z.object({
  autoRenew: z.boolean().optional(), // Does the subscription auto-renew?
  cancellationPolicy: z.string().optional(), // Cancellation policy for subscriptions
  gracePeriod: z.number().min(0).optional(), // Grace period for payment failures (in days)
});

export const localizationSchema = z.object({
  country: z.string().max(2), // 2-letter ISO country code
  currency: z
    .string()
    .length(3, "Currency should be a valid 3-letter ISO code"),
  price: z.number().min(0).max(999999.99), // Price for the product in this country
});

export const pricingSchema = z.object({
  type: z.enum(["one-time", "recurring"]),
  amount: z.number().min(0, "Amount must be a positive number").optional(),
  currency: z
    .string()
    .length(3, "Currency should be a valid 3-letter ISO code")
    .optional(),
  interval: z.enum(["day", "week", "month", "year"]).optional(),

  // Additional advanced pricing features
  discount: z
    .object({
      type: z.enum(["percentage", "fixed"]).optional(),
      value: z.number().min(0).optional(), // Discount value (percentage or fixed amount)
    })
    .optional(),
  setupFee: z.number().min(0).optional(), // Optional setup fee for recurring products
  trialPeriod: z.number().min(0).optional(), // Optional trial period in days
});

export const stripeProductSchema = z.object({
  name: z.string().min(3, "Product name should be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description should be at least 10 characters long"),

  // More advanced metadata support, with keys for additional information
  metadata: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),

  // States for handling product visibility, availability, and lifecycle
  highlight: z.boolean().default(false).optional(),
  featured: z.boolean().default(false).optional(),
  soldout: z.boolean().default(false).optional(),
  comingsoon: z.boolean().default(false).optional(),
  waitlist: z.boolean().default(false).optional(),
  hidden: z.boolean().default(false).optional(),

  // Tags or categories for better organization
  tags: z.array(z.string()).optional(),
});

export const fullStripeProductSchema = z.object({
  ...stripeProductSchema.shape,

  // Pricing information with more advanced options
  pricing: z.array(pricingSchema),
  // Limits and restrictions for purchases
  purchaseLimit: purchaseLimitSchema.optional(),

  // Localization for prices (in case multiple countries are supported)
  localization: z.array(localizationSchema).optional(),

  // Dates for product lifecycle management
  availabilityDates: stripeProductAvaliableDatesSchema.optional(),

  // Visibility based on subscription plans (e.g., a premium plan unlocks this product)
  visibilityRestrictions: visibilityRestrictionSchema.optional(),

  // Subscription options if product is recurring
  subscriptionOptions: subscriptionOptionsSchema.optional(),
});
