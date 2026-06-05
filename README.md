# dynamic-form-builder

Copy a full drag-and-drop **form builder** into your app the same way [shadcn/ui](https://ui.shadcn.com) copies components: source files land in **your** repo under `components/form-builder/`, not inside `node_modules`.

Built on **shadcn/ui** primitives (`Button`, `Input`, `Tabs`, etc.).

## Prerequisites

- React 18+ / Next.js 14+ app
- [shadcn/ui](https://ui.shadcn.com/docs/installation) initialized (`components.json` in the project root)

## Install

```bash
npm install dynamic-form-builder
```

Installing the package does **not** copy files automatically (same as shadcn). Run the CLI once after install:

```bash
npx dynamic-form-builder add
```

Optional: run on every install in **your** app (not recommended for libraries):

```json
{
  "scripts": {
    "postinstall": "dynamic-form-builder add --force"
  }
}
```

## CLI

| Command | Description |
|---------|-------------|
| `npx dynamic-form-builder init` | Creates `dfb.config.json` |
| `npx dynamic-form-builder add` | Copies components; prompts to install missing deps |
| `npx dynamic-form-builder add --yes` | Copy + install missing deps without prompting |
| `npx dynamic-form-builder add --skip-deps` | Copy files only, skip dependency checks |
| `npx dynamic-form-builder add --force` | Overwrite existing files |
| `npx dynamic-form-builder add -p src/components/form-builder` | Custom destination |

The CLI reads `components.json` aliases so files go to the same folder as your other shadcn components (e.g. `src/components/form-builder`).

After copying, the CLI **audits** your project for required npm packages (`lucide-react`, `react-hot-toast`) and shadcn/ui components. If anything is missing, you'll be asked to install them automatically (npm/pnpm/yarn/bun + `shadcn add`).

## After `add`

If you declined the install prompt or used `--skip-deps`, install manually:

1. **shadcn components** (if missing):

```bash
npx shadcn@latest add button input tabs card label checkbox dropdown-menu select textarea radio-group slider switch --yes
```

2. **npm packages**:

```bash
npm install lucide-react react-hot-toast
```

3. **Use in a page** (wrap your app with `Toaster` from `react-hot-toast`):

```tsx
import { FormBuilder } from '@/components/form-builder/FormBuilder';
import type { FormPayload } from '@/types/formBuilder.types';

export default function NewFormPage() {
  return (
    <FormBuilder
      onSave={async (payload: FormPayload) => {
        await fetch('/api/forms', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }}
    />
  );
}
```

## What gets copied

| File | Destination | Role |
|------|-------------|------|
| `FormBuilder.tsx` | `components/form-builder/` | Main builder shell + save handler |
| `FieldPalette.tsx` | `components/form-builder/` | Field / template palette |
| `FormCanvas.tsx` | `components/form-builder/` | Drag-and-drop canvas + properties |
| `FormPreview.tsx` | `components/form-builder/` | Live preview |
| `formBuilder.types.ts` | `types/` (created if missing) | Shared TypeScript types |
| `formBuilderUtils.ts` | `lib/` (uses `@/lib` alias) | `toFormFieldName` helper |

## Customization

Files are yours after install—edit them freely. Re-run `add --force` to reset from the registry (backs up changes first in git).
