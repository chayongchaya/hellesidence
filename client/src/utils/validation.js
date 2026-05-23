/**
 * Centralized validation rules for the Hostel Management System
 */

// ─── Regex Patterns ────────────────────────────────────────────────────────────

/** Thai phone: 0X-XXXX-XXXX or 0XXXXXXXXX (10 digits, starts with 0) */
export const PHONE_REGEX = /^0[0-9]{1,2}[-\s]?[0-9]{3,4}[-\s]?[0-9]{4}$/

/** Thai national ID: 13 digits */
export const ID_CARD_REGEX = /^[0-9]{13}$/

/** Thai Tax ID: 13 digits */
export const TAX_ID_REGEX = /^[0-9]{13}$/

/** Email */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Positive number (price, amount) */
export const POSITIVE_NUMBER_REGEX = /^[0-9]+(\.[0-9]{1,2})?$/

/** Room number: alphanumeric, e.g. 101, A01, B-02 */
export const ROOM_NO_REGEX = /^[A-Za-z0-9][A-Za-z0-9\-]*$/

// ─── Validator Functions ───────────────────────────────────────────────────────

export function validatePhone(value) {
  if (!value || !value.trim()) return 'Phone number is required'
  const clean = value.replace(/[\s\-]/g, '')
  if (!/^0[0-9]{9}$/.test(clean)) return 'Must be 10 digits starting with 0 (e.g. 081-234-5678)'
  return null
}

export function validateIdCard(value) {
  if (!value || !value.trim()) return 'ID card number is required'
  const clean = value.replace(/[\s\-]/g, '')
  if (!ID_CARD_REGEX.test(clean)) return 'ID card must be 13 digits (numbers only)'
  return null
}

export function validateTaxId(value) {
  if (!value || !value.trim()) return null // optional field
  const clean = value.replace(/[\s\-]/g, '')
  if (!TAX_ID_REGEX.test(clean)) return 'Tax ID must be 13 digits (numbers only)'
  return null
}

export function validateEmail(value) {
  if (!value || !value.trim()) return null // often optional
  if (!EMAIL_REGEX.test(value.trim())) return 'Invalid email format (e.g. example@email.com)'
  return null
}

export function validateRequiredEmail(value) {
  if (!value || !value.trim()) return 'Email is required'
  if (!EMAIL_REGEX.test(value.trim())) return 'Invalid email format (e.g. example@email.com)'
  return null
}

export function validatePositiveNumber(value, label = 'Value') {
  if (value === '' || value === null || value === undefined) return `Please enter ${label}`
  if (isNaN(Number(value)) || Number(value) < 0) return `${label} must be a non-negative number`
  return null
}

export function validateRoomNo(value) {
  if (!value || !value.trim()) return 'Please enter Room No'
  if (!ROOM_NO_REGEX.test(value.trim())) return 'Room number must be alphanumeric (e.g. 101, A01)'
  return null
}

export function validateRequired(value, label = 'this field') {
  if (!value || (typeof value === 'string' && !value.trim())) return `Please enter ${label}`
  return null
}

// ─── Auto-format helpers ───────────────────────────────────────────────────────

/** Format Thai phone input as user types: 081-234-5678 */
export function formatPhoneInput(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}

/** Format ID card input as user types: X-XXXX-XXXXX-XX-X */
export function formatIdCardInput(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 13)
  if (digits.length <= 1) return digits
  if (digits.length <= 5) return `${digits.slice(0, 1)}-${digits.slice(1)}`
  if (digits.length <= 10) return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10)}`
  return `${digits.slice(0, 1)}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12)}`
}

/** Strip formatting for storage */
export function stripFormatting(value) {
  return value ? value.replace(/[\s\-]/g, '') : value
}

// ─── Field Error Component helper ─────────────────────────────────────────────

/** Run multiple validators, return first error */
export function runValidators(value, ...validators) {
  for (const fn of validators) {
    const err = fn(value)
    if (err) return err
  }
  return null
}
