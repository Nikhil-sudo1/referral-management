"""
Email Service
Handles sending emails for verification, notifications, etc.
"""
import secrets
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.logging import logger
from app.config import settings


class EmailService:
    """Email service for sending verification and notification emails"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def generate_verification_token(self) -> str:
        """Generate a secure verification token"""
        return secrets.token_urlsafe(32)
    
    def create_verification_token(self, user: User) -> str:
        """
        Create and store verification token for user
        
        Args:
            user: User model instance
            
        Returns:
            Verification token string
        """
        token = self.generate_verification_token()
        user.verification_token = token
        user.verification_token_expires = datetime.utcnow() + timedelta(days=1)  # 24 hours expiry
        self.db.commit()
        
        logger.info(f"Verification token created for user: {user.email}")
        return token
    
    def send_verification_email(self, user: User, token: str) -> bool:
        """
        Send verification email to user
        
        Args:
            user: User model instance
            token: Verification token
            
        Returns:
            True if email sent successfully
        """
        try:
            # In production, use a proper email service (SendGrid, AWS SES, etc.)
            # For now, we'll just log it
            verification_url = f"{settings.FRONTEND_URL or 'http://localhost:3001'}/verify-email?token={token}&email={user.email}"
            
            email_body = f"""
            <html>
            <body>
                <h2>Verify Your Email Address</h2>
                <p>Hello {user.name},</p>
                <p>Thank you for signing up for TeamLease EdTech Referral Management System.</p>
                <p>Please click the link below to verify your email address:</p>
                <p><a href="{verification_url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
                <p>Or copy and paste this link into your browser:</p>
                <p>{verification_url}</p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't create an account, please ignore this email.</p>
                <br>
                <p>Best regards,<br>TeamLease EdTech</p>
            </body>
            </html>
            """
            
            # Send email using SMTP
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = "Verify Your Email - TeamLease EdTech"
            msg['From'] = settings.EMAIL_FROM
            msg['To'] = user.email
            msg.attach(MIMEText(email_body, 'html'))
            
            try:
                if settings.SMTP_USE_TLS:
                    server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
                    server.starttls()
                else:
                    server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT)
                
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
                server.quit()
                
                logger.info(f"Verification email sent successfully to {user.email}")
                return True
            except Exception as smtp_error:
                logger.error(f"SMTP error sending email to {user.email}: {str(smtp_error)}")
                # Log the URL for manual verification in case of email failure
                logger.info(f"Verification URL for {user.email}: {verification_url}")
                return False
            
        except Exception as e:
            logger.error(f"Failed to send verification email to {user.email}: {str(e)}")
            return False
    
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
            logger.warning(f"Invalid verification token: {token}")
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

