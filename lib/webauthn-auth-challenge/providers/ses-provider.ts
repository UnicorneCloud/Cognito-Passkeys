import {
  SESClient,
  SendEmailCommandInput,
  SendEmailCommand,
} from "@aws-sdk/client-ses";

const emailSenderFromEmail = "clement.lebiez@unicorne.cloud";

const sesClient = new SESClient({});

export class AwsSesEmailSender {
  static async sendActivationEmail(
    recipient: string,
    url: string
  ): Promise<void> {
    const html = `<html><body><p>Activate your account by clicking on the following link: <a href="${url}">activate my account</a></body></html>`;
    const text = `Activate your account by clicking on the following link: ${url}`;
    const params: SendEmailCommandInput = {
      Destination: {
        ToAddresses: [recipient],
      },
      Source: emailSenderFromEmail,
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: html,
          },
          Text: {
            Charset: "UTF-8",
            Data: text,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Activate your account on Unicorne",
        },
      },
    };
    console.log("sendEmail params", params);

    try {
      const data = await sesClient.send(new SendEmailCommand(params));
      console.log("sendEmail Success", data);
    } catch (error) {
      console.error("sendEmail Error", error);
      throw error;
    }
  }
}
