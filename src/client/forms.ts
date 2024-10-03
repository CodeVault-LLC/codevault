import { z } from "zod";

export const projectCreateSchema = z.object({
  name: z.string(),
  description: z.string(),
  isPublic: z.boolean().optional(),
});

export const projectPricingSettingsSchema = z.object({
  apiKey: z
    .string({
      invalid_type_error: "Please enter an API key",
    })
    .optional(),
});

export const stripeProductSchema = z.object({
  name: z.string().min(3, "Product name should be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description should be at least 10 characters long"),

  // Pricing information with more advanced options
  pricing: z.array(
    z.object({
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
    })
  ),

  // More advanced metadata support, with keys for additional information
  metadata: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),

  // States for handling product visibility, availability, and lifecycle
  highlight: z.boolean().optional().default(false), // Is the product highlighted (e.g., special or featured)?
  featured: z.boolean().optional().default(false), // Is the product well-featured?
  soldout: z.boolean().optional().default(false), // Is the product sold out?
  comingsoon: z.boolean().optional().default(false), // Is the product coming soon?
  waitlist: z.boolean().optional().default(false), // Is there a waitlist for this product?
  hidden: z.boolean().optional().default(false), // Is the product hidden from the public?

  // Limits and restrictions for purchases
  purchaseLimit: z
    .object({
      maxPerUser: z.number().min(1).optional(), // Max items a single user can purchase
      maxOverall: z.number().min(1).optional(), // Max overall purchases allowed for this product
    })
    .optional(),

  // Localization for prices (in case multiple countries are supported)
  localization: z
    .array(
      z.object({
        country: z.string(), // Country code (e.g., "US", "GB")
        currency: z
          .string()
          .length(3, "Currency should be a valid 3-letter ISO code"),
        price: z.number().min(0), // Localized price for the specific country
      })
    )
    .optional(),

  // Tags or categories for better organization
  tags: z.array(z.string()).optional(),

  // Dates for product lifecycle management
  availabilityDates: z
    .object({
      availableFrom: z.date().optional(), // Date the product will be available
      availableUntil: z.date().optional(), // Date when the product will no longer be available
    })
    .optional(),

  // Visibility based on subscription plans (e.g., a premium plan unlocks this product)
  visibilityRestrictions: z
    .array(
      z.object({
        planId: z.string(), // The subscription plan ID that allows access to this product
        required: z.boolean(), // Is this product restricted to certain plans?
      })
    )
    .optional(),

  // Subscription options if product is recurring
  subscriptionOptions: z
    .object({
      autoRenew: z.boolean().optional(), // Does the subscription auto-renew?
      cancellationPolicy: z.string().optional(), // Cancellation policy for subscriptions
      gracePeriod: z.number().min(0).optional(), // Grace period for payment failures (in days)
    })
    .optional(),
});
