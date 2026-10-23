import { createTransport } from "nodemailer";

const transporter = createTransport({
	host: "smtp-relay.brevo.com",
	port: 587,
	auth: {
		user: "bec717001@smtp-brevo.com",
		pass: "",
	},
});

export async function sendVerificationCode(
	toEmail: string,
	verificationCode: string,
): Promise<void> {
	await transporter.sendMail({
		from: "noreply@cinemaebooking.com",
		to: toEmail,
		subject: "Verify your email",
		html: `<p>Your verification code is <strong>${verificationCode}</strong>. This code will be valid for 10 minutes.</p>`,
	});
}

export async function sendPasswordResetCode(
	toEmail: string,
	verificationCode: string,
): Promise<void> {
	await transporter.sendMail({
		from: "noreply@cinemaebooking.com",
		to: toEmail,
		subject: "Password reset",
		html: `<p>You requested to reset your password. Your verification code is <strong>${verificationCode}</strong>. This code will be valid for 10 minutes.<br>
        If you did not request a password reset, ignore this email.</p>`,
	});
}
