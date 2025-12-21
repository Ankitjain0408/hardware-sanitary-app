import nodemailer from "nodemailer";

// Create reusable transporter object using SMTP transport
// Always create fresh transporter to ensure latest env vars are used
const createTransporter = () => {
  // Log email config (without password) for debugging - only log once per server start
  if (!createTransporter._logged) {
    console.log("📧 Email Configuration:");
    console.log(`   Host: ${process.env.EMAIL_HOST || "smtp.gmail.com"}`);
    console.log(`   Port: ${process.env.EMAIL_PORT || "587"}`);
    console.log(`   User: ${process.env.EMAIL_USER || "NOT SET"}`);
    console.log(`   Pass: ${process.env.EMAIL_PASS ? "***SET***" : "NOT SET"}`);
    createTransporter._logged = true;
  }
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App password for Gmail
    },
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file");
      throw new Error("Email service not configured");
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Hardware Sanitary App" <${process.env.EMAIL_USER}>`,
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
      text: `
Password Reset Request

You have requested to reset your password. Use the OTP code below to verify your identity:

Your OTP Code: ${otp}

Important:
- This OTP is valid for 10 minutes only
- Do not share this OTP with anyone
- If you did not request this password reset, please ignore this email

This is an automated email. Please do not reply to this message.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw error;
  }
};

// Send Signup OTP email
export const sendSignupOTPEmail = async (email, otp) => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file");
      throw new Error("Email service not configured");
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Hardware Sanitary App" <${process.env.EMAIL_USER}>`,
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
      text: `
Welcome! Verify Your Email

Thank you for signing up! Please verify your email address by entering the OTP code below:

Your Verification Code: ${otp}

Important:
- This OTP is valid for 10 minutes only
- Do not share this OTP with anyone
- If you did not sign up for this account, please ignore this email

This is an automated email. Please do not reply to this message.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Signup OTP email sent successfully to ${email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending signup OTP email:", error);
    throw error;
  }
};

// Send inquiry notification to admin
export const sendInquiryNotificationToAdmin = async (inquiryData) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email credentials not configured");
      throw new Error("Email service not configured");
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Hardware Sanitary App" <${process.env.EMAIL_USER}>`,
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
      text: `
New Product Inquiry Received

A customer has submitted a product inquiry. Please check the admin panel to review and update stock availability.

Inquiry Details:
- Customer: ${inquiryData.username} (${inquiryData.userEmail})
- Product: ${inquiryData.productName}
- Brand: ${inquiryData.brandName}
- Category: ${inquiryData.categoryName}
- Quantity: ${inquiryData.quantity}
- Unit Price: ₹${inquiryData.price.toLocaleString('en-IN')}
- Total Amount: ₹${inquiryData.totalAmount.toLocaleString('en-IN')}
- Inquiry ID: ${inquiryData.inquiryId}

Action Required: Please check the stock availability and update the inquiry status in the admin panel.

This is an automated email. Please do not reply to this message.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Inquiry notification email sent to admin: ${adminEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending inquiry email to admin:", error);
    throw error;
  }
};

// Send inquiry status update to user
export const sendInquiryStatusToUser = async (statusData) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email credentials not configured");
      throw new Error("Email service not configured");
    }

    const transporter = createTransporter();

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

    const mailOptions = {
      from: `"Hardware Sanitary App" <${process.env.EMAIL_USER}>`,
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
      text: `
${statusInfo.title}

Hello ${statusData.username},

${statusInfo.message}

Product Details:
- Product: ${statusData.productName}
- Quantity: ${statusData.quantity}
- Unit Price: ₹${statusData.price.toLocaleString('en-IN')}
- Total Amount: ₹${statusData.totalAmount.toLocaleString('en-IN')}
- Status: ${statusData.status.replace('_', ' ')}

${statusData.adminNotes ? `Admin Notes: ${statusData.adminNotes}\n` : ''}
You can view all your inquiries and notifications in your account dashboard.

This is an automated email. Please do not reply to this message.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Inquiry status email sent to user: ${statusData.userEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending inquiry status email to user:", error);
    throw error;
  }
};

// Verify email transporter configuration
export const verifyEmailConfig = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return { configured: false, message: "Email credentials not set in .env file" };
    }

    const transporter = createTransporter();
    await transporter.verify();
    return { configured: true, message: "Email service is ready" };
  } catch (error) {
    return { configured: false, message: `Email configuration error: ${error.message}` };
  }
};

