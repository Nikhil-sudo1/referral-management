"""
Email Service
Handles sending emails for verification, password reset, notifications, etc.
"""
import secrets
import smtplib
from datetime import datetime, timedelta
from typing import Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.logging import logger
from app.config import settings


class EmailService:
    """Email service for sending verification and notification emails"""
    
    # Hardcoded SMTP credentials as fallback (ZeptoMail for teamleaseedtech.com)
    FALLBACK_SMTP_PASSWORD = "Zoho-enczapikey PHtE6r0PRum52jJ8+hMH4qC9FpagMYspq+MzfwkUtY5HDaIHGE0Hqoh4kjKyoh5+BvFGFKTNzdptuLibseKNIzztMWhMX2qyqK3sx/VYSPOZsbq6x00csFwdd03fVYDndtJt0izevdnSNA=="
    
    def __init__(self, db: Session):
        self.db = db
    
    def _get_smtp_password(self) -> str:
        """Get SMTP password, using fallback if config is malformed"""
        password = settings.SMTP_PASSWORD
        # Strip quotes if present (in case .env parsing issues)
        password = password.strip('"\'')
        # If password looks corrupted or empty, use fallback
        if not password or len(password) < 50:
            logger.warning("SMTP password from config appears invalid, using fallback")
            return self.FALLBACK_SMTP_PASSWORD
        return password
    
    def generate_token(self) -> str:
        """Generate a secure random token"""
        return secrets.token_urlsafe(32)
    
    def _send_email(self, to_email: str, subject: str, html_body: str) -> bool:
        """
        Send email using SMTP
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_body: HTML content of email
            
        Returns:
            True if email sent successfully
        """
        try:
            # Log SMTP configuration (without password)
            logger.info(f"SMTP Config: host={settings.SMTP_HOST}, port={settings.SMTP_PORT}, user={settings.SMTP_USER}, tls={settings.SMTP_USE_TLS}")
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
            msg['To'] = to_email
            msg.attach(MIMEText(html_body, 'html'))
            
            server = None
            if settings.SMTP_USE_TLS:
                # TLS on port 587
                logger.info(f"Connecting to SMTP server with TLS on port {settings.SMTP_PORT}...")
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30)
                server.set_debuglevel(0)  # Set to 1 for verbose SMTP debugging
                server.ehlo()
                server.starttls()
                server.ehlo()
            else:
                # SSL on port 465
                logger.info(f"Connecting to SMTP server with SSL on port {settings.SMTP_PORT}...")
                server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30)
            
            logger.info("Authenticating with SMTP server...")
            smtp_password = self._get_smtp_password()
            server.login(settings.SMTP_USER, smtp_password)
            logger.info("SMTP authentication successful")
            
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except smtplib.SMTPAuthenticationError as e:
            logger.error(f"SMTP Authentication failed: {str(e)}")
            logger.error(f"Check SMTP credentials - User: {settings.SMTP_USER}, Password length: {len(settings.SMTP_PASSWORD)}")
            return False
        except smtplib.SMTPException as e:
            logger.error(f"SMTP error sending email to {to_email}: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    # ==================== EMAIL VERIFICATION ====================
    
    def create_verification_token(self, user: User) -> str:
        """
        Create and store verification token for user
        
        Args:
            user: User model instance
            
        Returns:
            Verification token string
        """
        token = self.generate_token()
        user.verification_token = token
        user.verification_token_expires = datetime.utcnow() + timedelta(hours=24)
        self.db.commit()
        
        logger.info(f"Verification token created for user: {user.email}")
        return token
    
    def send_verification_email(self, user: User, token: str) -> bool:
        """
        Send verification email to user after signup
        
        Args:
            user: User model instance
            token: Verification token
            
        Returns:
            True if email sent successfully
        """
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}&email={user.email}"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">🎓 TeamLease EdTech</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Referral Management System</p>
                </div>
                
                <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #1f2937; margin: 0 0 20px;">Welcome, {user.name}! 👋</h2>
                    
                    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
                        Thank you for joining TeamLease EdTech Referral Program. Please verify your email address to activate your account.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{verification_url}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            ✓ Verify Email Address
                        </a>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0;">
                        Or copy this link into your browser:
                    </p>
                    <p style="color: #6366f1; font-size: 12px; word-break: break-all; background: #f4f4f5; padding: 10px; border-radius: 6px;">
                        {verification_url}
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        This link expires in 24 hours. If you didn't create an account, please ignore this email.
                    </p>
                </div>
                
                <div style="text-align: center; padding: 20px;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        © 2024 TeamLease EdTech. All rights reserved.<br>
                        <a href="mailto:edtech@teamlease.com" style="color: #6366f1;">edtech@teamlease.com</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        result = self._send_email(
            to_email=user.email,
            subject="✓ Verify Your Email - TeamLease EdTech",
            html_body=html_body
        )
        
        if not result:
            # Log URL for manual verification in case of email failure
            logger.info(f"Verification URL for {user.email}: {verification_url}")
        
        return result
    
    def verify_email_token(self, token: str) -> Optional[User]:
        """
        Verify email token and mark user as verified
        
        Args:
            token: Verification token
            
        Returns:
            User if token is valid, None otherwise
        """
        user = self.db.query(User).filter(
            User.verification_token == token
        ).first()
        
        if not user:
            logger.warning(f"Invalid verification token")
            return None
        
        if user.verification_token_expires and user.verification_token_expires < datetime.utcnow():
            logger.warning(f"Expired verification token for user: {user.email}")
            return None
        
        if user.is_verified:
            logger.info(f"User already verified: {user.email}")
            return user
        
        # Mark user as verified
        user.is_verified = True
        user.verification_token = None
        user.verification_token_expires = None
        self.db.commit()
        
        logger.info(f"Email verified successfully for user: {user.email}")
        return user
    
    # ==================== PASSWORD RESET ====================
    
    def create_password_reset_token(self, user: User) -> str:
        """
        Create and store password reset token for user
        
        Args:
            user: User model instance
            
        Returns:
            Reset token string
        """
        token = self.generate_token()
        user.reset_token = token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)  # 1 hour expiry
        self.db.commit()
        
        logger.info(f"Password reset token created for user: {user.email}")
        return token
    
    def send_password_reset_email(self, user: User, token: str) -> bool:
        """
        Send password reset email to user
        
        Args:
            user: User model instance
            token: Reset token
            
        Returns:
            True if email sent successfully
        """
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}&email={user.email}"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">🎓 TeamLease EdTech</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Password Reset Request</p>
                </div>
                
                <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #1f2937; margin: 0 0 20px;">Reset Your Password 🔐</h2>
                    
                    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
                        Hello <strong>{user.name}</strong>,
                    </p>
                    
                    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
                        We received a request to reset your password for your TeamLease EdTech account. Click the button below to create a new password:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_url}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            🔑 Reset Password
                        </a>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0;">
                        Or copy this link into your browser:
                    </p>
                    <p style="color: #6366f1; font-size: 12px; word-break: break-all; background: #f4f4f5; padding: 10px; border-radius: 6px;">
                        {reset_url}
                    </p>
                    
                    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 20px 0;">
                        <p style="color: #92400e; font-size: 13px; margin: 0;">
                            ⚠️ <strong>Important:</strong> This link expires in 1 hour for security reasons.
                        </p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.
                    </p>
                </div>
                
                <div style="text-align: center; padding: 20px;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        © 2024 TeamLease EdTech. All rights reserved.<br>
                        <a href="mailto:edtech@teamlease.com" style="color: #6366f1;">edtech@teamlease.com</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        result = self._send_email(
            to_email=user.email,
            subject="🔑 Reset Your Password - TeamLease EdTech",
            html_body=html_body
        )
        
        if not result:
            # Log URL for manual reset in case of email failure
            logger.info(f"Password reset URL for {user.email}: {reset_url}")
        
        return result
    
    def verify_reset_token(self, token: str) -> Optional[User]:
        """
        Verify password reset token
        
        Args:
            token: Reset token
            
        Returns:
            User if token is valid, None otherwise
        """
        user = self.db.query(User).filter(
            User.reset_token == token
        ).first()
        
        if not user:
            logger.warning(f"Invalid reset token")
            return None
        
        if user.reset_token_expires and user.reset_token_expires < datetime.utcnow():
            logger.warning(f"Expired reset token for user: {user.email}")
            return None
        
        return user
    
    def clear_reset_token(self, user: User) -> None:
        """
        Clear password reset token after successful reset
        
        Args:
            user: User model instance
        """
        user.reset_token = None
        user.reset_token_expires = None
        self.db.commit()
        logger.info(f"Reset token cleared for user: {user.email}")
    
    # ==================== WELCOME EMAIL ====================
    
    def send_welcome_email(self, user: User) -> bool:
        """
        Send welcome email after successful registration
        
        Args:
            user: User model instance
            
        Returns:
            True if email sent successfully
        """
        login_url = f"{settings.FRONTEND_URL}/login"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">🎓 TeamLease EdTech</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Welcome to the Referral Program!</p>
                </div>
                
                <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #1f2937; margin: 0 0 20px;">Welcome aboard, {user.name}! 🎉</h2>
                    
                    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
                        Congratulations! Your account has been successfully created. You're now part of India's largest education referral network.
                    </p>
                    
                    <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #166534; margin: 0 0 15px; font-size: 16px;">🚀 What's Next?</h3>
                        <ul style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.8;">
                            <li>Complete your profile</li>
                            <li>Share your unique referral code</li>
                            <li>Earn rewards for every successful admission</li>
                            <li>Track your referrals in real-time</li>
                        </ul>
                    </div>
                    
                    {f'<p style="color: #4b5563; margin: 20px 0;"><strong>Your Referral Code:</strong> <span style="background: #e0e7ff; color: #4f46e5; padding: 4px 12px; border-radius: 4px; font-family: monospace;">{user.referral_code}</span></p>' if user.referral_code else ''}
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{login_url}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            🎯 Get Started
                        </a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        Need help? Contact our support team at <a href="mailto:edtech@teamlease.com" style="color: #6366f1;">edtech@teamlease.com</a>
                    </p>
                </div>
                
                <div style="text-align: center; padding: 20px;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        © 2024 TeamLease EdTech. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self._send_email(
            to_email=user.email,
            subject="🎉 Welcome to TeamLease EdTech Referral Program!",
            html_body=html_body
        )
