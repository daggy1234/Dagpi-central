import { db } from "../db";
import { sendEmail } from "./email";
import makePremium from "./make_premium";

export default async function ExpireSubscriptions(): Promise<boolean> {
  try {
    const res = await db.db().stripe_subscription.findMany({
      where: {
        subscription_end: {
          lt: new Date(),
        },
      },
    });
    for (const sub of res) {
      const email = await db.db().stripe_customer.findUnique({
        where: {
          customer_id: sub.customer_id,
        },
      });
      if (email) {
        const email_id = await db.db().user.findUnique({
          where: {
            client_id: email.client_id,
          },
        });
        if (email_id) {
          await makePremium(email_id.userid, 45);
          sendEmail(
            email_id.email,
            "Dagpi Premium Cancelled and Deleted",
            "Your dagpi premium subscription payment deadline was exceeded with no renewal. We\ve cancelled your premium."
          );
          const out_d = await db.db().stripe_subscription.update({
            where: {
              subscription_id: sub.subscription_id,
            },
            data: {
              active: false,
              cancelled: false,
            },
          });
          console.log(
            `${out_d.customer_id} has expired subscription ${email_id.client_id} [${out_d.subscription_id}]`
          );
        } else {
          sendEmail(
            process.env.ADMIN_EMAIL,
            `Dagpi Premium Error FOR ${email.customer_id}`,
            `Manually Resolve ID: ${email.id}, client: ${email.client_id} for ${sub.subscription_id}`
          );
          console.log(
            `${email.id} unable to expire client: ${email.client_id} for ${sub.subscription_id}`
          );
        }
      } else {
        sendEmail(
          process.env.ADMIN_EMAIL,
          `Dagpi Premium Error FOR ${sub.customer_id}`,
          `Manually Resolve  sub ${sub.subscription_id}`
        );
        console.log(`NO CUSTOMER ${sub.subscription_id} or ${sub.customer_id}`);
      }
    }
    console.log("Processed All Subscriptions");
    return true;
  } catch (e) {
    console.log(`WTF Error ${e}`);
    return false;
  }
}
