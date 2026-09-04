# dynamic-form-builder-kit

[![npm version](https://img.shields.io/npm/v/dynamic-form-builder-kit.svg?color=blue)](https://www.npmjs.com/package/dynamic-form-builder-kit)
[![license](https://img.shields.io/npm/l/dynamic-form-builder-kit.svg)](https://github.com/Sandezh/dynamic-form-builder/blob/main/LICENSE)
[![shadcn/ui](https://img.shields.io/badge/built%20for-shadcn%2Fui-black)](https://ui.shadcn.com)
[![React](https://img.shields.io/badge/React-18%20%7C%2019-61dafb)](https://react.dev)

A modern, production-grade drag-and-drop **dynamic form builder** built for **shadcn/ui**. 

It copies clean, self-contained TypeScript components directly into your project repo under `components/form-builder/`—giving you 100% control, styling freedom, and zero vendor lock-in.

---

## ✨ Features

- 🧩 **Self-Contained**: All components, types, and helpers live together in `components/form-builder/`. Zero scattered files, zero path alias headaches.
- 🎨 **shadcn/ui Native**: Built on top of shadcn primitives (`Button`, `Input`, `Tabs`, `Card`, `Select`, `DropdownMenu`, etc.) with full Tailwind CSS theme support.
- ⚡ **Universal React Support**: Compatible with Next.js (App Router & Pages Router), Vite, Remix, Astro, and Create React App. Zero hard dependency on `next`.
- 📦 **Dual Usage**: Install component source code via CLI or import shared TypeScript types (`FormPayload`, `FormField`, etc.) directly from `dynamic-form-builder-kit` in your API routes and backend services.
- 🛠️ **20+ Field Types**: Text, email, password, number, textarea, select, multi-select, date, time, datetime-local, radio, checkbox, switch, slider, rating, header, paragraph, image, and hidden.
- 📐 **Interactive Grid & Row Layouts**: Drag-and-drop field reordering, multi-column rows (full, 1/2, 1/3, 1/4 widths), duplicate, delete, and real-time properties inspector.
- 📱 **Responsive & Mobile-Ready**: Seamless tabbed interface on mobile screens and three-pane canvas on desktop.

---

## 🚀 Quickstart

In your project root (with shadcn/ui initialized):

```bash
npx dynamic-form-builder-kit add
```

> **Prefer the official shadcn CLI?**  
> You can also install directly via the shadcn registry:
> ```bash
> npx shadcn add https://raw.githubusercontent.com/Sandezh/dynamic-form-builder/main/registry/form-builder.json
> ```

The CLI will:
1. Detect your package manager (`npm`, `pnpm`, `yarn`, or `bun`).
2. Read your `components.json` path aliases.
3. Copy all self-contained form builder components into `@/components/form-builder/`.
4. Audit your dependencies and automatically offer to install any missing shadcn components or packages (`lucide-react`).

---

## 💻 Usage in Your App

Once added, use the `<FormBuilder />` component in any page:

```tsx
'use client';

import { FormBuilder, type FormPayload } from '@/components/form-builder';

export default function CreateFormPage() {
  const handleSave = async (payload: FormPayload) => {
    const response = await fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to save form');
    }
  };

  return (
    <main className="p-4 h-screen">
      <FormBuilder
        initialTitle="Customer Feedback Form"
        onSave={handleSave}
      />
    </main>
  );
}
```

---

## 🌐 Backend & API Integration

You can import all shared types directly from `dynamic-form-builder-kit` in your API routes, server actions, or backend code without importing React components:

```bash
npm install dynamic-form-builder-kit
```

### Example: Next.js App Router API Route (`app/api/forms/route.ts`)

```ts
import { NextResponse } from 'next/server';
import type { FormPayload } from 'dynamic-form-builder-kit';

export async function POST(request: Request) {
  const body: FormPayload = await request.json();

  console.log('Form Title:', body.title);
  console.log('Form Fields:', body.content.fields);
  console.log('Form Rows:', body.content.rows);

  // Persist schema to your database (Prisma, Drizzle, Supabase, Mongo, etc.)
  // const saved = await db.form.create({ data: { title: body.title, schema: body.content } });

  return NextResponse.json({ success: true, form: body });
}
```

---

## ⚙️ Props Reference

The `<FormBuilder />` component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialTitle` | `string` | `''` | Initial title of the form in the header. |
| `initialContent` | `FormContent` | `undefined` | Existing form schema (`{ fields, rows }`) to load for editing. |
| `onSave` | `(payload: FormPayload) => void \| Promise<void>` | `undefined` | Async callback triggered when user clicks "Save". |
| `enableDefaultFields` | `boolean` | `true` | When `true`, prepopulates pinned fields (Full Name, Email, Phone). Set `false` for an empty canvas. |
| `defaultFieldSpecs` | `DefaultFieldSpec[]` | `undefined` | Custom pinned fields configuration to replace standard defaults. |
| `paletteFields` | `PaletteFieldTemplate[]` | `undefined` | Custom single-field templates available in the sidebar palette. |
| `customFieldSets` | `CustomFieldSet[]` | `undefined` | Custom grouped field presets in the sidebar palette. |
| `className` | `string` | `undefined` | Optional CSS class name appended to the outermost wrapper. |
| `showPreview` | `boolean` | `true` | Whether to display the live preview pane. |
| `isLoading` | `boolean` | `false` | When `true`, shows a loading skeleton in the canvas and preview. |

---

## 📁 What Gets Installed

All files are copied cleanly into a single, self-contained directory:

```
components/form-builder/
├── index.ts              # Clean entrypoint exporting FormBuilder, FormPreview, types, utils
├── FormBuilder.tsx       # Main builder shell, header, and save state
├── FormCanvas.tsx        # Drag-and-drop canvas, row grid, and property inspector
├── FieldPalette.tsx      # Sidebar palette with field types and template presets
├── FormPreview.tsx       # Live interactive form preview
├── form-builder.data.ts  # Default field specifications and template presets
├── types.ts              # TypeScript interfaces (FormField, FormRow, FormPayload, etc.)
└── utils.ts              # Helper functions (toFormFieldName, etc.)
```

Because everything is self-contained:
- You can move `components/form-builder/` anywhere (e.g. `src/features/forms/builder/`) without breaking imports.
- You can freely customize the JSX and Tailwind styling.

---

## 🧰 CLI Command Options

```bash
npx dynamic-form-builder-kit add [options]
```

| Option | Flag | Description |
|--------|------|-------------|
| `--force` | `-f` | Overwrite existing files without error. |
| `--path <path>` | `-p` | Custom destination path relative to project root. |
| `--cwd <path>` | `-c` | Target project working directory (defaults to `process.cwd()`). |
| `--yes` | `-y` | Install missing dependencies automatically without prompting. |
| `--skip-deps` | | Copy component files only, skipping dependency checks. |

---

## 🧩 Required Dependencies

If you run the CLI with `--skip-deps`, ensure the following are installed:

### 1. npm packages
```bash
npm install lucide-react
```

### 2. shadcn/ui components
```bash
npx shadcn@latest add button input tabs card label checkbox dropdown-menu select textarea radio-group slider switch --yes
```

---

## 🧪 Local Testing & Development

Want to test or develop this package locally in another repo? Check out the complete step-by-step [Local Testing Guide](./LOCAL_TESTING_GUIDE.md).

---

## 📜 License

MIT © [Sandesh](https://github.com/Sandezh)

