"""
CRM Integration Service
Handles integration with Digivarsity CRM for lead management
"""
import httpx
import requests
import logging
from datetime import datetime
from typing import Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session

from app.config import settings
from app.models.referral import Referral
from app.models.university import University
from app.models.program import Program

logger = logging.getLogger(__name__)


class CRMService:
    """Service for integrating with Digivarsity CRM"""
    
    def __init__(self, db: Session):
        self.db = db
        self.base_url = settings.CRM_BASE_URL
        self.session_token = settings.CRM_SESSION_TOKEN
        self.bearer_token = settings.CRM_BEARER_TOKEN
        self.enabled = settings.CRM_ENABLED
    
    def _get_headers(self) -> Dict[str, str]:
        """Get required headers for CRM API calls"""
        return {
            "session-token": self.session_token,
            "Authorization": f"Bearer {self.bearer_token}",
            "Content-Type": "application/json"
        }
    
    def create_lead_sync(
        self,
        referee_name: str,
        referee_email: str,
        referee_phone: str,
        referrer_name: str,
        referrer_email: str,
        university: University,
        program: Program,
        referral_code: str,
        crm_university_id: Optional[int] = None,
        crm_course_id: Optional[int] = None
    ) -> Tuple[bool, Optional[int], Optional[str]]:
        """
        Create a lead in CRM synchronously (before saving to DB)
        
        Returns:
            Tuple of (success: bool, crm_lead_id: Optional[int], error_message: Optional[str])
        """
        if not self.enabled:
            logger.info("CRM integration disabled, allowing referral creation")
            return True, None, None
        
        try:
            now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            
            # Prepare lead data for CRM - use CRM IDs directly
            university_name = university.name if hasattr(university, 'name') else f"CRM University {crm_university_id}"
            program_name = program.name if hasattr(program, 'name') else f"CRM Course {crm_course_id}"
            
            # Validate that CRM IDs are provided (required, no defaults)
            if not crm_university_id:
                raise ValueError("crm_university_id is required. Please select a university from the dropdown.")
            if not crm_course_id:
                raise ValueError("crm_course_id is required. Please select a course from the dropdown.")
            
            lead_data = {
                "full_name": referee_name,
                "mobile_number": referee_phone,
                "email": referee_email,
                "university_interested": crm_university_id,  # Use selected CRM ID from dropdown
                "course": crm_course_id,  # Use selected CRM ID from dropdown
                "lead_channel": settings.CRM_DEFAULT_LEAD_CHANNEL,
                "source_medium": settings.CRM_DEFAULT_SOURCE_MEDIUM,
                "lead_owner": settings.CRM_DEFAULT_LEAD_OWNER,  # 8916142a-22b9-4fff-9c81-0fd166d963ce
                "tag": [],  # Empty array since CRM expects integer tag IDs
                "dob": None,
                "gender": None,
                "alternate_email": None,
                "best_time_to_call": None,
                "first_line_add": None,
                "country": "INDIA",
                "state": None,
                "city": None,
                "pincode": None,
                "compaign_name": None,
                "company_name": None,
                "remark": f"Referral from: {referrer_name} ({referrer_email}). Program: {program_name} at {university_name}. Referral Code: {referral_code}",
                "alternate_mobile_number": None,
                "apply_rule": 0,
                "ctc_annual_package": None,
                "experience": None,
                "lead_date": now,
                "lead_updated_date": now
            }
            
            logger.info(f"Creating CRM lead for referral {referral_code}")
            logger.info(f"CRM API URL: {self.base_url}/leads/create")
            logger.info(f"Lead Owner UUID: {settings.CRM_DEFAULT_LEAD_OWNER}")
            logger.info(f"Lead Data Preview: university={lead_data.get('university_interested')}, course={lead_data.get('course')}, lead_owner={lead_data.get('lead_owner')}")
            
            # Use synchronous requests instead of async httpx
            response = requests.post(
                f"{self.base_url}/leads/create",
                headers=self._get_headers(),
                json=lead_data,
                timeout=30
            )
            
            logger.info(f"CRM API Response Status: {response.status_code}")
            logger.info(f"CRM API Response: {response.text[:500] if response.text else 'Empty'}")
            
            if response.status_code in [200, 201]:
                result = response.json()
                
                # Check for error in response body
                if result.get("error") == True:
                    error_msg = str(result.get("message", "CRM API returned error"))
                    logger.error(f"CRM API error in response: {error_msg}")
                    return False, None, f"CRM Error: {error_msg}"
                
                # Extract lead ID from response
                crm_lead_id = (
                    result.get("id") or 
                    result.get("lead_id") or 
                    result.get("data", {}).get("id") or
                    result.get("data", {}).get("lead_id")
                )
                
                logger.info(f"CRM lead created successfully with ID: {crm_lead_id}")
                return True, crm_lead_id, None
            else:
                error_msg = f"CRM API error: {response.status_code} - {response.text[:200]}"
                logger.error(error_msg)
                return False, None, error_msg
                
        except requests.Timeout as e:
            error_msg = f"CRM API timeout: {str(e)}"
            logger.error(error_msg)
            return False, None, error_msg
            
        except requests.RequestException as e:
            error_msg = f"CRM connection error: {str(e)}"
            logger.error(error_msg)
            return False, None, error_msg
            
        except Exception as e:
            error_msg = f"CRM sync error: {str(e)}"
            logger.error(error_msg)
            return False, None, error_msg
    
    async def create_lead(self, referral: Referral) -> Optional[int]:
        """
        Create a lead in Digivarsity CRM from a referral
        
        Args:
            referral: The referral to sync to CRM
            
        Returns:
            CRM Lead ID if successful, None otherwise
        """
        if not self.enabled:
            logger.info("CRM integration disabled, skipping lead creation")
            return None
        
        try:
            # Get university and program details
            university = self.db.query(University).filter(
                University.id == referral.university_id
            ).first()
            
            program = self.db.query(Program).filter(
                Program.id == referral.program_id
            ).first()
            
            if not university or not program:
                logger.error(f"University or program not found for referral {referral.id}")
                return None
            
            # Prepare lead data for CRM
            # Note: university_interested and course are master IDs in CRM
            # You may need to map these to actual CRM IDs
            now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
            lead_data = {
                "full_name": referral.referee_name,
                "mobile_number": referral.referee_phone,
                "email": referral.referee_email,
                "university_interested": university.crm_university_id if hasattr(university, 'crm_university_id') and university.crm_university_id else 3,  # Default to 3 if not mapped
                "course": program.crm_course_id if hasattr(program, 'crm_course_id') and program.crm_course_id else 4463,  # Default if not mapped
                "lead_channel": settings.CRM_DEFAULT_LEAD_CHANNEL,
                "source_medium": settings.CRM_DEFAULT_SOURCE_MEDIUM,
                "lead_owner": settings.CRM_DEFAULT_LEAD_OWNER,  # Required field for CRM
                "tag": [],  # Empty array since CRM expects integer tag IDs  # Tag to identify referrals from AI system
                "dob": None,
                "gender": None,
                "alternate_email": None,
                "best_time_to_call": None,
                "first_line_add": None,
                "country": "INDIA",
                "state": None,
                "city": None,
                "pincode": None,
                "compaign_name": referral.utm_campaign,
                "company_name": None,
                "remark": f"Referral from: {referral.referrer_name} ({referral.referrer_email}). Program: {program.name} at {university.name}. Referral Code: {referral.referral_code}",
                "alternate_mobile_number": None,
                "apply_rule": 0,
                "ctc_annual_package": None,
                "experience": None,
                "enrolment_details": {
                    "enquiryid": None,
                    "enrollmentno": referral.referral_code
                },
                "lead_date": now,
                "lead_updated_date": now
            }
            
            logger.info(f"Creating CRM lead for referral {referral.referral_code}")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/leads/create",
                    headers=self._get_headers(),
                    json=lead_data
                )
                
                if response.status_code in [200, 201]:
                    result = response.json()
                    logger.info(f"CRM lead created successfully: {result}")
                    
                    # Extract lead ID from response
                    # The response structure may vary, adjust as needed
                    crm_lead_id = result.get("id") or result.get("lead_id") or result.get("data", {}).get("id")
                    
                    # Update referral with CRM lead ID
                    referral.crm_lead_id = crm_lead_id
                    referral.crm_synced_at = datetime.utcnow()
                    referral.crm_sync_error = None
                    self.db.commit()
                    
                    return crm_lead_id
                else:
                    error_msg = f"CRM API error: {response.status_code} - {response.text}"
                    logger.error(error_msg)
                    
                    # Store error in referral
                    referral.crm_sync_error = error_msg[:500]  # Truncate if too long
                    self.db.commit()
                    
                    return None
                    
        except httpx.TimeoutException as e:
            error_msg = f"CRM API timeout: {str(e)}"
            logger.error(error_msg)
            referral.crm_sync_error = error_msg
            self.db.commit()
            return None
            
        except Exception as e:
            error_msg = f"CRM sync error: {str(e)}"
            logger.error(error_msg)
            referral.crm_sync_error = error_msg[:500]
            self.db.commit()
            return None
    
    async def get_lead_activity(self, crm_lead_id: int) -> Optional[Dict[str, Any]]:
        """
        Get lead activity history from CRM
        
        Args:
            crm_lead_id: The CRM Lead ID
            
        Returns:
            Activity data if successful, None otherwise
        """
        if not self.enabled:
            logger.info("CRM integration disabled, skipping activity fetch")
            return None
        
        if not crm_lead_id:
            logger.warning("No CRM lead ID provided for activity fetch")
            return None
        
        try:
            logger.info(f"Fetching CRM activity for lead {crm_lead_id}")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/leads/lead_activity",
                    headers=self._get_headers(),
                    json={"id": crm_lead_id}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"CRM activity fetched successfully for lead {crm_lead_id}")
                    return result
                else:
                    logger.error(f"CRM activity API error: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error fetching CRM activity: {str(e)}")
            return None
    
    async def sync_referral_to_crm(self, referral: Referral) -> bool:
        """
        Sync a referral to CRM (create or update)
        
        Args:
            referral: The referral to sync
            
        Returns:
            True if successful, False otherwise
        """
        if referral.crm_lead_id:
            logger.info(f"Referral {referral.referral_code} already synced to CRM (Lead ID: {referral.crm_lead_id})")
            return True
        
        crm_lead_id = await self.create_lead(referral)
        return crm_lead_id is not None
    
    def sync_referral_to_crm_sync(self, referral: Referral) -> bool:
        """
        Synchronous wrapper for sync_referral_to_crm
        For use in non-async contexts
        """
        import asyncio
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        return loop.run_until_complete(self.sync_referral_to_crm(referral))
    
    async def get_master_data(
        self,
        identifier: list,
        status: Optional[int] = None,
        parent_id: Optional[int] = None
    ) -> list:
        """
        Get master data from CRM using /common/get_master_dd endpoint
        
        Args:
            identifier: List of identifiers (e.g., ["university"], ["course"])
            status: Optional status filter (e.g., 1 for active)
            parent_id: Optional parent ID (e.g., university_id for courses)
            
        Returns:
            List of master data items
        """
        if not self.enabled:
            logger.info("CRM integration disabled, skipping master data fetch")
            return []
        
        try:
            request_body = {
                "identifier": identifier
            }
            
            if status is not None:
                request_body["status"] = status
            
            if parent_id is not None:
                request_body["parent_id"] = parent_id
            
            logger.info(f"Fetching CRM master data: {request_body}")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/common/get_master_dd",
                    headers=self._get_headers(),
                    json=request_body
                )
                
                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"CRM master data fetched successfully: {len(result) if isinstance(result, list) else 'N/A'} items")
                    return result if isinstance(result, list) else []
                else:
                    logger.error(f"CRM master data API error: {response.status_code} - {response.text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error fetching CRM master data: {str(e)}")
            return []
    
    def get_lead_activity_sync(self, crm_lead_id: int) -> Optional[Dict[str, Any]]:
        """
        Get lead activity history from CRM synchronously
        
        Args:
            crm_lead_id: The CRM Lead ID
            
        Returns:
            Activity data if successful, None otherwise
        """
        if not self.enabled:
            logger.info("CRM integration disabled, skipping activity fetch")
            return None
        
        if not crm_lead_id:
            logger.warning("No CRM lead ID provided for activity fetch")
            return None
        
        try:
            logger.info(f"Fetching CRM activity for lead {crm_lead_id}")
            
            response = requests.post(
                f"{self.base_url}/leads/lead_activity",
                headers=self._get_headers(),
                json={"id": crm_lead_id},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"CRM activity fetched successfully for lead {crm_lead_id}")
                return result
            else:
                logger.error(f"CRM activity API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error fetching CRM activity: {str(e)}")
            return None


def get_crm_service(db: Session) -> CRMService:
    """Factory function to get CRM service instance"""
    return CRMService(db)

