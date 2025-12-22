import { Resend } from "resend";

// Initialize Resend client
const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured. Please set RESEND_API_KEY in your environment variables.");
  }
  return new Resend(process.env.RESEND_API_KEY);
};

// Helper function to get from email address
const getFromEmail = () => {
  return process.env.RESEND_FROM_EMAIL || "Hardware Sanitary App <onboarding@resend.dev>";
};

// Log email configuration on startup (only once)
let emailConfigLogged = false;
const logEmailConfig = () => {
  if (!emailConfigLogged) {
    console.log("📧 Email Configuration (Resend Only):");
    console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? "***SET***" : "NOT SET"}`);
    console.log(`   RESEND_FROM_EMAIL: ${getFromEmail()}`);
    emailConfigLogged = true;
  }
};

// Log config when module loads
logEmailConfig();

// Send OTP email (for password reset)
export const sendOTPEmail = async (email, otp) => {
  console.log(`📧 sendOTPEmail called for ${email} with OTP: ${otp}`);
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY not configured");
      throw new Error("Email service not configured. Please set RESEND_API_KEY in your environment variables.");
    }

    console.log(`✅ Using Resend for email sending`);
    const resend = getResendClient();
    const fromEmail = getFromEmail();
    
    console.log(`📧 Resend email details:`);
    console.log(`   From: ${fromEmail}`);
    console.log(`   To: ${email}`);
    console.log(`   RESEND_FROM_EMAIL env: ${process.env.RESEND_FROM_EMAIL || 'NOT SET (using default)'}`);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Password Reset OTP - Hardware Sanitary App",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              You have requested to reset your password. Use the OTP code below to verify your identity:
            </p>
            <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Your OTP Code:</p>
              <h1 style="color: #4CAF50; font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: bold;">${otp}</h1>
            </div>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              <strong>Important:</strong>
            </p>
            <ul style="color: #666; font-size: 14px; line-height: 1.8; padding-left: 20px;">
              <li>This OTP is valid for <strong>10 minutes</strong> only</li>
              <li>Do not share this OTP with anyone</li>
              <li>If you did not request this password reset, please ignore this email</li>
            </ul>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      throw new Error(error.message || "Failed to send email via Resend");
    }

    console.log(`✅ OTP email sent successfully via Resend to ${email}`);
    console.log(`📧 Resend email ID: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw error;
  }
};

// Send Signup OTP email
export const sendSignupOTPEmail = async (email, otp) => {
  console.log(`📧 sendSignupOTPEmail called for ${email} with OTP: ${otp}`);
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY not configured");
      throw new Error("Email service not configured. Please set RESEND_API_KEY in your environment variables.");
    }

    console.log(`✅ Using Resend for email sending`);
    const resend = getResendClient();
    const fromEmail = getFromEmail();
    
    console.log(`📧 Resend email details:`);
    console.log(`   From: ${fromEmail}`);
    console.log(`   To: ${email}`);
    console.log(`   RESEND_FROM_EMAIL env: ${process.env.RESEND_FROM_EMAIL || 'NOT SET (using default)'}`);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Email Verification OTP - Hardware Sanitary App",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome! Verify Your Email</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for signing up! Please verify your email address by entering the OTP code below:
            </p>
            <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Your Verification Code:</p>
              <h1 style="color: #4CAF50; font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: bold;">${otp}</h1>
            </div>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              <strong>Important:</strong>
            </p>
            <ul style="color: #666; font-size: 14px; line-height: 1.8; padding-left: 20px;">
              <li>This OTP is valid for <strong>10 minutes</strong> only</li>
              <li>Do not share this OTP with anyone</li>
              <li>If you did not sign up for this account, please ignore this email</li>
            </ul>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      throw new Error(error.message || "Failed to send email via Resend");
    }

    console.log(`✅ Signup OTP email sent successfully via Resend to ${email}`);
    console.log(`📧 Resend email ID: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("❌ Error sending signup OTP email:", error);
    throw error;
  }
};

// Send inquiry notification to admin
export const sendInquiryNotificationToAdmin = async (inquiryData) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY not configured");
      throw new Error("Email service not configured. Please set RESEND_API_KEY in your environment variables.");
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      throw new Error("ADMIN_EMAIL is not configured. Please set ADMIN_EMAIL in your environment variables.");
    }

    console.log(`✅ Using Resend for email sending`);
    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: adminEmail,
      subject: `New Product Inquiry - ${inquiryData.productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">New Product Inquiry Received</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              A customer has submitted a product inquiry. Please check the admin panel to review and update stock availability.
            </p>
            <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #333; margin-top: 0;">Inquiry Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Customer:</td>
                  <td style="padding: 8px 0; color: #333;">${inquiryData.username} (${inquiryData.userEmail})</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Product:</td>
                  <td style="padding: 8px 0; color: #333;">${inquiryData.productName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Brand:</td>
                  <td style="padding: 8px 0; color: #333;">${inquiryData.brandName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Category:</td>
                  <td style="padding: 8px 0; color: #333;">${inquiryData.categoryName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Quantity:</td>
                  <td style="padding: 8px 0; color: #333;">${inquiryData.quantity}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Unit Price:</td>
                  <td style="padding: 8px 0; color: #333;">₹${inquiryData.price.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Total Amount:</td>
                  <td style="padding: 8px 0; color: #333; font-size: 18px; font-weight: bold;">₹${inquiryData.totalAmount.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Inquiry ID:</td>
                  <td style="padding: 8px 0; color: #333; font-family: monospace;">${inquiryData.inquiryId}</td>
                </tr>
              </table>
            </div>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              <strong>Action Required:</strong> Please check the stock availability and update the inquiry status in the admin panel.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      throw new Error(error.message || "Failed to send email via Resend");
    }

    console.log(`✅ Inquiry notification email sent successfully via Resend to admin: ${adminEmail}`);
    console.log(`📧 Resend email ID: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("❌ Error sending inquiry email to admin:", error);
    throw error;
  }
};

// Send inquiry status update to user
export const sendInquiryStatusToUser = async (statusData) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY not configured");
      throw new Error("Email service not configured. Please set RESEND_API_KEY in your environment variables.");
    }

    console.log(`✅ Using Resend for email sending`);
    const resend = getResendClient();

    const statusMessages = {
      in_stock: {
        title: "Product Available!",
        message: "Great news! The product you inquired about is now in stock.",
        color: "#4CAF50"
      },
      out_of_stock: {
        title: "Product Out of Stock",
        message: "We're sorry, but the product is currently out of stock. We'll notify you when it's available.",
        color: "#f44336"
      },
      available_soon: {
        title: "Product Available Soon",
        message: "The product will be available soon. We'll keep you updated.",
        color: "#FF9800"
      },
      cancelled: {
        title: "Inquiry Cancelled",
        message: "Your inquiry has been cancelled.",
        color: "#757575"
      }
    };

    const statusInfo = statusMessages[statusData.status] || {
      title: "Inquiry Status Updated",
      message: "Your inquiry status has been updated.",
      color: "#2196F3"
    };

    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: statusData.userEmail,
      subject: `${statusInfo.title} - ${statusData.productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: ${statusInfo.color}; margin-bottom: 20px;">${statusInfo.title}</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Hello ${statusData.username},
            </p>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              ${statusInfo.message}
            </p>
            <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #333; margin-top: 0;">Product Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Product:</td>
                  <td style="padding: 8px 0; color: #333;">${statusData.productName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Quantity:</td>
                  <td style="padding: 8px 0; color: #333;">${statusData.quantity}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Unit Price:</td>
                  <td style="padding: 8px 0; color: #333;">₹${statusData.price.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Total Amount:</td>
                  <td style="padding: 8px 0; color: #333; font-size: 18px; font-weight: bold;">₹${statusData.totalAmount.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Status:</td>
                  <td style="padding: 8px 0; color: ${statusInfo.color}; font-weight: bold; text-transform: capitalize;">${statusData.status.replace('_', ' ')}</td>
                </tr>
              </table>
            </div>
            ${statusData.adminNotes ? `
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
              <p style="color: #333; font-weight: bold; margin: 0 0 8px 0;">Admin Notes:</p>
              <p style="color: #666; margin: 0; line-height: 1.6;">${statusData.adminNotes}</p>
            </div>
            ` : ''}
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              You can view all your inquiries and notifications in your account dashboard.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      throw new Error(error.message || "Failed to send email via Resend");
    }

    console.log(`✅ Inquiry status email sent successfully via Resend to user: ${statusData.userEmail}`);
    console.log(`📧 Resend email ID: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("❌ Error sending inquiry status email to user:", error);
    throw error;
  }
};

// Verify email configuration (Resend only)
export const verifyEmailConfig = async () => {
  try {
    if (!process.env.RESEND_API_KEY) {
      return { configured: false, message: "RESEND_API_KEY is not set in environment variables" };
    }

    // Try to create Resend client to verify API key format
    try {
      const resend = getResendClient();
      // Resend doesn't have a verify method, so we'll just check if the client was created
      return { configured: true, message: "Resend email service is ready" };
    } catch (error) {
      return { configured: false, message: `Resend configuration error: ${error.message}` };
    }
  } catch (error) {
    return { configured: false, message: `Email configuration error: ${error.message}` };
  }
};
