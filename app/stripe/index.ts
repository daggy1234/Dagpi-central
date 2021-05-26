import Stripe from "stripe";

export class StripeWrapper {
  private stripe: Stripe;

  createInstance() {
    this.stripe = new Stripe(process.env.STRIPE_KEY, {
      apiVersion: "2020-08-27",
    });
  }

  public get(): Stripe {
    return this.stripe;
  }
}

export const stripe = new StripeWrapper();
