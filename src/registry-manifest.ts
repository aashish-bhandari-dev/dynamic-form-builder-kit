export const FORM_BUILDER_COMPONENT_FILES = [
    'FormBuilder.tsx',
    'FieldPalette.tsx',
    'FormCanvas.tsx',
    'FormPreview.tsx',
    'form-builder.data.ts',
] as const;

export const FORM_BUILDER_TYPES_FILE = 'form-builder.types.ts';
export const FORM_BUILDER_UTILS_FILE = 'form-builder-utils.ts';

/** npm packages the consumer must install (in addition to shadcn/ui). */
export const NPM_DEPENDENCIES = ['lucide-react'] as const;

/** shadcn/ui components required by the form builder (install via shadcn CLI). */
export const SHADCN_COMPONENTS = [
    'button',
    'input',
    'tabs',
    'card',
    'label',
    'checkbox',
    'dropdown-menu',
    'select',
    'textarea',
    'radio-group',
    'slider',
    'switch',
] as const;

export const REGISTRY_COMPONENTS_DIR = 'default/form-builder';
export const REGISTRY_SUPPORTING_DIR = 'default';
