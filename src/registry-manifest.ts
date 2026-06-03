export const FORM_BUILDER_FILES = [
    'FormBuilder.tsx',
    'FieldPalette.tsx',
    'FormCanvas.tsx',
    'FormPreview.tsx',
    'types.ts',
    'utils.ts',
    'index.ts',
] as const;

/** npm packages the consumer must install (in addition to shadcn/ui). */
export const NPM_DEPENDENCIES = ['lucide-react', 'react-hot-toast'] as const;

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

export const REGISTRY_SUBDIR = 'default/form-builder';
