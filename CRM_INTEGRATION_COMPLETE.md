# CRM-Direct Referral Integration - Complete

## Overview
Refactored the referral submission system to work **CRM-first** without requiring local university/program records. The system now creates leads directly in the Digivarsity CRM using CRM IDs.

---

## Database Changes

### 1. **Universities Table**
```sql
ALTER TABLE universities ADD COLUMN crm_university_id VARCHAR(100);
CREATE INDEX idx_universities_crm_id ON universities(crm_university_id);
```
- Added `crm_university_id` field to store Digivarsity CRM University ID
- Indexed for fast lookups

### 2. **Programs Table**
```sql
ALTER TABLE programs ADD COLUMN crm_course_id VARCHAR(100);
CREATE INDEX idx_programs_crm_id ON programs(crm_course_id);
```
- Added `crm_course_id` field to store Digivarsity CRM Course ID
- Indexed for fast lookups

### 3. **Referrals Table**
```sql
ALTER TABLE referrals ALTER COLUMN university_id DROP NOT NULL;
ALTER TABLE referrals ALTER COLUMN program_id DROP NOT NULL;
ALTER TABLE referrals ADD COLUMN crm_university_id VARCHAR(100);
ALTER TABLE referrals ADD COLUMN crm_course_id VARCHAR(100);
CREATE INDEX idx_referrals_crm_university_id ON referrals(crm_university_id);
CREATE INDEX idx_referrals_crm_course_id ON referrals(crm_course_id);
```
- Made `university_id` and `program_id` nullable (to support CRM-only referrals)
- Added `crm_university_id` and `crm_course_id` fields
- Indexed for fast lookups

---

## Backend Changes

### 1. **Models Updated**

#### `backend/app/models/university.py`
```python
crm_university_id = Column(String(100), nullable=True, index=True, unique=True)
```

#### `backend/app/models/program.py`
```python
crm_course_id = Column(String(100), nullable=True, index=True)
```

#### `backend/app/models/referral.py`
```python
university_id = Column(UUID(as_uuid=True), ForeignKey("universities.id"), nullable=True, index=True)
program_id = Column(UUID(as_uuid=True), ForeignKey("programs.id"), nullable=True, index=True)
crm_university_id = Column(String(100), nullable=True, index=True)
crm_course_id = Column(String(100), nullable=True, index=True)
```

### 2. **Schemas Updated**

#### `backend/app/schemas/referral.py`
```python
class ReferralSubmit(BaseModel):
    """Submit referral schema (referrer) - CRM-first approach"""
    referee_name: str = Field(..., min_length=2, max_length=255)
    referee_email: EmailStr
    referee_phone: str = Field(..., min_length=10, max_length=20)
    # CRM IDs are required for direct CRM integration
    crm_university_id: int = Field(..., description="CRM University ID")
    crm_course_id: int = Field(..., description="CRM Course ID")
    # Local IDs are optional (for backwards compatibility)
    university_id: Optional[UUID] = None
    program_id: Optional[UUID] = None
```

### 3. **Services Updated**

#### `backend/app/services/referral_service.py`
- **CRM-first approach**: No longer requires local university/program records
- **Flexible matching**: Tries to find local records by CRM ID or creates placeholders
- **Direct CRM integration**: Uses CRM IDs directly for lead creation
- **Stores CRM IDs**: Saves CRM IDs in referral record for tracking

#### `backend/app/services/crm_service.py`
- **Accepts CRM IDs**: `create_lead_sync` now accepts `crm_university_id` and `crm_course_id` parameters
- **Uses provided IDs**: Uses CRM IDs directly in lead creation payload
- **Lead Owner**: Uses configured UUID `8916142a-22b9-4fff-9c81-0fd166d963ce`

---

## Frontend Changes

### 1. **Simplified Logic**
- **Removed local matching**: No longer tries to match CRM universities/programs with local records during selection
- **CRM-only submission**: Submits directly with CRM IDs
- **Cleaner code**: Removed complex matching logic (500+ lines reduced to ~300 lines)

### 2. **Updated Interfaces**

#### `frontend/src/lib/api/universities.ts`
```typescript
export interface University {
  // ... existing fields
  crm_university_id?: string;
}
```

#### `frontend/src/lib/api/programs.ts`
```typescript
export interface Program {
  // ... existing fields
  crm_course_id?: string;
}
```

#### `frontend/src/lib/api/referrals.ts`
```typescript
export interface ReferralSubmitRequest {
  referee_name: string;
  referee_email: string;
  referee_phone: string;
  crm_university_id: number;  // Required
  crm_course_id: number;  // Required
  university_id?: string;  // Optional
  program_id?: string;  // Optional
  notes?: string;
}
```

### 3. **Refactored Component**
`frontend/src/pages/ReferrerAddReferral.tsx`:
- Simplified from ~1000 lines to ~350 lines
- Works directly with CRM data
- No complex matching logic
- Better error handling
- Cleaner state management

---

## How It Works Now

### **Submission Flow:**

1. **User selects university from CRM dropdown**
   - Dropdown shows universities from Digivarsity CRM
   - Falls back to local universities if CRM unavailable

2. **User selects program from CRM dropdown**
   - Dropdown shows courses from Digivarsity CRM for selected university
   - Falls back to local programs if CRM unavailable

3. **User submits form**
   - Frontend sends: `referee_name`, `referee_email`, `referee_phone`, `crm_university_id`, `crm_course_id`
   - Backend receives CRM IDs
   - Backend tries to find local university/program (optional)
   - Backend creates CRM lead using CRM IDs
   - Backend saves referral with CRM IDs to database
   - Returns success with referral code

### **CRM Lead Creation:**

```json
{
  "full_name": "Student Name",
  "mobile_number": "9876543210",
  "email": "student@example.com",
  "university_interested": 7,  // CRM University ID
  "course": 4463,  // CRM Course ID
  "lead_owner": "8916142a-22b9-4fff-9c81-0fd166d963ce",  // Lead Owner UUID
  "lead_channel": 0,
  "source_medium": 0,
  "country": "INDIA",
  "remark": "Referral from: Referrer Name (email). Program: Course Name at University Name. Referral Code: XXX-YYY-ZZZZ",
  "enrolment_details": {
    "enrollmentno": "XXX-YYY-ZZZZ"
  }
}
```

---

## Benefits

### ✅ **No More Matching Errors**
- No "university not found" errors
- No complex name matching logic
- Works with any CRM university/program

### ✅ **CRM-First Approach**
- Uses CRM data as source of truth
- Direct integration with Digivarsity CRM
- No dependency on local university/program records

### ✅ **Flexible**
- Can work with or without local records
- Backwards compatible (still stores local IDs if available)
- Graceful fallbacks

### ✅ **Simpler Code**
- Reduced from ~1000 lines to ~350 lines in frontend
- Cleaner logic
- Easier to maintain

### ✅ **Better UX**
- Universities always show in dropdown
- No confusing validation errors
- Clear error messages

---

## Configuration

### **Lead Owner UUID**
Set in `backend/app/config.py`:
```python
CRM_DEFAULT_LEAD_OWNER: str = "8916142a-22b9-4fff-9c81-0fd166d963ce"
```

### **CRM API Settings**
```python
CRM_BASE_URL: str = "https://uatcrmapi.digivarsity.com"
CRM_SESSION_TOKEN: str = "..."
CRM_BEARER_TOKEN: str = "..."
CRM_ENABLED: bool = True
```

---

## Testing

### **Frontend Testing:**
1. Navigate to `/referrer/add`
2. Fill in student details
3. Select university from dropdown (CRM data)
4. Select program from dropdown (CRM data)
5. Submit

### **Backend Testing:**
```bash
cd backend
python test_crm_direct.py
```

### **Expected Result:**
- ✅ Lead created in Digivarsity CRM
- ✅ Referral saved to database with CRM IDs
- ✅ Referral code generated
- ✅ Expected reward calculated
- ✅ Lead owner assigned to configured UUID

---

## Migration Files

- `backend/migrations/add_crm_ids.sql` - SQL migration script
- Applied automatically via Python script

---

## Summary

The referral system now works **CRM-first** without requiring local university/program records. This eliminates matching errors and provides a seamless integration with the Digivarsity CRM system. The lead owner UUID `8916142a-22b9-4fff-9c81-0fd166d963ce` is automatically assigned to all created leads.

**Status:** ✅ Complete and Ready for Testing

