import { Request, Response, Router } from "express";
import { db } from "../../db";
import { http } from "../../http";
import { stripe } from "../../stripe";
import { AppRoute } from "../app-route";
import { sendEmail, makePremium, ExpireSubscriptions } from "../../utils";

interface Donation {
  id: number;
  client_id: string;
  charge_id: string;
  amount: number;
  provider: string;
  created_at: Date;
  receipt?: string;
}

const price_rl_mapping = {};

price_rl_mapping[process.env.BASE_PREMIUM_PROD] = 60;
price_rl_mapping[process.env.MID_PREMIUM_PROD] = 90;
price_rl_mapping[process.env.HIG_PREMIUM_PROD] = 120;

function sortByProperty() {
  return function (a: Donation, b: Donation): number {
    if (a.created_at > b.created_at) return -1;
    else if (a.created_at < b.created_at) return 1;

    return 0;
  };
}

export class PaymentRouter implements AppRoute {
  public route = "/payments";
  public router: Router = Router();

  constructor() {
    this.router.post("/stripe", this.StripeWebhook);
    this.router.post("/paypal", this.PaypalPost);
    this.router.get("/stripe_donations/:client_id", this.getDataStripe);
    this.router.get("/paypal_donations/:client_id", this.getDataPaypal);
    this.router.get("/donations/:client_id", this.getAllDonations);
    this.router.get("/subscription/:client_id", this.getSubscriptionData);
    this.router.get("/expire", this.ExpireSubscriptionsApi);
  }

  public async StripeWebhook(req: Request, response: Response): Promise<any> {
    const signature = req.headers["stripe-signature"];
    try {
      const event = stripe
        .get()
        .webhooks.constructEvent(
          req.rawBody,
          signature,
          process.env.STRIPE_WEBHOOK
        );
      console.log(event);
      if (event.type == "charge.succeeded") {
        const obj: any = event.data.object;
        if (obj.metadata.donate) {
          const payload = {
            client_id: obj.metadata.client_id,
            email: obj.metadata.email,
            user_id: obj.metadata.id,
            receipt: obj.receipt_url,
            created: event.created,
            charge_id: obj.id,
            customer: obj.customer ? obj.customer : "Nan",
            amount: parseInt((obj.amount / 100).toString()),
          };
          await db.db().stripe_donation.create({
            data: {
              client_id: payload.client_id,
              charge_id: payload.charge_id,
              receipt: payload.receipt,
              amount: payload.amount,
              customer_id: payload.customer,
            },
          });
          sendEmail(
            payload.email,
            "Thank you for you donation!",
            "This email is a WIP!\nBut We want to thank you for your donation. Every penny is crucial to help dagpi run!\nAs a token of gratitude you will be getting a Donator role!\n\nSincerely,\nDaggy"
          );
          console.log(event);
          response.send(payload);
          return;
        }
      } else if (event.type == "customer.subscription.created") {
        const payload_data: any = event.data.object;
        const cid = payload_data.metadata.client_id;
        const customer_id = payload_data.customer;
        const u = await db.db().stripe_customer.upsert({
          where: { client_id: cid },
          update: { customer_id: customer_id },
          create: {
            customer_id: customer_id,
            client_id: cid,
          },
        });
        const prev_subs = await db.db().stripe_subscription.findUnique({
          where: {
            customer_id: customer_id,
          },
        });
        if (prev_subs) {
          console.log("has subscription moment");
          sendEmail(
            payload_data.metadata.email,
            "Accidental Second subscription",
            `Dear ${payload_data.metadata.name}\nYou seem to have purchased dagpi premium, despite aldready having a subscription. Please cancel this one, and reactivate an old subscription. I wuld recommend joining discord, as this subscription won't be valid.\n Discord: https://server.daggy.tech`
          );
          response.send({ fine: "Not fine" });
        } else {
          const dis_us = await db.db().user.findUnique({
            where: {
              client_id: cid,
            },
          });
          if (dis_us) {
            const rl = parseInt(payload_data.metadata.rl);
            const mk_req = await makePremium(dis_us.userid, rl);
            if (mk_req.status) {
              const out = await db.db().stripe_subscription.create({
                data: {
                  customer_id: customer_id,
                  subscription_id: payload_data.id,
                  price_id: payload_data.plan.id,
                  subscription_start: new Date(
                    payload_data.current_period_start * 1000
                  ),
                  subscription_end: new Date(
                    (payload_data.current_period_end + 172800) * 1000
                  ),
                  cancelled: false,
                  active: true,
                  ratelimit: rl,
                },
              });
              console.log(out);
              sendEmail(
                payload_data.metadata.email,
                "Welcome to premium",
                "Congratulations and welcome to the dagpi premium family!"
              );
              response.send({ nice: "gg" });
            } else {
              console.log(`Error app;ying premium. Status ${mk_req.status}`);
              sendEmail(
                payload_data.metadata.email,
                "Error applying premium",
                "You do not have a valid dagpi user profile. Join the discord server at https://server.daggy.tech for support"
              );
              response.send({ nice: "noooooo" });
            }
          } else {
            sendEmail(
              payload_data.metadata.email,
              "Cannot apply premium",
              "You do not have a valid dagpi user profile. Join the discord server at https://server.daggy.tech for support"
            );
            response.send({ nice: "noooooo" });
          }
        }
      } else if (event.type == "customer.subscription.updated") {
        const event_data: any = event.data;
        const pln = event_data.previous_attributes.plan;
        if (event_data.previous_attributes.cancel_at_period_end == false) {
          console.log("cancellation");
          await db.db().stripe_subscription.update({
            data: {
              cancelled: true,
            },
            where: {
              customer_id: event_data.object.customer,
            },
          });
          response.send({ nice: "gg" });
        } else if (
          event_data.previous_attributes.cancel_at_period_end == true
        ) {
          console.log("renewal");
          await db.db().stripe_subscription.update({
            data: {
              cancelled: false,
            },
            where: {
              customer_id: event_data.object.customer,
            },
          });
          response.send({ nice: "gg" });
        } else if (pln ? (pln.id ? true : false) : false) {
          console.log("upgrading");
          sendEmail(
            event_data.object.customer_email,
            "Premium Upgrade",
            "Congratulations on upgrading dagpi premium! Your success makes us smile!"
          );
          const rl = price_rl_mapping[event_data.object.plan.id];
          console.log(`email + ${rl}`);
          const cid = event_data.object.metadata.client_id;
          const dis_us = await db.db().user.findUnique({
            where: {
              client_id: cid,
            },
          });
          console.log(dis_us);
          if (dis_us) {
            const dbres = await db.db().stripe_subscription.update({
              data: {
                price_id: event_data.object.plan.id,
                ratelimit: rl,
              },
              where: {
                customer_id: event_data.object.customer,
              },
            });
            console.log(dbres);
            await makePremium(dis_us.userid, rl);
            response.send({ nice: "gg" });
          } else {
            sendEmail(
              event_data.object.customer_email,
              "Premium Upgrade Error",
              "Error code: no user found. Please report at https://server.daggy.tech"
            );
            response.send({ nice: "gg" });
          }
        } else {
          console.log(event_data.previous_attributes);
          response.send({ nice: "gg" });
        }
      } else if (event.type == "invoice.upcoming") {
        const event_data: any = event.data.object;
        sendEmail(
          event_data.customer_email,
          "Dagpi Subscription to be renewed soon!",
          "Your dagpi premium subscription will b renwed soon. Ensure payment info is correcamundo!"
        );
        response.send({ gg: "nice" });
      } else if (event.type == "invoice.paid") {
        const event_data: any = event.data.object;
        await db.db().stripe_subscription.update({
          data: {
            active: true,
            subscription_start: new Date(
              event_data.current_period_start * 1000
            ),
            subscription_end: new Date(
              (event_data.current_period_end + 172800) * 1000
            ),
          },
          where: {
            subscription_id: event_data.subscription,
          },
        });
        sendEmail(
          event_data.customer_email,
          "Recieved Payment",
          "Your subscription has been payed for and renewed!"
        );
        response.send({ nice: "gg" });
      } else if (event.type == "invoice.payment_failed") {
        console.log("payment failure");
        const event_data: any = event.data.object;
        sendEmail(
          event_data.customer_email,
          "Payment Failed",
          "Repeated payment failures may lead to your subscription getting terminated. You have about 2 days"
        );
      } else {
        console.log(event);
        response.send({ shucks: ":( not a valid event" });
      }
    } catch (err) {
      console.log(err);
      response.status(500).send({
        error: err.toString(),
      });
    }
  }

  public async PaypalPost(req: Request, response: Response): Promise<any> {
    if (!req.body) {
      response.status(400).send({ msg: "There is no form body" });
      return;
    }
    try {
      const { client_id, amount, customer_id, capture_id, email } = req.body;
      const donation = await db.db().paypal_donation.create({
        data: {
          client_id: client_id,
          amount: amount,
          charge_id: capture_id,
          customer_id: customer_id,
        },
      });
      sendEmail(
        email,
        "Thank you for you donation!",
        "This email is a WIP!\nBut We want to thank you for your donation. Every penny is crucial to help dagpi run!\nAs a token of gratitude you will be getting a Donator role!\n\nSincerely,\nDaggy"
      );
      response.send(donation);
      return;
    } catch (err) {
      response.status(500).send({
        status: "fail",
        message: err.toString(),
      });
    }
  }

  async getDataStripe(request: Request, response: Response): Promise<any> {
    if (!request.params.client_id) {
      response.status(400).send({
        err: "Needs both client_id and admin_token set in the url like /admin_token",
      });
    } else {
      try {
        const res = await db.db().stripe_donation.findMany({
          where: {
            client_id: request.params.client_id,
          },
        });
        response.send({ data: res });
      } catch (e) {
        response.status(500).send({
          err: e.toString(),
        });
      }
    }
  }

  async ExpireSubscriptionsApi(
    request: Request,
    response: Response
  ): Promise<any> {
    const out = await ExpireSubscriptions();
    response.send({
      status: out,
    });
  }

  async getDataPaypal(request: Request, response: Response): Promise<any> {
    if (!request.params.client_id) {
      response.status(400).send({
        err: "Needs both client_id and admin_token set in the url like /admin_token",
      });
    } else {
      try {
        const res = await db.db().paypal_donation.findMany({
          where: {
            client_id: request.params.client_id,
          },
        });
        response.send({ data: res });
      } catch (e) {
        response.status(500).send({
          err: e.toString(),
        });
      }
    }
  }

  async getSubscriptionData(
    request: Request,
    response: Response
  ): Promise<any> {
    if (!request.params.client_id) {
      response.status(400).send({
        err: "Need client_id to get info",
      });
    } else {
      try {
        const customer = await db.db().stripe_customer.findUnique({
          where: {
            client_id: request.params.client_id,
          },
        });
        console.log(customer);
        if (customer) {
          const subscription = await db.db().stripe_subscription.findUnique({
            where: {
              customer_id: customer.customer_id,
            },
          });
          console.log(subscription);
          response.send({ customer: customer, subscription: subscription });
        } else {
          response.send({ customer: null, subscriptiom: null });
        }
      } catch (e) {
        response.status(500).send({
          err: e.toString(),
        });
      }
    }
  }

  async getAllDonations(request: Request, response: Response): Promise<any> {
    if (!request.params.client_id) {
      response.status(400).send({
        err: "Needs both client_id and admin_token set in the url like /admin_token",
      });
    } else {
      try {
        const donations: Donation[] = [];
        const stripe_donations = await db.db().stripe_donation.findMany({
          where: {
            client_id: request.params.client_id,
          },
        });
        const paypal_donations = await db.db().paypal_donation.findMany({
          where: {
            client_id: request.params.client_id,
          },
        });
        stripe_donations.map((v) =>
          donations.push({
            ...v,
            provider: "stripe",
          })
        );
        paypal_donations.map((v) =>
          donations.push({
            ...v,
            provider: "paypal",
          })
        );
        donations.sort(sortByProperty());
        response.send({ data: donations });
      } catch (e) {
        response.status(500).send({
          err: e.toString(),
        });
      }
    }
  }
}
