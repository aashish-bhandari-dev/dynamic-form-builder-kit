/**
 * Normalizes any string into a valid, safe form field name.
 * e.g., "Full Name" -> "full_name", "123 Phone" -> "field_123_phone"
 */
export function toFormFieldName(value: string): string {
    const trimmed = value.trim().toLowerCase();
    const normalized = trimmed
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
    if (!normalized) return 'field';
    if (/^\d/.test(normalized)) return `field_${normalized}`;
    return normalized;
}
