/**
 * Form Validation Utilities
 * Provides consistent validation across all forms in the application
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FormErrors {
  [key: string]: string;
}

// ==================== Basic Validators ====================

/**
 * Check if a field is empty
 */
export const isRequired = (value: string | undefined | null, fieldName: string = 'This field'): ValidationResult => {
  if (!value || value.toString().trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true };
};

/**
 * Validate phone number (Indian format)
 */
export const isValidPhone = (phone: string): ValidationResult => {
  // Remove spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  
  // Indian phone number: 10 digits, optionally with +91 prefix
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  
  if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid 10-digit phone number' };
  }
  return { isValid: true };
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): ValidationResult => {
  if (!password || password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  return { isValid: true };
};

/**
 * Check if passwords match
 */
export const passwordsMatch = (password: string, confirmPassword: string): ValidationResult => {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  return { isValid: true };
};

/**
 * Validate minimum length
 */
export const minLength = (value: string, min: number, fieldName: string = 'This field'): ValidationResult => {
  if (!value || value.length < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min} characters` };
  }
  return { isValid: true };
};

/**
 * Validate maximum length
 */
export const maxLength = (value: string, max: number, fieldName: string = 'This field'): ValidationResult => {
  if (value && value.length > max) {
    return { isValid: false, error: `${fieldName} must not exceed ${max} characters` };
  }
  return { isValid: true };
};

/**
 * Validate name (letters, spaces, and common characters)
 */
export const isValidName = (name: string, fieldName: string = 'Name'): ValidationResult => {
  if (!name || name.trim().length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` };
  }
  
  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-'.]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
  }
  
  return { isValid: true };
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string, fieldName: string = 'URL'): ValidationResult => {
  if (!url) {
    return { isValid: true }; // URL is optional
  }
  
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: `Please enter a valid ${fieldName}` };
  }
};

/**
 * Validate number is positive
 */
export const isPositiveNumber = (value: number | string, fieldName: string = 'Value'): ValidationResult => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num) || num <= 0) {
    return { isValid: false, error: `${fieldName} must be a positive number` };
  }
  return { isValid: true };
};

/**
 * Validate number is within range
 */
export const isInRange = (value: number | string, min: number, max: number, fieldName: string = 'Value'): ValidationResult => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num) || num < min || num > max) {
    return { isValid: false, error: `${fieldName} must be between ${min} and ${max}` };
  }
  return { isValid: true };
};

/**
 * Validate date is not in the past
 */
export const isNotPastDate = (date: string | Date, fieldName: string = 'Date'): ValidationResult => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (inputDate < today) {
    return { isValid: false, error: `${fieldName} cannot be in the past` };
  }
  return { isValid: true };
};

/**
 * Validate date is valid
 */
export const isValidDate = (date: string, fieldName: string = 'Date'): ValidationResult => {
  if (!date) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return { isValid: false, error: `Please enter a valid ${fieldName}` };
  }
  return { isValid: true };
};

/**
 * Validate percentage (0-100)
 */
export const isValidPercentage = (value: number | string, fieldName: string = 'Percentage'): ValidationResult => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num) || num < 0 || num > 100) {
    return { isValid: false, error: `${fieldName} must be between 0 and 100` };
  }
  return { isValid: true };
};

/**
 * Validate Indian Pincode
 */
export const isValidPincode = (pincode: string): ValidationResult => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  
  if (!pincode || !pincodeRegex.test(pincode)) {
    return { isValid: false, error: 'Please enter a valid 6-digit pincode' };
  }
  return { isValid: true };
};

/**
 * Validate PAN Number
 */
export const isValidPAN = (pan: string): ValidationResult => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  
  if (!pan || !panRegex.test(pan.toUpperCase())) {
    return { isValid: false, error: 'Please enter a valid PAN number (e.g., ABCDE1234F)' };
  }
  return { isValid: true };
};

/**
 * Validate Aadhaar Number
 */
export const isValidAadhaar = (aadhaar: string): ValidationResult => {
  // Remove spaces
  const cleanAadhaar = aadhaar.replace(/\s/g, '');
  const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
  
  if (!cleanAadhaar || !aadhaarRegex.test(cleanAadhaar)) {
    return { isValid: false, error: 'Please enter a valid 12-digit Aadhaar number' };
  }
  return { isValid: true };
};

// ==================== Form Validators ====================

/**
 * Validate Login Form
 */
export const validateLoginForm = (data: { email: string; password: string }): FormErrors => {
  const errors: FormErrors = {};
  
  const emailResult = isValidEmail(data.email);
  if (!emailResult.isValid) errors.email = emailResult.error!;
  
  const passwordRequired = isRequired(data.password, 'Password');
  if (!passwordRequired.isValid) errors.password = passwordRequired.error!;
  
  return errors;
};

/**
 * Validate Signup Form
 */
export const validateSignupForm = (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  organization?: string;
}): FormErrors => {
  const errors: FormErrors = {};
  
  // Name validation
  const nameResult = isValidName(data.name, 'Full name');
  if (!nameResult.isValid) errors.name = nameResult.error!;
  
  // Email validation
  const emailResult = isValidEmail(data.email);
  if (!emailResult.isValid) errors.email = emailResult.error!;
  
  // Phone validation
  const phoneResult = isValidPhone(data.phone);
  if (!phoneResult.isValid) errors.phone = phoneResult.error!;
  
  // Password validation
  const passwordResult = isValidPassword(data.password);
  if (!passwordResult.isValid) errors.password = passwordResult.error!;
  
  // Confirm password
  const matchResult = passwordsMatch(data.password, data.confirmPassword);
  if (!matchResult.isValid) errors.confirmPassword = matchResult.error!;
  
  // Organization (optional but validate if provided)
  if (data.organization) {
    const orgLength = maxLength(data.organization, 255, 'Organization');
    if (!orgLength.isValid) errors.organization = orgLength.error!;
  }
  
  return errors;
};

/**
 * Validate Forgot Password Form
 */
export const validateForgotPasswordForm = (data: { email: string }): FormErrors => {
  const errors: FormErrors = {};
  
  const emailResult = isValidEmail(data.email);
  if (!emailResult.isValid) errors.email = emailResult.error!;
  
  return errors;
};

/**
 * Validate Reset Password Form
 */
export const validateResetPasswordForm = (data: {
  password: string;
  confirmPassword: string;
}): FormErrors => {
  const errors: FormErrors = {};
  
  const passwordResult = isValidPassword(data.password);
  if (!passwordResult.isValid) errors.password = passwordResult.error!;
  
  const matchResult = passwordsMatch(data.password, data.confirmPassword);
  if (!matchResult.isValid) errors.confirmPassword = matchResult.error!;
  
  return errors;
};

/**
 * Validate Add Referral Form
 */
export const validateReferralForm = (data: {
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  universityId?: string;
  programId?: string;
  notes?: string;
}): FormErrors => {
  const errors: FormErrors = {};
  
  // Student name
  const nameResult = isValidName(data.studentName, 'Student name');
  if (!nameResult.isValid) errors.studentName = nameResult.error!;
  
  // Student email
  const emailResult = isValidEmail(data.studentEmail);
  if (!emailResult.isValid) errors.studentEmail = emailResult.error!;
  
  // Student phone
  const phoneResult = isValidPhone(data.studentPhone);
  if (!phoneResult.isValid) errors.studentPhone = phoneResult.error!;
  
  // University (required)
  if (!data.universityId) {
    errors.universityId = 'Please select a university';
  }
  
  // Program (required)
  if (!data.programId) {
    errors.programId = 'Please select a program';
  }
  
  return errors;
};

/**
 * Validate University Form
 */
export const validateUniversityForm = (data: {
  name: string;
  shortName?: string;
  description?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  contactEmail?: string;
  contactPhone?: string;
}): FormErrors => {
  const errors: FormErrors = {};
  
  // Name (required)
  const nameRequired = isRequired(data.name, 'University name');
  if (!nameRequired.isValid) {
    errors.name = nameRequired.error!;
  } else {
    const nameLength = minLength(data.name, 3, 'University name');
    if (!nameLength.isValid) errors.name = nameLength.error!;
  }
  
  // Website (optional but validate if provided)
  if (data.website) {
    const urlResult = isValidUrl(data.website, 'Website URL');
    if (!urlResult.isValid) errors.website = urlResult.error!;
  }
  
  // Contact email (optional but validate if provided)
  if (data.contactEmail) {
    const emailResult = isValidEmail(data.contactEmail);
    if (!emailResult.isValid) errors.contactEmail = emailResult.error!;
  }
  
  // Contact phone (optional but validate if provided)
  if (data.contactPhone) {
    const phoneResult = isValidPhone(data.contactPhone);
    if (!phoneResult.isValid) errors.contactPhone = phoneResult.error!;
  }
  
  // Pincode (optional but validate if provided)
  if (data.pincode) {
    const pincodeResult = isValidPincode(data.pincode);
    if (!pincodeResult.isValid) errors.pincode = pincodeResult.error!;
  }
  
  return errors;
};

/**
 * Validate Program Form
 */
export const validateProgramForm = (data: {
  name: string;
  degree?: string;
  duration?: string;
  fees?: number | string;
  description?: string;
  eligibility?: string;
}): FormErrors => {
  const errors: FormErrors = {};
  
  // Name (required)
  const nameRequired = isRequired(data.name, 'Program name');
  if (!nameRequired.isValid) {
    errors.name = nameRequired.error!;
  } else {
    const nameLength = minLength(data.name, 3, 'Program name');
    if (!nameLength.isValid) errors.name = nameLength.error!;
  }
  
  // Fees (optional but validate if provided)
  if (data.fees !== undefined && data.fees !== '') {
    const feesResult = isPositiveNumber(data.fees, 'Fees');
    if (!feesResult.isValid) errors.fees = feesResult.error!;
  }
  
  return errors;
};

/**
 * Validate Referee/Counselor Form
 */
export const validateRefereeForm = (data: {
  name: string;
  email: string;
  phone: string;
  organization?: string;
  universityId?: string;
}): FormErrors => {
  const errors: FormErrors = {};
  
  // Name validation
  const nameResult = isValidName(data.name, 'Full name');
  if (!nameResult.isValid) errors.name = nameResult.error!;
  
  // Email validation
  const emailResult = isValidEmail(data.email);
  if (!emailResult.isValid) errors.email = emailResult.error!;
  
  // Phone validation
  const phoneResult = isValidPhone(data.phone);
  if (!phoneResult.isValid) errors.phone = phoneResult.error!;
  
  return errors;
};

/**
 * Helper to check if form has any errors
 */
export const hasErrors = (errors: FormErrors): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Helper to get first error message
 */
export const getFirstError = (errors: FormErrors): string | null => {
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : null;
};

