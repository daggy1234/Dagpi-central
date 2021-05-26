import { Request, Response, Router } from "express";
import { db } from "../../db";
import { stripe } from "../../stripe";
import { AppRoute } from "../app-route";
import { sendEmail } from "../../utils";

interface Donation {
  id: number;
  client_id: string;
  charge_id: string;
  amount: number;
  provider: string;
  created_at: Date;
  receipt?: string;
}

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
      }
      console.log(event);
      response.send({ shucks: ":( not a valid event" });
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
        err:
          "Needs both client_id and admin_token set in the url like /admin_token",
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
  async getDataPaypal(request: Request, response: Response): Promise<any> {
    if (!request.params.client_id) {
      response.status(400).send({
        err:
          "Needs both client_id and admin_token set in the url like /admin_token",
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
  async getAllDonations(request: Request, response: Response): Promise<any> {
    if (!request.params.client_id) {
      response.status(400).send({
        err:
          "Needs both client_id and admin_token set in the url like /admin_token",
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
