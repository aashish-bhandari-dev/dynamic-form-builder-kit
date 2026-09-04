export { addFormBuilder, type AddOptions } from './commands/add';
export {
    FORM_BUILDER_COMPONENT_FILES,
    FORM_BUILDER_TYPES_FILE,
    FORM_BUILDER_UTILS_FILE,
    NPM_DEPENDENCIES,
    SHADCN_COMPONENTS,
} from './registry-manifest';

// Export all shared types for consumers (e.g. backend routes, API handlers, form schemas)
export type {
    FormField,
    FormRow,
    FormFieldType,
    FormContentField,
    FormContent,
    FormPayload,
    CustomFieldSet,
    PaletteFieldTemplate,
    DefaultFieldSpec,
} from './types';
