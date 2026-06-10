import type { PaletteFieldTemplate, CustomFieldSet } from '@/types/form-builder.types';

export type DefaultFieldSpec = {
    key: string;
    id: string;
    rowId: string;
    type: string;
    label: string;
    placeholder: string;
    required: boolean;
    aliases?: string[];
};

/**
 * Static Default Field Specifications
 * These are the pinned/default fields that are always loaded in the form builder.
 */
const DEFAULT_FIELD_SPECS: DefaultFieldSpec[] = [
    {
        key: 'full_name',
        id: 'default-full-name',
        rowId: 'row-default-full-name',
        type: 'text',
        label: 'Full Name',
        placeholder: 'John Doe',
        required: true,
    },
    {
        key: 'email',
        id: 'default-email',
        rowId: 'row-default-email',
        type: 'email',
        label: 'Email',
        placeholder: 'john@example.com',
        required: true,
    },
    {
        key: 'phone_number',
        id: 'default-phone',
        rowId: 'row-default-phone',
        type: 'tel',
        label: 'Phone Number',
        placeholder: '+1 (555) 000-0000',
        required: false,
        aliases: ['phone'],
    },
];

/**
 * Static Palette Fields
 * Single fields available for addition in the left sidebar palette.
 */
const DEFAULT_PALETTE_FIELDS: PaletteFieldTemplate[] = [
    {
        type: 'select',
        name: 'country',
        label: 'Country',
        options: [
            'United States',
            'Canada',
            'United Kingdom',
            'Australia',
            'India',
            'Japan',
            'Other',
        ],
        required: false,
        columnWidth: 'full',
    },
    {
        type: 'date',
        name: 'date_of_birth',
        label: 'Date of Birth',
        required: false,
        columnWidth: 'full',
    },
    {
        type: 'radio',
        name: 'gender',
        label: 'Gender',
        options: ['Male', 'Female', 'Other', 'Prefer not to say'],
        required: false,
        columnWidth: 'full',
    },
    {
        type: 'checkbox',
        name: 'interests',
        label: 'Interests',
        options: ['Technology', 'Business', 'Education', 'Sports', 'Travel', 'Entertainment'],
        required: false,
        columnWidth: 'full',
    },
    {
        type: 'textarea',
        name: 'message',
        label: 'Message',
        placeholder: 'Enter your message...',
        required: false,
        columnWidth: 'full',
    },
];

/**
 * Static Custom Field Sets
 * Grouped presets of fields that can be added to the canvas at once.
 */
const DEFAULT_CUSTOM_FIELD_SETS: CustomFieldSet[] = [
    {
        id: 'address-set',
        name: 'Address Information',
        fields: [
            {
                id: 'a1',
                type: 'text',
                name: 'temporary_address',
                label: 'Temporary Address',
                placeholder: 'Enter temporary address',
                required: false,
                columnWidth: 'full',
                rowId: 'r1',
            },
            {
                id: 'a2',
                type: 'text',
                name: 'permanent_address',
                label: 'Permanent Address',
                placeholder: 'Enter permanent address',
                required: false,
                columnWidth: 'full',
                rowId: 'r2',
            },
        ],
    },
    {
        id: 'preferences-set',
        name: 'Preferences',
        fields: [
            {
                id: 'p1',
                type: 'select',
                name: 'preferred_contact',
                label: 'Preferred Contact Method',
                options: ['Email', 'Phone', 'SMS'],
                required: true,
                columnWidth: 'full',
                rowId: 'r1',
            },
            {
                id: 'p2',
                type: 'checkbox',
                name: 'interests',
                label: 'Areas of Interest',
                options: ['Technology', 'Business', 'Marketing', 'Design', 'Finance'],
                required: false,
                columnWidth: 'full',
                rowId: 'r2',
            },
            {
                id: 'p3',
                type: 'radio',
                name: 'newsletter',
                label: 'Subscribe to Newsletter',
                options: ['Yes', 'No'],
                required: false,
                columnWidth: 'full',
                rowId: 'r3',
            },
        ],
    },
];

/**
 * Fetches default field specifications.
 * Replace the return statement with an API fetch call if needed in the future.
 */
export async function fetchFieldSpecs(): Promise<DefaultFieldSpec[]> {
    // Example:
    // const response = await fetch('/api/form-builder/field-specs');
    // return response.json();
    return DEFAULT_FIELD_SPECS;
}

/**
 * Fetches available single fields for the palette.
 * Replace the return statement with an API fetch call if needed in the future.
 */
export async function fetchPaletteFields(): Promise<PaletteFieldTemplate[]> {
    // Example:
    // const response = await fetch('/api/form-builder/palette-fields');
    // return response.json();
    return DEFAULT_PALETTE_FIELDS;
}

/**
 * Fetches custom grouped field sets.
 * Replace the return statement with an API fetch call if needed in the future.
 */
export async function fetchCustomFieldSets(): Promise<CustomFieldSet[]> {
    // Example:
    // const response = await fetch('/api/form-builder/custom-field-sets');
    // return response.json();
    return DEFAULT_CUSTOM_FIELD_SETS;
}
