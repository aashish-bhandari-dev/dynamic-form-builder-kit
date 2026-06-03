export function toFormFieldName(value: string): string {
    const trimmed = value.trim().toLowerCase();
    const normalized = trimmed
        .replaceAll(/[^a-z0-9]+/g, '_')
        .replaceAll(/_+/g, '_')
        .replaceAll(/^_+|_+$/g, '');
    if (!normalized) return 'field';
    if (/^\d/.test(normalized)) return `field_${normalized}`;
    return normalized;
}
