# dynamic-form-builder-kit

[![npm version](https://img.shields.io/npm/v/dynamic-form-builder-kit.svg?color=blue)](https://www.npmjs.com/package/dynamic-form-builder-kit)
[![npm downloads](https://img.shields.io/npm/dm/dynamic-form-builder-kit.svg)](https://www.npmjs.com/package/dynamic-form-builder-kit)
[![license](https://img.shields.io/npm/l/dynamic-form-builder-kit.svg)](https://github.com/Sandezh/dynamic-form-builder/blob/main/LICENSE)
[![shadcn/ui](https://img.shields.io/badge/built%20for-shadcn%2Fui-black)](https://ui.shadcn.com)
[![React](https://img.shields.io/badge/React-18%20%7C%2019-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6)](https://www.typescriptlang.org)

A production-grade, customizable visual **dynamic form builder** built for **shadcn/ui** and **Tailwind CSS**.

Inspired by the [shadcn/ui](https://ui.shadcn.com) philosophy, `dynamic-form-builder-kit` is **not a black-box npm component**. Instead, an intelligent CLI distributes clean, modular TypeScript source code directly into your repository. You get **100% code ownership**, complete styling freedom, and zero vendor lock-in.

Now published on npm as [`dynamic-form-builder-kit`](https://www.npmjs.com/package/dynamic-form-builder-kit)!

---

## 📑 Table of Contents

- [Why dynamic-form-builder-kit?](#-why-dynamic-form-builder-kit)
- [Key Features](#-key-features)
- [Installation](#-installation)
- [Adding Components to Your Project](#-adding-components-to-your-project)
- [Project Structure After Installation](#-project-structure-after-installation)
- [Frontend Usage](#-frontend-usage)
  - [Creating a New Form](#creating-a-new-form)
  - [Editing an Existing Form](#editing-an-existing-form)
- [Component Props Reference](#️-component-props-reference)
- [Schema & Data Contract](#-schema--data-contract)
- [Backend & API Integration](#-backend--api-integration)
  - [Next.js App Router Route Handler](#nextjs-app-router-route-handler)
  - [Node.js / Express Handler](#nodejs--express-handler)
- [Implementation Guides & Examples](#-implementation-guides--examples)
- [CLI Reference](#-cli-reference)
- [Dependencies](#-dependencies)
- [Customization & Extension](#-customization--extension)
- [Local Testing & Development](#-local-testing--development)
- [License](#-license)

---

## 💡 Why dynamic-form-builder-kit?

Building a robust drag-and-drop form builder from scratch takes weeks of engineering:
- Managing drag reordering, multi-column row layouts, and responsive previews.
- Synchronizing form field schemas with dynamic properties inspectors.
- Preventing identifier collisions and validating input types.
- Styling components to match your application's design system.

Third-party form builder libraries often force heavy bundles, rigid iframes, or paid proprietary clouds. 

**`dynamic-form-builder-kit` solves this cleanly:**
- **Code in your repo**: Component files are placed directly in your `@/components/form-builder/` directory.
- **Native shadcn/ui primitives**: Uses your existing buttons, inputs, dialogs, cards, and theme variables.
- **Shared TypeScript types**: Dual-purpose package allows backend services to import form interfaces (`FormPayload`, `FormField`, etc.) directly without any UI dependencies.

---

## ✨ Key Features

- 🧩 **100% Code Ownership**: Pure React + TypeScript code copied directly into your codebase. Customize layout, logic, and styling whenever you want.
- 🎨 **shadcn/ui & Tailwind Native**: Built strictly with Radix UI and shadcn primitives (`Button`, `Input`, `Tabs`, `Card`, `Select`, `DropdownMenu`, `Switch`, `Slider`, etc.). Inherits your project's light/dark mode and CSS variables automatically.
- 📐 **Interactive Multi-Column Row Layouts**:
  - Drag-and-drop or click-to-move row and field reordering.
  - Flexible column widths: Full (`full`), Half (`half`), One-Third (`third`), and One-Quarter (`quarter`).
  - Add, remove, duplicate, and reorganize fields across rows effortlessly.
- 🛠️ **20+ Field Types & Content Blocks**:
  - **Basic**: Text, Email, Password, Number, URL, Phone (`tel`), Textarea.
  - **Date & Time**: Date, Time, DateTime-Local.
  - **Selection**: Checkbox Group, Radio Group, Select Dropdown, Multi-Select.
  - **Advanced**: File Upload, Toggle Switch, Rating, Slider, Hidden Input.
  - **Layout & Content**: Header (`h1`/`h2`), Paragraph blocks.
- 👁️ **Live Synchronized Preview**: Real-time interactive preview tab alongside the builder canvas, complete with automatic smooth scroll-to-field when inspecting elements.
- ⚙️ **Comprehensive Property Inspector**: Configure labels, placeholders, internal field names, required validation, options lists, numeric bounds (`min`, `max`, `step`), text rows, and orientation (horizontal / vertical).
- 🏷️ **Smart Name Normalization**: Automatically converts user-facing labels into unique, URL/database-safe snake_case field keys (`toFormFieldName`) to guarantee clean submission payloads.
- 📦 **Presets & Template Sets**: Includes quick-add single field presets (Country, Date of Birth, Gender, Interests) and multi-field groups (Address Information, Contact Preferences).
- ⚡ **Universal React Support**: Works seamlessly across Next.js (App Router & Pages Router), Vite, Remix, Astro, and Create React App. Supports React 18 and 19.

---

## 📦 Installation

Install `dynamic-form-builder-kit` using your package manager of choice:

```bash
# npm
npm install dynamic-form-builder-kit

# pnpm
pnpm add dynamic-form-builder-kit

# yarn
yarn add dynamic-form-builder-kit

# bun
bun add dynamic-form-builder-kit
```

### 🎯 Why install the npm package?

1. **Shared TypeScript Types**: Import `FormPayload`, `FormField`, `FormRow`, and form schema definitions directly in your backend API routes, server actions, and microservices with **zero client-side React bundle**.
2. **Access the CLI**: Run `npx dfb add` or `npx dynamic-form-builder-kit add` locally with fast, cached execution.
3. **Version Locking**: Ensures all developers on your team and CI/CD pipelines use the exact same schema specifications.

---

## 🚀 Adding Components to Your Project

Run the CLI command to copy the form builder UI components directly into your repository:

### Method 1: Using the CLI (Recommended)

```bash
npx dynamic-form-builder-kit add
```

*(Or use the shorthand alias:* `npx dfb add`*)*

The CLI will automatically:
1. Detect your package manager (`npm`, `pnpm`, `yarn`, or `bun`).
2. Read your `components.json` configuration and resolve your custom aliases (`@/components`, `@/lib`, `@/types`).
3. Copy the form builder components, helper utilities, and TypeScript types into your repository.
4. Audit your project dependencies and offer to install any missing shadcn/ui components and `lucide-react`.

### Method 2: Official shadcn CLI Registry

You can also install directly via the shadcn registry endpoint:

```bash
npx shadcn add https://raw.githubusercontent.com/Sandezh/dynamic-form-builder/main/registry/form-builder.json
```

---

## 📁 Project Structure After Installation

When installed, the kit creates cleanly separated, self-contained files respecting your project's alias configuration:

```
your-project/
├── components/
│   └── form-builder/
│       ├── FormBuilder.tsx       # Main builder orchestrator (canvas, palette, preview tabs, save bar)
│       ├── FormCanvas.tsx        # Visual canvas grid, row layouts & property inspector
│       ├── FieldPalette.tsx      # Sidebar palette with field types, templates & grouped presets
│       ├── FormPreview.tsx       # Real-time interactive preview synchronized with canvas state
│       └── form-builder.data.ts  # Default pinned fields (Name, Email, Phone) & template presets
├── types/
│   └── form-builder.types.ts     # Core TypeScript types (FormField, FormRow, FormPayload, etc.)
└── lib/
    └── form-builder-utils.ts     # String normalization helpers (toFormFieldName)
```

> **Why this layout?**  
> Keeping components, types, and utilities modular allows you to import types in backend APIs or server components without bundling client-side React code.

---

## 💻 Frontend Usage

### Creating a New Form

Import and mount `<FormBuilder />` in your page or modal. Supply an `onSave` handler to persist the form schema to your backend API:

```tsx
'use client';

import { FormBuilder } from '@/components/form-builder/FormBuilder';
import type { FormPayload } from '@/types/form-builder.types';

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

    const data = await response.json();
    console.log('Form saved successfully with ID:', data.id);
  };

  return (
    <div className="h-screen w-full">
      <FormBuilder
        initialTitle="Customer Feedback Survey"
        onSave={handleSave}
      />
    </div>
  );
}
```

### Editing an Existing Form

Pass the saved `initialTitle` and `initialContent` when editing an existing form schema:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { FormBuilder } from '@/components/form-builder/FormBuilder';
import type { FormContent, FormPayload } from '@/types/form-builder.types';

export default function EditFormPage({ params }: { params: { id: string } }) {
  const [form, setForm] = useState<{ title: string; content: FormContent } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForm() {
      try {
        const res = await fetch(`/api/forms/${params.id}`);
        const data = await res.json();
        setForm(data.form);
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [params.id]);

  const handleUpdate = async (payload: FormPayload) => {
    const res = await fetch(`/api/forms/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error('Failed to update form');
    }
  };

  return (
    <div className="h-screen w-full">
      <FormBuilder
        initialTitle={form?.title}
        initialContent={form?.content}
        isLoading={loading}
        onSave={handleUpdate}
      />
    </div>
  );
}
```

---

## ⚙️ Component Props Reference

The `<FormBuilder />` component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialTitle` | `string` | `''` | Initial title displayed in the form header input. |
| `initialContent` | `FormContent` | `undefined` | Existing form schema (`{ fields, rows }`) used when editing a saved form. |
| `onSave` | `(payload: FormPayload) => void \| Promise<void>` | `undefined` | Callback invoked when the user clicks the "Save" button. |
| `isLoading` | `boolean` | `false` | When `true`, displays an animated skeleton loading state on the canvas and preview. |
| `refKey` | `string` | `undefined` | Optional tracking key or version identifier. |

---

## 📋 Schema & Data Contract

When the user clicks **Save**, `onSave` receives a strongly typed `FormPayload` object:

```ts
export interface FormPayload {
  title: string;
  content: {
    fields: FormContentField[];
    rows: FormRow[];
  };
}
```

### Example JSON Payload Output

```json
{
  "title": "Job Application Form",
  "content": {
    "rows": [
      {
        "id": "row-default-full-name",
        "fields": ["default-full-name"]
      },
      {
        "id": "row-contact-info",
        "fields": ["default-email", "default-phone"]
      },
      {
        "id": "row-experience",
        "fields": ["years_of_experience", "portfolio_url"]
      }
    ],
    "fields": [
      {
        "id": "default-full-name",
        "type": "text",
        "name": "full_name",
        "label": "Full Name",
        "placeholder": "John Doe",
        "required": true,
        "columnWidth": "full",
        "rowId": "row-default-full-name"
      },
      {
        "id": "default-email",
        "type": "email",
        "name": "email",
        "label": "Email Address",
        "placeholder": "john@example.com",
        "required": true,
        "columnWidth": "half",
        "rowId": "row-contact-info"
      },
      {
        "id": "default-phone",
        "type": "tel",
        "name": "phone_number",
        "label": "Phone Number",
        "placeholder": "+1 (555) 000-0000",
        "required": false,
        "columnWidth": "half",
        "rowId": "row-contact-info"
      }
    ]
  }
}
```

---

## 🌐 Backend & API Integration

Because `dynamic-form-builder-kit` is published on [npm](https://www.npmjs.com/package/dynamic-form-builder-kit), you can install it in any backend or full-stack project to import all TypeScript types without importing any React or UI dependencies:

```bash
npm install dynamic-form-builder-kit
```

### Next.js App Router Route Handler (`app/api/forms/route.ts`)

```ts
import { NextResponse } from 'next/server';
import type { FormPayload } from 'dynamic-form-builder-kit';

export async function POST(request: Request) {
  try {
    const payload: FormPayload = await request.json();

    if (!payload.title || !payload.content) {
      return NextResponse.json({ error: 'Invalid form payload' }, { status: 400 });
    }

    // Persist to database (e.g., Prisma, Drizzle, MongoDB, Supabase)
    // const form = await db.form.create({
    //   data: {
    //     title: payload.title,
    //     schema: payload.content,
    //   },
    // });

    return NextResponse.json({
      success: true,
      id: 'generated-form-id',
      form: payload,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save form' }, { status: 500 });
  }
}
```

### Node.js / Express Handler

```ts
import express from 'express';
import type { FormPayload } from 'dynamic-form-builder-kit';

const app = express();
app.use(express.json());

app.post('/api/forms', async (req, res) => {
  const payload: FormPayload = req.body;
  
  console.log(`Saving form "${payload.title}" with ${payload.content.fields.length} fields`);
  
  // Save payload to database...
  res.status(201).json({ success: true, id: 'form_123' });
});
```

---

## 📖 Implementation Guides & Examples

To help you build a complete end-to-end dynamic form solution, comprehensive walkthroughs are included in this repository:

- 🎨 **[Frontend Implementation Guide (Next.js)](./FRONTEND_IMPLEMENTATION.md)**:  
  Step-by-step tutorial covering `<FormBuilder />` page setup, building a public dynamic form renderer (`/forms/[id]`), handling user submissions, and creating a submissions viewer table.
- ⚡ **[Backend Implementation Guide (Node.js)](./BACKEND_IMPLEMENTATION.md)**:  
  Production-grade guide covering REST API route design, Zod schema validation, form CRUD operations, submissions handling, and database schemas for MongoDB, Prisma, and in-memory stores.
- 🚀 **[Ready-to-Run Node.js Backend Example](./examples/backend-nodejs/)**:  
  A lightweight, zero-dependency mock backend server you can run instantly via `node examples/backend-nodejs/server.js`.
- 🧪 **[Local Testing Guide](./LOCAL_TESTING_GUIDE.md)**:  
  Detailed instructions for testing, packing, and linking this kit in local development environments.

---

## 🧰 CLI Reference

```bash
npx dynamic-form-builder-kit add [options]
```

*(or `npx dfb add [options]`)*

### Available Options

| Option | Flag | Description |
|--------|------|-------------|
| `--path <path>` | `-p` | Custom destination directory for component files relative to project root. |
| `--cwd <path>` | `-c` | Target project working directory (defaults to current directory `process.cwd()`). |
| `--force` | `-f` | Overwrite existing form builder files if they are already installed. |
| `--yes` | `-y` | Automatically confirm and install missing dependencies without prompting. |
| `--skip-deps` | | Copy component files only, skipping dependency audits and prompts. |

---

## 🧩 Dependencies

When you run `npx dynamic-form-builder-kit add`, missing dependencies are detected automatically. If you prefer to install them manually, the kit relies on:

### 1. npm Package

```bash
npm install lucide-react
```

### 2. shadcn/ui Components

```bash
npx shadcn@latest add button input tabs card label checkbox dropdown-menu select textarea radio-group slider switch --yes
```

---

## 🛠️ Customization & Extension

Because the code is copied directly into your project, you have complete control over its behavior:

### Customizing Default Pinned Fields
Open `components/form-builder/form-builder.data.ts` to modify or add default fields (e.g. changing the default required fields or placeholders for Name, Email, and Phone).

### Adding Custom Field Templates & Presets
In `components/form-builder/form-builder.data.ts`, update `DEFAULT_PALETTE_FIELDS` or `DEFAULT_CUSTOM_FIELD_SETS` to add domain-specific presets (e.g., Billing Address, Company Details, Feedback Questions) that your users can add with a single click.

### Modifying Styles & UI
All components use standard Tailwind CSS classes. You can tweak border radii, colors, animations, or replace components with custom UI primitives directly in `FormCanvas.tsx`, `FieldPalette.tsx`, and `FormPreview.tsx`.

---

## 🧪 Local Testing & Development

If you want to contribute or test this repository locally:

```bash
# Clone the repository
git clone https://github.com/Sandezh/dynamic-form-builder.git
cd dynamic-form-builder

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run automated tests
npm run test
```

For more details on testing with local demo applications, see the [Local Testing Guide](./LOCAL_TESTING_GUIDE.md).

---

## 📜 License

Distributed under the [MIT License](https://github.com/Sandezh/dynamic-form-builder/blob/main/LICENSE). Built with ❤️ by [Sandesh](https://github.com/Sandezh).
