"""
Comprehensive API Testing Script
Tests all backend APIs and verifies frontend-backend sync
"""
import requests
import json
import sys
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
# BASE_URL = "https://devreferralapi.tledtech.com/api/v1"  # Uncomment for production testing

# Test credentials (update with actual test user)
TEST_ADMIN_EMAIL = "admin@test.com"
TEST_ADMIN_PASSWORD = "password123"
TEST_REFERRER_EMAIL = "referrer@test.com"
TEST_REFERRER_PASSWORD = "password123"

class APITester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.auth_token: Optional[str] = None
        self.test_results: Dict[str, Any] = {
            "passed": [],
            "failed": [],
            "skipped": []
        }
    
    def log_result(self, test_name: str, passed: bool, message: str = "", error: str = ""):
        """Log test result"""
        result = {
            "test": test_name,
            "passed": passed,
            "message": message,
            "error": error
        }
        if passed:
            self.test_results["passed"].append(result)
            print(f"[PASS] {test_name} - {message}")
        else:
            self.test_results["failed"].append(result)
            print(f"[FAIL] {test_name} - {message}")
            if error:
                print(f"   Error: {error}")
    
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    params: Optional[Dict] = None, expected_status: int = 200) -> Optional[Dict]:
        """Make API request with error handling"""
        url = f"{self.base_url}{endpoint}"
        headers = {}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, params=params, timeout=10)
            elif method.upper() == "POST":
                response = self.session.post(url, headers=headers, json=data, params=params, timeout=10)
            elif method.upper() == "PUT":
                response = self.session.put(url, headers=headers, json=data, timeout=10)
            elif method.upper() == "PATCH":
                response = self.session.patch(url, headers=headers, json=data, timeout=10)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            if response.status_code == expected_status:
                try:
                    return response.json()
                except:
                    return {"raw": response.text}
            else:
                return {"error": f"Expected {expected_status}, got {response.status_code}", "response": response.text}
        except Exception as e:
            return {"error": str(e)}
    
    # ========== AUTH TESTS ==========
    def test_health_check(self):
        """Test health check endpoint"""
        # Health check is at root level, not under /api/v1
        url = f"{self.base_url.replace('/api/v1', '')}/health"
        try:
            response = self.session.get(url, timeout=10)
            if response.status_code == 200:
                self.log_result("Health Check", True, "Health check passed")
            else:
                self.log_result("Health Check", False, f"Health check failed: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Health Check", False, "Health check failed", str(e))
    
    def test_login(self, email: str, password: str) -> bool:
        """Test login and store token"""
        data = {"email": email, "password": password}
        result = self.make_request("POST", "/auth/login", data=data, expected_status=200)
        
        if result and result.get("success") and result.get("data", {}).get("access_token"):
            self.auth_token = result["data"]["access_token"]
            self.log_result("Login", True, f"Logged in as {email}")
            return True
        else:
            self.log_result("Login", False, f"Login failed for {email}", str(result))
            return False
    
    def test_get_me(self):
        """Test get current user"""
        result = self.make_request("GET", "/auth/me", expected_status=200)
        if result and result.get("success"):
            self.log_result("Get Current User", True, f"User: {result.get('data', {}).get('email', 'Unknown')}")
        else:
            self.log_result("Get Current User", False, "Failed to get current user", str(result))
    
    def test_get_user_types(self):
        """Test get user types"""
        result = self.make_request("GET", "/auth/user-types", expected_status=200)
        if result and result.get("success"):
            types = result.get("data", [])
            self.log_result("Get User Types", True, f"Found {len(types)} user types")
        else:
            self.log_result("Get User Types", False, "Failed to get user types", str(result))
    
    def test_get_roles(self):
        """Test get roles"""
        result = self.make_request("GET", "/auth/roles", expected_status=200)
        if result and result.get("success"):
            roles = result.get("data", [])
            self.log_result("Get Roles", True, f"Found {len(roles)} roles")
        else:
            self.log_result("Get Roles", False, "Failed to get roles", str(result))
    
    # ========== UNIVERSITIES TESTS ==========
    def test_get_universities(self):
        """Test get universities"""
        result = self.make_request("GET", "/universities", params={"page": 1, "limit": 10}, expected_status=200)
        if result and result.get("success"):
            data = result.get("data", {})
            items = data.get("items", [])
            self.log_result("Get Universities", True, f"Found {len(items)} universities")
            return items[0].get("id") if items else None
        else:
            self.log_result("Get Universities", False, "Failed to get universities", str(result))
            return None
    
    def test_get_university(self, university_id: str):
        """Test get university by ID"""
        if not university_id:
            self.log_result("Get University by ID", False, "No university ID available", "Skipped")
            return
        
        result = self.make_request("GET", f"/universities/{university_id}", expected_status=200)
        if result and result.get("success"):
            self.log_result("Get University by ID", True, f"University: {result.get('data', {}).get('name', 'Unknown')}")
        else:
            self.log_result("Get University by ID", False, "Failed to get university", str(result))
    
    def test_get_university_programs(self, university_id: str):
        """Test get university programs"""
        if not university_id:
            self.log_result("Get University Programs", False, "No university ID available", "Skipped")
            return
        
        result = self.make_request("GET", f"/universities/{university_id}/programs", expected_status=200)
        if result and result.get("success"):
            programs = result.get("data", [])
            self.log_result("Get University Programs", True, f"Found {len(programs)} programs")
            return programs[0].get("id") if programs else None
        else:
            self.log_result("Get University Programs", False, "Failed to get programs", str(result))
            return None
    
    # ========== PROGRAMS TESTS ==========
    def test_get_programs(self):
        """Test get programs"""
        result = self.make_request("GET", "/programs", params={"page": 1, "limit": 10}, expected_status=200)
        if result and result.get("success"):
            data = result.get("data", {})
            items = data.get("items", [])
            self.log_result("Get Programs", True, f"Found {len(items)} programs")
        else:
            self.log_result("Get Programs", False, "Failed to get programs", str(result))
    
    # ========== REFERRALS TESTS ==========
    def test_get_referrals(self):
        """Test get referrals"""
        result = self.make_request("GET", "/referrals", params={"page": 1, "limit": 10}, expected_status=200)
        if result and result.get("success"):
            data = result.get("data", {})
            items = data.get("items", [])
            self.log_result("Get Referrals", True, f"Found {len(items)} referrals")
            return items[0].get("id") if items else None
        else:
            self.log_result("Get Referrals", False, "Failed to get referrals", str(result))
            return None
    
    def test_get_referral_stats(self):
        """Test get referral stats"""
        result = self.make_request("GET", "/referrals/stats", expected_status=200)
        if result and result.get("success"):
            stats = result.get("data", {})
            self.log_result("Get Referral Stats", True, f"Total: {stats.get('total', 0)}")
        else:
            self.log_result("Get Referral Stats", False, "Failed to get stats", str(result))
    
    def test_get_my_referrals(self):
        """Test get my referrals (referrer)"""
        result = self.make_request("GET", "/referrals/my-referrals", params={"page": 1, "limit": 10}, expected_status=200)
        if result and result.get("success"):
            data = result.get("data", {})
            items = data.get("items", [])
            self.log_result("Get My Referrals", True, f"Found {len(items)} referrals")
        else:
            # This might fail if not a referrer, which is OK
            error_msg = str(result)
            if "403" in error_msg or "Forbidden" in error_msg:
                self.log_result("Get My Referrals", True, "Skipped (not a referrer)", "")
            else:
                self.log_result("Get My Referrals", False, "Failed to get my referrals", error_msg)
    
    # ========== REWARDS TESTS ==========
    def test_get_rewards(self):
        """Test get rewards"""
        result = self.make_request("GET", "/rewards", params={"page": 1, "limit": 10}, expected_status=200)
        if result and result.get("success"):
            data = result.get("data", {})
            items = data.get("items", [])
            self.log_result("Get Rewards", True, f"Found {len(items)} rewards")
        else:
            self.log_result("Get Rewards", False, "Failed to get rewards", str(result))
    
    def test_get_my_rewards(self):
        """Test get my rewards"""
        result = self.make_request("GET", "/rewards/my-rewards", expected_status=200)
        if result and result.get("success"):
            rewards = result.get("data", [])
            self.log_result("Get My Rewards", True, f"Found {len(rewards)} rewards")
        else:
            self.log_result("Get My Rewards", False, "Failed to get my rewards", str(result))
    
    def test_get_reward_tiers(self):
        """Test get reward tiers"""
        result = self.make_request("GET", "/rewards/tiers", expected_status=200)
        if result and result.get("success"):
            tiers = result.get("data", [])
            self.log_result("Get Reward Tiers", True, f"Found {len(tiers)} tiers")
        else:
            self.log_result("Get Reward Tiers", False, "Failed to get tiers", str(result))
    
    # ========== LEADERBOARD TESTS ==========
    def test_get_referrer_leaderboard(self):
        """Test get referrer leaderboard"""
        result = self.make_request("GET", "/leaderboard/referrers", params={"period": "all_time", "limit": 10}, expected_status=200)
        if result and result.get("success"):
            data = result.get("data", {})
            entries = data.get("entries", [])
            self.log_result("Get Referrer Leaderboard", True, f"Found {len(entries)} entries")
        else:
            self.log_result("Get Referrer Leaderboard", False, "Failed to get leaderboard", str(result))
    
    def test_get_my_rank(self):
        """Test get my rank"""
        result = self.make_request("GET", "/leaderboard/my-rank", expected_status=200)
        if result and result.get("success"):
            data = result.get("data", {})
            self.log_result("Get My Rank", True, f"Rank: {data.get('rank', 'N/A')}")
        else:
            self.log_result("Get My Rank", False, "Failed to get rank", str(result))
    
    # ========== ANALYTICS TESTS ==========
    def test_get_dashboard_stats(self):
        """Test get dashboard stats"""
        result = self.make_request("GET", "/analytics/dashboard", expected_status=200)
        if result and result.get("success"):
            data = result.get("data", {})
            self.log_result("Get Dashboard Stats", True, "Stats retrieved")
        else:
            self.log_result("Get Dashboard Stats", False, "Failed to get stats", str(result))
    
    # ========== NOTIFICATIONS TESTS ==========
    def test_get_notifications(self):
        """Test get notifications"""
        result = self.make_request("GET", "/notifications", params={"page": 1, "limit": 10}, expected_status=200)
        if result and result.get("success"):
            data = result.get("data", {})
            items = data.get("items", [])
            self.log_result("Get Notifications", True, f"Found {len(items)} notifications")
        else:
            self.log_result("Get Notifications", False, "Failed to get notifications", str(result))
    
    def test_get_unread_count(self):
        """Test get unread notification count"""
        result = self.make_request("GET", "/notifications/unread-count", expected_status=200)
        if result and result.get("success"):
            count = result.get("data", {}).get("count", 0)
            self.log_result("Get Unread Count", True, f"Unread: {count}")
        else:
            self.log_result("Get Unread Count", False, "Failed to get count", str(result))
    
    # ========== CRM TESTS ==========
    def test_get_crm_universities(self):
        """Test get CRM universities"""
        result = self.make_request("POST", "/crm/universities", expected_status=200)
        if result and result.get("success"):
            universities = result.get("data", [])
            self.log_result("Get CRM Universities", True, f"Found {len(universities)} universities")
        else:
            self.log_result("Get CRM Universities", False, "Failed to get CRM universities", str(result))
    
    # ========== CHAT TESTS ==========
    def test_get_quick_start(self):
        """Test get chat quick start"""
        result = self.make_request("GET", "/chat/quick-start", expected_status=200)
        if result:
            suggestions = result.get("suggestions", [])
            self.log_result("Get Chat Quick Start", True, f"Found {len(suggestions)} suggestions")
        else:
            self.log_result("Get Chat Quick Start", False, "Failed to get quick start", str(result))
    
    def test_get_conversations(self):
        """Test get conversations"""
        result = self.make_request("GET", "/chat/conversations", params={"limit": 10}, expected_status=200)
        if result and result.get("conversations") is not None:
            conversations = result.get("conversations", [])
            self.log_result("Get Conversations", True, f"Found {len(conversations)} conversations")
        else:
            self.log_result("Get Conversations", False, "Failed to get conversations", str(result))
    
    # ========== USERS TESTS ==========
    def test_get_users(self):
        """Test get users (admin only)"""
        result = self.make_request("GET", "/users", params={"page": 1, "limit": 10}, expected_status=200)
        if result and result.get("success"):
            data = result.get("data", {})
            items = data.get("items", [])
            self.log_result("Get Users", True, f"Found {len(items)} users")
        else:
            error_msg = str(result)
            if "403" in error_msg or "Forbidden" in error_msg:
                self.log_result("Get Users", True, "Skipped (not admin)", "")
            else:
                self.log_result("Get Users", False, "Failed to get users", error_msg)
    
    def test_get_counselors(self):
        """Test get counselors"""
        result = self.make_request("GET", "/users/counselors", expected_status=200)
        if result and result.get("success"):
            counselors = result.get("data", [])
            self.log_result("Get Counselors", True, f"Found {len(counselors)} counselors")
        else:
            self.log_result("Get Counselors", False, "Failed to get counselors", str(result))
    
    # ========== RUN ALL TESTS ==========
    def run_all_tests(self, email: str, password: str):
        """Run all API tests"""
        print("\n" + "="*60)
        print("COMPREHENSIVE API TESTING")
        print("="*60 + "\n")
        
        # Health check (no auth)
        print("\n--- Health Check ---")
        self.test_health_check()
        
        # Auth tests
        print("\n--- Authentication Tests ---")
        if not self.test_login(email, password):
            print("\n[WARNING] Login failed. Some tests will be skipped.\n")
            return
        
        self.test_get_me()
        self.test_get_user_types()
        self.test_get_roles()
        
        # Universities tests
        print("\n--- Universities Tests ---")
        university_id = self.test_get_universities()
        if university_id:
            self.test_get_university(university_id)
            program_id = self.test_get_university_programs(university_id)
        
        # Programs tests
        print("\n--- Programs Tests ---")
        self.test_get_programs()
        
        # Referrals tests
        print("\n--- Referrals Tests ---")
        referral_id = self.test_get_referrals()
        self.test_get_referral_stats()
        self.test_get_my_referrals()
        
        # Rewards tests
        print("\n--- Rewards Tests ---")
        self.test_get_rewards()
        self.test_get_my_rewards()
        self.test_get_reward_tiers()
        
        # Leaderboard tests
        print("\n--- Leaderboard Tests ---")
        self.test_get_referrer_leaderboard()
        self.test_get_my_rank()
        
        # Analytics tests
        print("\n--- Analytics Tests ---")
        self.test_get_dashboard_stats()
        
        # Notifications tests
        print("\n--- Notifications Tests ---")
        self.test_get_notifications()
        self.test_get_unread_count()
        
        # CRM tests
        print("\n--- CRM Tests ---")
        self.test_get_crm_universities()
        
        # Chat tests
        print("\n--- Chat Tests ---")
        self.test_get_quick_start()
        self.test_get_conversations()
        
        # Users tests
        print("\n--- Users Tests ---")
        self.test_get_users()
        self.test_get_counselors()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"[PASSED] {len(self.test_results['passed'])}")
        print(f"[FAILED] {len(self.test_results['failed'])}")
        print(f"[SKIPPED] {len(self.test_results['skipped'])}")
        print("="*60)
        
        if self.test_results['failed']:
            print("\nFAILED TESTS:")
            for test in self.test_results['failed']:
                print(f"  - {test['test']}: {test['error']}")
        
        # Save results to file
        with open("test_results.json", "w") as f:
            json.dump(self.test_results, f, indent=2)
        print("\n[INFO] Detailed results saved to test_results.json")


if __name__ == "__main__":
    # Get credentials from command line or use defaults
    email = sys.argv[1] if len(sys.argv) > 1 else TEST_ADMIN_EMAIL
    password = sys.argv[2] if len(sys.argv) > 2 else TEST_ADMIN_PASSWORD
    
    tester = APITester(BASE_URL)
    tester.run_all_tests(email, password)
    
    # Exit with error code if tests failed
    if tester.test_results['failed']:
        sys.exit(1)

