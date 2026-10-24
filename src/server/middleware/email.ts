import { createTransport } from "nodemailer";
import logging from "../db/logging.js";

const NAMESPACE = "Email";

const transporter = createTransport({
	host: "smtp-relay.brevo.com",
	port: 587,
	auth: {
		user: "bec717001@smtp-brevo.com",
		pass: "xsmtpsib-d265429c35a5123807832cad57bc7adeabc76269bba44e7b5a1b49645c7c3622-9I8rYoMfprWvgNMq",
	},
});

export async function sendVerificationCode(
	toEmail: string,
	verificationCode: string,
): Promise<void> {
	transporter.sendMail(
		{
			from: `Cinema E-Booking System <rclaw0341@gmail.com>`,
			to: `<${toEmail}`,
			subject: "Verify your email",
			html: `<p>Your verification code is <strong>${verificationCode}</strong>. This code will be valid for 10 minutes.</p>`,
		},
		(error, info) => {
			if (error) {
				logging.error(NAMESPACE, "Email failed to send.", error);
				return error;
			}
			logging.info(NAMESPACE, "Email sent successfully.", info);
		},
	);
}

export async function sendPasswordResetCode(
	toEmail: string,
	verificationCode: string,
): Promise<void> {
	transporter.sendMail(
		{
			from: `Cinema E-Booking System <rclaw0341@gmail.com>`,
			to: `<${toEmail}`,
			subject: "Password reset",
			html: `<p>You requested to reset your password. Your verification code is <strong>${verificationCode}</strong>. This code will be valid for 10 minutes.<br>If you did not request a password reset, ignore this email.</p>`,
		},
		(error, info) => {
			if (error) {
				logging.error(NAMESPACE, "Email failed to send.", error);
				return error;
			}
			logging.info(NAMESPACE, "Email sent successfully.", info);
		},
	);
}

export async function sendProfileChangedEmail(
        toEmail: string,
        what: string,
): Promise<void> {
        await transporter.sendMail({
                from: "noreply@cinemaebooking.com",
                to: toEmail,
                subject: "Your profile was updated",
                html: `<p>Your ${what} on Cinema E-Booking was changed on ${new Date().toLocaleString()}.</p>
        <p>If you did not make this change, please reset your password right away.</p>`,
        });
}