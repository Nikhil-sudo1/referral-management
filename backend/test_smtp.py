#!/usr/bin/env python3
"""
Test SMTP connection and email sending
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# SMTP Configuration
SMTP_HOST = "smtp.zeptomail.in"
SMTP_PORT = 587
SMTP_USER = "emailapikey"
SMTP_PASSWORD = "Zoho-enczapikey PHtE6r0PRum52jJ8+hMH4qC9FpagMYspq+MzfwkUtY5HDaIHGE0Hqoh4kjKyoh5+BvFGFKTNzdptuLibseKNIzztMWhMX2qyqK3sx/VYSPOZsbq6x00csFwdd03fVYDndtJt0izevdnSNA=="
EMAIL_FROM = "noreply@teamleaseedtech.com"
EMAIL_FROM_NAME = "TeamLease EdTech"

def test_smtp_connection():
    """Test SMTP connection"""
    print(f"Testing SMTP connection to {SMTP_HOST}:{SMTP_PORT}...")
    print(f"Username: {SMTP_USER}")
    print(f"Password length: {len(SMTP_PASSWORD)} characters")
    
    try:
        # Connect to SMTP server
        print("\n1. Connecting to SMTP server...")
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30)
        server.set_debuglevel(1)  # Enable debug output
        
        # Send EHLO
        print("\n2. Sending EHLO...")
        server.ehlo()
        
        # Start TLS
        print("\n3. Starting TLS...")
        server.starttls()
        server.ehlo()
        
        # Authenticate
        print("\n4. Authenticating...")
        server.login(SMTP_USER, SMTP_PASSWORD)
        
        print("\n[OK] SMTP connection and authentication successful!")
        
        server.quit()
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"\n[FAIL] SMTP Authentication Failed: {e}")
        return False
    except smtplib.SMTPException as e:
        print(f"\n[FAIL] SMTP Error: {e}")
        return False
    except Exception as e:
        print(f"\n[FAIL] Error: {e}")
        return False


def send_test_email(to_email: str):
    """Send a test email"""
    print(f"\nSending test email to {to_email}...")
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "🧪 Test Email - TeamLease EdTech"
        msg['From'] = f"{EMAIL_FROM_NAME} <{EMAIL_FROM}>"
        msg['To'] = to_email
        
        html_body = """
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px;">
                <h1 style="color: white; margin: 0;">🧪 Test Email</h1>
                <p style="color: rgba(255,255,255,0.9);">SMTP Configuration is working correctly!</p>
            </div>
            <div style="max-width: 600px; margin: 20px auto; padding: 20px; background: #f5f5f5; border-radius: 10px;">
                <p>This is a test email from TeamLease EdTech Referral Portal.</p>
                <p>If you received this email, your SMTP configuration is working! ✅</p>
            </div>
        </body>
        </html>
        """
        msg.attach(MIMEText(html_body, 'html'))
        
        # Connect and send
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        print(f"[OK] Test email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        print(f"[FAIL] Failed to send email: {e}")
        return False


if __name__ == "__main__":
    import sys
    
    # Test connection first
    if test_smtp_connection():
        # If email address provided, send test email
        if len(sys.argv) > 1:
            to_email = sys.argv[1]
            send_test_email(to_email)
        else:
            print("\nTo send a test email, run: python test_smtp.py your@email.com")

