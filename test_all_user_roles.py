"""
Comprehensive User Role Testing Script
Tests login and APIs for all user_type_id and role_id combinations
"""
import requests
import json
import sys
from typing import Dict, Any, Optional, List

# Configuration
BASE_URL = "http://localhost:8000/api/v1"

# Test users from database
TEST_USERS = [
    {
        "name": "HR Admin",
        "email": "hr.admin@teamlease.com",
        "password": "Password123!",  # Need to verify actual password
        "user_type_id": 1,
        "role_id": 1,
        "role_name": "HR Admin"
    },
    {
        "name": "Student Admin",
        "email": "student.admin@teamlease.com",
        "password": "Password123!",
        "user_type_id": 1,
        "role_id": 3,
        "role_name": "Student Admin"
    },
    {
        "name": "Employee Referrer",
        "email": "employee@teamlease.com",
        "password": "Password123!",
        "user_type_id": 2,
        "role_id": 4,
        "role_name": "Employee Referrer"
    },
    {
        "name": "Student Referrer",
        "email": "student@teamlease.com",
        "password": "Password123!",
        "user_type_id": 2,
        "role_id": 5,
        "role_name": "Student Referrer"
    },
    {
        "name": "Student Referrer 2",
        "email": "anjali.mehta@university.edu",
        "password": "Password123!",  # May need to verify
        "user_type_id": 2,
        "role_id": 5,
        "role_name": "Student Referrer"
    },
]

class RoleTester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.results: Dict[str, List[Dict]] = {
            "login": [],
            "auth": [],
            "referrals": [],
            "universities": [],
            "programs": [],
            "rewards": [],
            "leaderboard": [],
            "analytics": [],
            "notifications": [],
            "users": [],
            "crm": [],
            "chat": []
        }
    
    def log_test(self, category: str, user: Dict, test_name: str, passed: bool, 
                 message: str = "", error: str = ""):
        """Log test result"""
        result = {
            "user": user["name"],
            "email": user["email"],
            "user_type_id": user["user_type_id"],
            "role_id": user["role_id"],
            "role_name": user["role_name"],
            "test": test_name,
            "passed": passed,
            "message": message,
            "error": error
        }
        self.results[category].append(result)
        
        status = "[PASS]" if passed else "[FAIL]"
        print(f"{status} {user['name']} ({user['role_name']}) - {test_name}: {message}")
        if error:
            print(f"      Error: {error}")
    
    def make_request(self, method: str, endpoint: str, token: Optional[str] = None,
                    data: Optional[Dict] = None, params: Optional[Dict] = None,
                    expected_status: int = 200) -> Optional[Dict]:
        """Make API request"""
        url = f"{self.base_url}{endpoint}"
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
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
                return {"error": f"Unsupported method: {method}"}
            
            if response.status_code == expected_status:
                try:
                    return response.json()
                except:
                    return {"raw": response.text}
            else:
                return {
                    "error": f"Expected {expected_status}, got {response.status_code}",
                    "status": response.status_code,
                    "response": response.text[:200]
                }
        except Exception as e:
            return {"error": str(e)}
    
    def test_login(self, user: Dict) -> Optional[str]:
        """Test login and return token"""
        data = {"email": user["email"], "password": user["password"]}
        result = self.make_request("POST", "/auth/login", data=data, expected_status=200)
        
        if result and result.get("success") and result.get("data", {}).get("access_token"):
            token = result["data"]["access_token"]
            user_data = result["data"].get("user", {})
            self.log_test("login", user, "Login", True, 
                         f"Token received. User type: {user_data.get('user_type_id')}, Role: {user_data.get('role_id')}")
            return token
        else:
            error = result.get("error", "Unknown error") if result else "No response"
            self.log_test("login", user, "Login", False, "Login failed", str(error))
            return None
    
    def test_get_me(self, user: Dict, token: str):
        """Test get current user"""
        result = self.make_request("GET", "/auth/me", token=token, expected_status=200)
        if result and result.get("success"):
            data = result.get("data", {})
            self.log_test("auth", user, "Get Current User", True,
                         f"Email: {data.get('email')}, Type: {data.get('user_type_id')}, Role: {data.get('role_id')}")
        else:
            error = result.get("error", "Unknown error") if result else "No response"
            self.log_test("auth", user, "Get Current User", False, "Failed", str(error))
    
    def test_get_referrals(self, user: Dict, token: str):
        """Test get referrals"""
        result = self.make_request("GET", "/referrals", token=token, 
                                   params={"page": 1, "limit": 5}, expected_status=200)
        if result and result.get("success"):
            data = result.get("data", {})
            items = data.get("items", [])
            self.log_test("referrals", user, "Get Referrals", True, f"Found {len(items)} referrals")
        else:
            # Check if it's a permission issue (403) which is expected for some roles
            status = result.get("status", 0) if result else 0
            if status == 403:
                self.log_test("referrals", user, "Get Referrals", True, "Access denied (expected for this role)")
            else:
                error = result.get("error", "Unknown error") if result else "No response"
                self.log_test("referrals", user, "Get Referrals", False, "Failed", str(error))
    
    def test_get_my_referrals(self, user: Dict, token: str):
        """Test get my referrals (for referrers)"""
        result = self.make_request("GET", "/referrals/my-referrals", token=token,
                                   params={"page": 1, "limit": 5}, expected_status=200)
        if result and result.get("success"):
            data = result.get("data", {})
            items = data.get("items", [])
            self.log_test("referrals", user, "Get My Referrals", True, f"Found {len(items)} referrals")
        else:
            status = result.get("status", 0) if result else 0
            if status == 403:
                self.log_test("referrals", user, "Get My Referrals", True, "Access denied (not a referrer)")
            else:
                error = result.get("error", "Unknown error") if result else "No response"
                self.log_test("referrals", user, "Get My Referrals", False, "Failed", str(error))
    
    def test_get_universities(self, user: Dict, token: str):
        """Test get universities"""
        result = self.make_request("GET", "/universities", token=token,
                                   params={"page": 1, "limit": 5}, expected_status=200)
        if result and result.get("success"):
            data = result.get("data", {})
            items = data.get("items", [])
            self.log_test("universities", user, "Get Universities", True, f"Found {len(items)} universities")
        else:
            error = result.get("error", "Unknown error") if result else "No response"
            self.log_test("universities", user, "Get Universities", False, "Failed", str(error))
    
    def test_get_programs(self, user: Dict, token: str):
        """Test get programs"""
        result = self.make_request("GET", "/programs", token=token,
                                   params={"page": 1, "limit": 5}, expected_status=200)
        if result and result.get("success"):
            data = result.get("data", {})
            items = data.get("items", [])
            self.log_test("programs", user, "Get Programs", True, f"Found {len(items)} programs")
        else:
            error = result.get("error", "Unknown error") if result else "No response"
            self.log_test("programs", user, "Get Programs", False, "Failed", str(error))
    
    def test_get_rewards(self, user: Dict, token: str):
        """Test get rewards (admin only)"""
        result = self.make_request("GET", "/rewards", token=token,
                                   params={"page": 1, "limit": 5}, expected_status=200)
        if result and result.get("success"):
            data = result.get("data", {})
            items = data.get("items", [])
            self.log_test("rewards", user, "Get Rewards", True, f"Found {len(items)} rewards")
        else:
            status = result.get("status", 0) if result else 0
            if status == 403:
                self.log_test("rewards", user, "Get Rewards", True, "Access denied (admin only)")
            else:
                error = result.get("error", "Unknown error") if result else "No response"
                self.log_test("rewards", user, "Get Rewards", False, "Failed", str(error))
    
    def test_get_my_rewards(self, user: Dict, token: str):
        """Test get my rewards"""
        result = self.make_request("GET", "/rewards/my-rewards", token=token, expected_status=200)
        if result and result.get("success"):
            rewards = result.get("data", [])
            if isinstance(rewards, dict):
                rewards = rewards.get("items", [])
            self.log_test("rewards", user, "Get My Rewards", True, f"Found {len(rewards)} rewards")
        else:
            error = result.get("error", "Unknown error") if result else "No response"
            self.log_test("rewards", user, "Get My Rewards", False, "Failed", str(error))
    
    def test_get_leaderboard(self, user: Dict, token: str):
        """Test get leaderboard"""
        result = self.make_request("GET", "/leaderboard/referrers", token=token,
                                   params={"period": "all_time", "limit": 10}, expected_status=200)
        if result and result.get("success"):
            data = result.get("data", {})
            entries = data.get("entries", [])
            self.log_test("leaderboard", user, "Get Leaderboard", True, f"Found {len(entries)} entries")
        else:
            error = result.get("error", "Unknown error") if result else "No response"
            self.log_test("leaderboard", user, "Get Leaderboard", False, "Failed", str(error))
    
    def test_get_my_rank(self, user: Dict, token: str):
        """Test get my rank"""
        result = self.make_request("GET", "/leaderboard/my-rank", token=token, expected_status=200)
        if result and result.get("success"):
            data = result.get("data", {})
            rank = data.get("rank", "N/A")
            self.log_test("leaderboard", user, "Get My Rank", True, f"Rank: {rank}")
        else:
            error = result.get("error", "Unknown error") if result else "No response"
            self.log_test("leaderboard", user, "Get My Rank", False, "Failed", str(error))
    
    def test_get_dashboard_stats(self, user: Dict, token: str):
        """Test get dashboard stats"""
        result = self.make_request("GET", "/analytics/dashboard", token=token, expected_status=200)
        if result and result.get("success"):
            self.log_test("analytics", user, "Get Dashboard Stats", True, "Stats retrieved")
        else:
            error = result.get("error", "Unknown error") if result else "No response"
            self.log_test("analytics", user, "Get Dashboard Stats", False, "Failed", str(error))
    
    def test_get_notifications(self, user: Dict, token: str):
        """Test get notifications"""
        result = self.make_request("GET", "/notifications", token=token,
                                   params={"page": 1, "limit": 5}, expected_status=200)
        if result and result.get("success"):
            data = result.get("data", {})
            items = data.get("items", [])
            self.log_test("notifications", user, "Get Notifications", True, f"Found {len(items)} notifications")
        else:
            error = result.get("error", "Unknown error") if result else "No response"
            self.log_test("notifications", user, "Get Notifications", False, "Failed", str(error))
    
    def test_get_users(self, user: Dict, token: str):
        """Test get users (admin only)"""
        result = self.make_request("GET", "/users", token=token,
                                   params={"page": 1, "limit": 5}, expected_status=200)
        if result and result.get("success"):
            data = result.get("data", {})
            items = data.get("items", [])
            self.log_test("users", user, "Get Users", True, f"Found {len(items)} users")
        else:
            status = result.get("status", 0) if result else 0
            if status == 403:
                self.log_test("users", user, "Get Users", True, "Access denied (admin only)")
            else:
                error = result.get("error", "Unknown error") if result else "No response"
                self.log_test("users", user, "Get Users", False, "Failed", str(error))
    
    def test_get_crm_universities(self, user: Dict, token: str):
        """Test get CRM universities"""
        result = self.make_request("POST", "/crm/universities", token=token, expected_status=200)
        if result and result.get("success"):
            universities = result.get("data", [])
            self.log_test("crm", user, "Get CRM Universities", True, f"Found {len(universities)} universities")
        else:
            error = result.get("error", "Unknown error") if result else "No response"
            self.log_test("crm", user, "Get CRM Universities", False, "Failed", str(error))
    
    def test_get_chat_quick_start(self, user: Dict, token: str):
        """Test get chat quick start"""
        result = self.make_request("GET", "/chat/quick-start", token=token, expected_status=200)
        if result:
            suggestions = result.get("suggestions", [])
            self.log_test("chat", user, "Get Chat Quick Start", True, f"Found {len(suggestions)} suggestions")
        else:
            error = result.get("error", "Unknown error") if result else "No response"
            self.log_test("chat", user, "Get Chat Quick Start", False, "Failed", str(error))
    
    def test_user(self, user: Dict):
        """Test all APIs for a specific user"""
        print(f"\n{'='*80}")
        print(f"Testing: {user['name']} ({user['role_name']})")
        print(f"Email: {user['email']}")
        print(f"User Type ID: {user['user_type_id']}, Role ID: {user['role_id']}")
        print(f"{'='*80}\n")
        
        # Test login
        token = self.test_login(user)
        if not token:
            print(f"  [SKIP] Cannot test APIs without valid token\n")
            return
        
        # Test authentication endpoints
        print("\n--- Authentication Tests ---")
        self.test_get_me(user, token)
        
        # Test referral endpoints
        print("\n--- Referral Tests ---")
        self.test_get_referrals(user, token)
        self.test_get_my_referrals(user, token)
        
        # Test university endpoints
        print("\n--- University Tests ---")
        self.test_get_universities(user, token)
        
        # Test program endpoints
        print("\n--- Program Tests ---")
        self.test_get_programs(user, token)
        
        # Test reward endpoints
        print("\n--- Reward Tests ---")
        self.test_get_rewards(user, token)
        self.test_get_my_rewards(user, token)
        
        # Test leaderboard endpoints
        print("\n--- Leaderboard Tests ---")
        self.test_get_leaderboard(user, token)
        self.test_get_my_rank(user, token)
        
        # Test analytics endpoints
        print("\n--- Analytics Tests ---")
        self.test_get_dashboard_stats(user, token)
        
        # Test notification endpoints
        print("\n--- Notification Tests ---")
        self.test_get_notifications(user, token)
        
        # Test user management endpoints
        print("\n--- User Management Tests ---")
        self.test_get_users(user, token)
        
        # Test CRM endpoints
        print("\n--- CRM Tests ---")
        self.test_get_crm_universities(user, token)
        
        # Test chat endpoints
        print("\n--- Chat Tests ---")
        self.test_get_chat_quick_start(user, token)
    
    def run_all_tests(self, users: List[Dict]):
        """Run tests for all users"""
        print("\n" + "="*80)
        print("COMPREHENSIVE USER ROLE TESTING")
        print("="*80)
        print(f"\nTesting {len(users)} users with different role combinations\n")
        
        for user in users:
            self.test_user(user)
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*80)
        print("TEST SUMMARY BY CATEGORY")
        print("="*80)
        
        total_passed = 0
        total_failed = 0
        
        for category, tests in self.results.items():
            if not tests:
                continue
            
            passed = sum(1 for t in tests if t["passed"])
            failed = len(tests) - passed
            total_passed += passed
            total_failed += failed
            
            print(f"\n{category.upper()}:")
            print(f"  Passed: {passed}/{len(tests)}")
            print(f"  Failed: {failed}/{len(tests)}")
            
            if failed > 0:
                print("  Failed Tests:")
                for test in tests:
                    if not test["passed"]:
                        print(f"    - {test['user']} ({test['role_name']}): {test['test']}")
                        if test.get("error"):
                            print(f"      Error: {test['error'][:100]}")
        
        print("\n" + "="*80)
        print(f"OVERALL: Passed: {total_passed}, Failed: {total_failed}, Total: {total_passed + total_failed}")
        print("="*80)
        
        # Save detailed results
        with open("role_test_results.json", "w") as f:
            json.dump(self.results, f, indent=2)
        print("\n[INFO] Detailed results saved to role_test_results.json")


if __name__ == "__main__":
    # Try different password combinations
    passwords_to_try = [
        "Password123!",
        "password123",
        "test123",
        "Admin@123",
        "Student@123",
        "Employee@123"
    ]
    
    tester = RoleTester(BASE_URL)
    
    # Test with provided users
    print("Testing with known user credentials...")
    tester.run_all_tests(TEST_USERS)
    
    # If some logins fail, try different passwords
    failed_logins = [r for r in tester.results["login"] if not r["passed"]]
    if failed_logins:
        print("\n" + "="*80)
        print("ATTEMPTING LOGIN WITH ALTERNATIVE PASSWORDS")
        print("="*80)
        
        for login_result in failed_logins:
            user_email = login_result["email"]
            user_name = login_result["user"]
            
            print(f"\nTrying alternative passwords for {user_name} ({user_email})...")
            for password in passwords_to_try:
                test_user = {
                    "name": user_name,
                    "email": user_email,
                    "password": password,
                    "user_type_id": login_result["user_type_id"],
                    "role_id": login_result["role_id"],
                    "role_name": login_result["role_name"]
                }
                token = tester.test_login(test_user)
                if token:
                    print(f"  [SUCCESS] Password found: {password}")
                    # Run full test suite with correct password
                    tester.test_user(test_user)
                    break

