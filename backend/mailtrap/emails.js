import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: `
        <h1>Verify Your Email</h1>
        <p>Your verification code is: <strong>${verificationToken}</strong></p>
        <p>This code will expire in 24 hours.</p>
      `,
      category: "Email Verification",
    });

    console.log("Verification email sent successfully", response);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Welcome to Auth App!",
      html: `
        <h1>Welcome, ${name}!</h1>
        <p>Your email has been verified successfully.</p>
        <p>Thank you for joining us.</p>
      `,
      category: "Welcome Email",
    });

    console.log("Welcome email sent successfully", response);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset your password",
      html: `
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetURL}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `,
      category: "Password Reset",
    });

    console.log("Password reset email sent successfully", response);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error(`Error sending password reset email: ${error}`);
  }
};

export const sendResetSuccessEmail = async (email) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Password Reset Successful",
      html: `
        <h1>Password Reset Successful</h1>
        <p>Your password has been reset successfully.</p>
        <p>If you did not initiate this request, please contact support immediately.</p>
      `,
      category: "Password Reset",
    });

    console.log("Password reset success email sent", response);
  } catch (error) {
    console.error("Error sending password reset success email:", error);
    throw new Error(`Error sending password reset success email: ${error}`);
  }
};
