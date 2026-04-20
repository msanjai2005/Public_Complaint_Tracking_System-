const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
  }

  init() {
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS && 
          process.env.EMAIL_USER !== 'your-email@gmail.com') {
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        this.isConfigured = true;
        console.log('📧 Email service configured');
      } else {
        console.log('📧 Email service not configured (using console logging)');
      }
    } catch (error) {
      console.log('📧 Email service initialization failed:', error.message);
    }
  }

  async sendEmail(to, subject, html) {
    if (!this.isConfigured) {
      console.log(`📧 [Email Mock] To: ${to}, Subject: ${subject}`);
      return { success: true, mock: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"Complaint System" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email send error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(user) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Complaint System</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2>Hello ${user.name}!</h2>
          <p>Thank you for registering with our Public Complaint Tracking System.</p>
          <p>You can now file complaints, track their status, and provide feedback.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/login" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              Get Started
            </a>
          </div>
        </div>
      </div>
    `;
    return this.sendEmail(user.email, 'Welcome to Complaint System', html);
  }

  async sendComplaintRegistered(user, complaint) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Complaint Registered</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2>Hello ${user.name},</h2>
          <p>Your complaint has been registered successfully.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Complaint ID:</strong> ${complaint.complaintId}</p>
            <p><strong>Title:</strong> ${complaint.title}</p>
            <p><strong>Status:</strong> Pending</p>
          </div>
          <p>You can track your complaint status using the tracking ID above.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/complaints/${complaint._id}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              Track Complaint
            </a>
          </div>
        </div>
      </div>
    `;
    return this.sendEmail(user.email, `Complaint Registered - ${complaint.complaintId}`, html);
  }

  async sendStatusUpdate(user, complaint, newStatus) {
    const statusColors = {
      'pending': '#fbbf24',
      'under-review': '#3b82f6',
      'in-progress': '#8b5cf6',
      'resolved': '#10b981',
      'rejected': '#ef4444',
    };

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Status Update</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2>Hello ${user.name},</h2>
          <p>Your complaint status has been updated.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Complaint ID:</strong> ${complaint.complaintId}</p>
            <p><strong>Title:</strong> ${complaint.title}</p>
            <p><strong>New Status:</strong> 
              <span style="background: ${statusColors[newStatus] || '#6b7280'}; color: white; padding: 4px 12px; border-radius: 20px;">
                ${newStatus.replace('-', ' ').toUpperCase()}
              </span>
            </p>
          </div>
        </div>
      </div>
    `;
    return this.sendEmail(user.email, `Complaint ${complaint.complaintId} - Status Updated`, html);
  }
}

// Singleton
const emailService = new EmailService();
module.exports = emailService;
