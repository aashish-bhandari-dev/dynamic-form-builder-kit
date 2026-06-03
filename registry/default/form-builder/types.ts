export interface FormField {
    id: string;
    type: string;
    name?: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
    minValue?: number;
    maxValue?: number;
    step?: number;
    rows?: number;
    accept?: string;
    helpText?: string;
    columnWidth?: 'full' | 'half' | 'third' | 'quarter';
    orientation?: 'horizontal' | 'vertical';
    rowId: string;
    isDefault?: boolean;
    isDefaultRequired?: boolean;
}

export interface FormRow {
    id: string;
    fields: string[];
}

export type FormFieldType =
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'url'
    | 'tel'
    | 'textarea'
    | 'date'
    | 'time'
    | 'datetime-local'
    | 'checkbox'
    | 'radio'
    | 'select'
    | 'multiselect'
    | 'file'
    | 'toggle'
    | 'slider'
    | 'rating'
    | 'header'
    | 'paragraph'
    | 'image'
    | 'hidden';

export interface FormContentField {
    id: string;
    type: FormFieldType | string;
    name?: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    columnWidth?: FormField['columnWidth'];
    rowId: string;
    options?: string[];
    rows?: number;
    minValue?: number;
    maxValue?: number;
    step?: number;
    accept?: string;
    helpText?: string;
    orientation?: FormField['orientation'];
    isDefault?: boolean;
    isDefaultRequired?: boolean;
}

export interface FormContent {
    fields: FormContentField[];
    rows: FormRow[];
}

export interface FormPayload {
    title: string;
    content: {
        fields: FormContentField[];
        rows: FormRow[];
    };
}

export interface CustomFieldSet {
    id: string;
    name: string;
    fields: FormField[];
}

export type PaletteFieldTemplate = Omit<FormField, 'id' | 'rowId'>;
