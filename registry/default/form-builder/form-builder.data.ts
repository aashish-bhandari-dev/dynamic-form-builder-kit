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
        type: 'checkbox',
        name: 'interested_country',
        label: 'Interested Country',
        options: [
            'Australia',
            'United States of America',
            'Canada',
            'United Kingdom',
            'India',
            'Japan',
            'Others',
        ],
        required: false,
        columnWidth: 'full',
    },
    {
        type: 'text',
        name: 'interested_university',
        label: 'Interested University',
        placeholder: 'Enter interested university...',
        required: false,
        columnWidth: 'full',
    },
    {
        type: 'text',
        name: 'interested_course',
        label: 'Interested Course',
        placeholder: 'Enter interested course...',
        required: false,
        columnWidth: 'full',
    },
    {
        type: 'select',
        name: 'highest_qualification',
        label: 'Highest Qualification',
        options: [
            'SEE',
            'SLC',
            'VET',
            'Diploma',
            'Bachelor Degree',
            'Masters Degree',
            'M Phil',
            'PHD',
        ],
        required: false,
        columnWidth: 'full',
    },
    {
        type: 'text',
        name: 'recent_college_name',
        label: 'Recent College Name',
        placeholder: 'Enter recent college name...',
        required: false,
        columnWidth: 'full',
    },
    {
        type: 'radio',
        name: 'english_proficiency_test_given',
        label: 'English Proficiency Test Given',
        options: ['Yes', 'No'],
        required: false,
        columnWidth: 'full',
    },
    {
        type: 'text',
        name: 'pass_out_year',
        label: 'Pass out Year',
        placeholder: 'Enter pass out year...',
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
        id: 'edu-set-5',
        name: 'Financial Information',
        fields: [
            {
                id: 'f1',
                type: 'select',
                name: 'funding_source',
                label: 'Source of Funding',
                options: ['Self', 'Parents', 'Sponsor', 'Loan'],
                required: true,
                columnWidth: 'full',
                rowId: 'r1',
            },
            {
                id: 'f2',
                type: 'number',
                name: 'estimated_budget',
                label: 'Estimated Budget (USD)',
                placeholder: '20000',
                required: true,
                columnWidth: 'half',
                rowId: 'r2',
            },
            {
                id: 'f3',
                type: 'select',
                name: 'education_loan',
                label: 'Education Loan',
                options: ['Yes', 'No'],
                required: true,
                columnWidth: 'half',
                rowId: 'r2',
            },
        ],
    },
    {
        id: 'edu-set-3',
        name: 'Language Test Scores',
        fields: [
            {
                id: 'l1',
                type: 'select',
                name: 'english_test',
                label: 'English Proficiency Test',
                options: ['IELTS', 'PTE', 'TOEFL', 'Duolingo', 'Not Taken'],
                required: true,
                columnWidth: 'full',
                rowId: 'r1',
            },
            {
                id: 'l2',
                type: 'number',
                name: 'overall_score',
                label: 'Overall Score',
                placeholder: '6.5',
                required: false,
                columnWidth: 'half',
                rowId: 'r2',
            },
            {
                id: 'l3',
                type: 'number',
                name: 'test_year',
                label: 'Test Year',
                placeholder: '2024',
                required: false,
                columnWidth: 'half',
                rowId: 'r2',
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
