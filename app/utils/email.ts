import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY,
  region: "us-east-2",
});

const ses = new AWS.SES({ apiVersion: "2010-12-01" });

function sendEmail(to: string, subject: string, message: string): boolean {
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: message,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: "notifier@noreply.mail.dagpi.xyz",
  };

  ses.sendEmail(params, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      return false;
    } else {
      console.log("Email sent.", data);
    }
  });
  return true;
}

function sendEmailTemplate(
  to: string,
  data: string,
  template: string
): boolean {
  const params = {
    Template: template,
    Destination: {
      ToAddresses: [to],
    },
    TemplateData: data,
    Source: "notifier@noreply.mail.dagpi.xyz",
  };

  ses.sendTemplatedEmail(params, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      return false;
    } else {
      console.log("Email sent.", data);
    }
  });
  return true;
}

export { sendEmail, sendEmailTemplate };
