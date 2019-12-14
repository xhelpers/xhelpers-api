import handlebars from "handlebars";
import nodemailer from "nodemailer";
const sgMail = require("@sendgrid/mail");
const fs = require("fs");

export default class sendMail {
  constructor() {}

  static async sendUsingSendGrid(
    emailOptions: {
      to: string;
      from: string;
      subject: string;
      text: string;
      html: string;
    },
    templateName: string,
    data: any
  ) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    await this.readHTMLFile(
      `${__dirname}/../templates/email/${templateName}.html`,
      (err: any, html: any) => {
        const template = handlebars.compile(html);
        const htmlToSend = template(data);
        emailOptions.html = htmlToSend;
        sgMail.send(emailOptions);
      }
    );
  }

  static readHTMLFile = (path: any, callback: any) => {
    fs.readFile(path, { encoding: "utf-8" }, (err: any, html: any) => {
      if (err) {
        throw err;
      } else {
        callback(null, html);
      }
    });
  };

  static async sendMail(
    emailOptions: {
      from: string;
      to: string;
      subject: string;
      html: any;
    },
    templateName: string,
    data: any
  ) {
    const options: any = {
      host: process.env.STMP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_ENABLE_SSL,
      tls: { rejectUnauthorized: false }
    };

    if (process.env.SMTP_PASSWORD !== "") {
      options.auth = {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      };
    }

    const transporter = nodemailer.createTransport(options);

    await this.readHTMLFile(
      `${__dirname}/../templates/email/${templateName}.html`,
      (err: any, html: any) => {
        const template = handlebars.compile(html);
        const htmlToSend = template(data);
        emailOptions.html = htmlToSend;
        transporter.sendMail(emailOptions, (error: any, response: any) => {
          if (error) {
            console.log("📭 error", error);
            response(error);
          }
        });
      }
    );
  }
}
