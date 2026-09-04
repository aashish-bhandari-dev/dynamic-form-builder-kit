# Local Testing & Development Guide

This guide walks you through building **`dynamic-form-builder-kit`** locally and testing it inside a fresh sample/demo application.

---

## 📋 Overview of Testing Methods

You can test this package locally in three easy ways:

| Method | Best For | How it Works |
|--------|----------|--------------|
| **Method 1: Direct CLI Execution (`node dist/cli.js`)** *(Fastest)* | Zero-setup, instant testing | Directly runs the compiled CLI against your demo app. |
| **Method 2: Local Tarball (`npm install -D .tgz`)** | Testing npm installation lifecycle | Installs the `.tgz` tarball and runs `npx dfb add`. |
| **Method 3: Native shadcn Registry (`npx shadcn add ...`)** | Testing shadcn v2 integration | Uses shadcn's CLI to pull from your local `form-builder.json`. |

---

## Phase 1: Build and Pack the Package Locally

Run these steps inside the **`dynamic-form-builder`** repository:

### Step 1.1: Ensure Clean Compilation & Tests Pass

```bash
# Navigate to package directory
cd /Users/sandesh/personal-projects/dynamic-form-builder

# Compile TypeScript to dist/
npm run build

# Run automated tests to verify integrity
npm run test
```

You should see all 17 tests pass.

### Step 1.2: Generate the Local Tarball

```bash
npm pack
```

This generates a file named **`dynamic-form-builder-kit-1.0.0.tgz`** in your project root.  
Note the full path to this file:
```
/Users/sandesh/personal-projects/dynamic-form-builder/dynamic-form-builder-kit-1.0.0.tgz
```

---

## Phase 2: Create a Sample Demo Application

Open a **new terminal window** and create a test project (for example in your `personal-projects` folder or temporary folder).

### Step 2.1: Create a Fresh Next.js App

```bash
# Navigate to your projects directory (outside this package)
cd /Users/sandesh/personal-projects

# Create a Next.js app with Tailwind CSS and TypeScript
npx create-next-app@latest form-builder-demo \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-npm \
  --yes

# Enter the demo project directory
cd form-builder-demo
```

### Step 2.2: Initialize shadcn/ui in the Demo App

```bash
# Initialize shadcn with default configuration
npx shadcn@latest init --defaults --yes
```

---

## Phase 3: Real npm Simulation Options for Testing

Make sure you are in your demo app directory (e.g. `frontend` or `form-builder-demo`).

### Option 1: `npm link` (Global CLI Simulation — Zero Setup)

`npm link` registers the package globally on your machine, so you can run `dfb add` or `npx dfb add` anywhere without any file paths.

#### Step 1: In `dynamic-form-builder`:
```bash
cd /Users/sandesh/personal-projects/dynamic-form-builder
npm run build
npm link
```

#### Step 2: In your `frontend` app:
```bash
cd /Users/sandesh/personal-projects/frontend

# You can now run the CLI command directly by its name!
dfb add
# or:
dynamic-form-builder-kit add
```

#### To also simulate `npm install dynamic-form-builder-kit`:
```bash
# In frontend app:
npm link dynamic-form-builder-kit
```
This links the package into your demo app's `node_modules`, exactly as if you ran `npm install dynamic-form-builder-kit`. You can now import types directly:
```ts
import type { FormPayload } from 'dynamic-form-builder-kit';
```

---

### Option 2: Local Private Registry via `Verdaccio` (100% True npm Registry Simulation)

This is the gold standard used by open-source libraries to simulate the **exact** `npm publish`, `npm install`, and `npx` network download flow on localhost before deploying to the public npm registry.

#### Step 1: Start the local registry in a separate terminal:
```bash
npx verdaccio
```
*(Verdaccio will boot up at `http://localhost:4873`)*

#### Step 2: Publish your package locally:
In your `dynamic-form-builder` terminal:
```bash
cd /Users/sandesh/personal-projects/dynamic-form-builder
npm run build

# Publish to your local registry (no credentials needed)
npm publish --registry http://localhost:4873
```

#### Step 3: Test real `npx` and `npm install` in your `frontend` app:
In your `frontend` app:
```bash
cd /Users/sandesh/personal-projects/frontend

# Run npx exactly like real users will!
npx --registry http://localhost:4873 dynamic-form-builder-kit add

# Or install it into package.json:
npm install dynamic-form-builder-kit --registry http://localhost:4873
```

---

### Option 3: Direct Node Execution (Fastest for Development)

```bash
node /Users/sandesh/personal-projects/dynamic-form-builder/dist/cli.js add
```

---

### Option 4: Native shadcn Registry Test

```bash
npx shadcn add file:///Users/sandesh/personal-projects/dynamic-form-builder/registry/form-builder.json
```

---

## Phase 4: Create a Page to Test `<FormBuilder />`

Now create a test page in your demo app to see the form builder in action.

### Step 4.1: Create `src/app/builder/page.tsx`

Create `src/app/builder/page.tsx` inside your demo app:

```tsx
'use client';

import { FormBuilder, type FormPayload } from '@/components/form-builder';

export default function FormBuilderPage() {
  const handleSave = async (payload: FormPayload) => {
    console.log('Saved Form Payload:', payload);
    alert(`Form "${payload.title}" saved with ${payload.content.fields.length} fields! Check browser console.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <header className="flex items-center justify-between pb-2 border-b">
          <div>
            <h1 className="text-xl font-bold">Dynamic Form Builder Demo</h1>
            <p className="text-sm text-muted-foreground">
              Built on shadcn/ui & Tailwind CSS
            </p>
          </div>
        </header>

        {/* FormBuilder Component */}
        <div className="border rounded-lg shadow-sm overflow-hidden bg-background">
          <FormBuilder
            initialTitle="Customer Registration Form"
            onSave={handleSave}
            enableDefaultFields={true}
          />
        </div>
      </div>
    </div>
  );
}
```

### Step 4.2: Start the Demo App

```bash
npm run dev
```

Open your browser and navigate to:
👉 **[http://localhost:3000/builder](http://localhost:3000/builder)**

---

## Phase 5: Verification Checklist

Verify that everything works cleanly:

- [ ] **Left Palette**: Click or drag fields (e.g. Text, Select, Date, Checkbox) into the canvas.
- [ ] **Preset Sets**: In the palette, click the "Presets" tab and add an "Address Information" set.
- [ ] **Canvas Grid**:
  - Click on a field card to select it.
  - Reorder rows using drag-and-drop handles.
  - Reorder fields inside rows with left/right arrows.
  - Change column widths (Full, Half, 1/3, 1/4).
- [ ] **Property Inspector**: Edit label, placeholder, help text, and required toggle on the selected field.
- [ ] **Live Preview**: Verify the right-hand preview panel reflects all field additions and property edits in real time.
- [ ] **Save Handler**: Click the "Save" button in the header and verify that the toast notification pops up and payload logs to the browser console.
- [ ] **Responsive Design**: Resize your browser window to mobile width (< 768px) and verify the tabbed layout (Fields / Canvas / Preview) works seamlessly.

---

## Phase 6: Testing Backend Type Imports

In your demo app, you can also install the local tarball as a dependency to test importing types in backend routes:

```bash
# In the demo app:
npm install /Users/sandesh/personal-projects/dynamic-form-builder/dynamic-form-builder-kit-1.0.0.tgz
```

Create a sample API route in `src/app/api/forms/route.ts`:

```ts
import { NextResponse } from 'next/server';
import type { FormPayload, FormField } from 'dynamic-form-builder-kit';

export async function POST(request: Request) {
  const payload: FormPayload = await request.json();

  console.log('Received Form on Server:', payload.title);
  
  return NextResponse.json({
    success: true,
    message: `Form "${payload.title}" received on server.`,
    fieldCount: payload.content.fields.length,
  });
}
```

---

## 🛠️ Troubleshooting & Tips

### 1. Overwriting Changes after Modifying the Kit
If you make code changes in `dynamic-form-builder` and want to update the demo app:
```bash
# 1. In dynamic-form-builder:
npm run build && npm pack

# 2. In demo app (use --force to overwrite):
npx /Users/sandesh/personal-projects/dynamic-form-builder/dynamic-form-builder-kit-1.0.0.tgz add --force
```

### 2. Missing Icons or Components
If you ran `add` with `--skip-deps`, manually install any missing shadcn components:
```bash
npx shadcn@latest add button input tabs card label checkbox dropdown-menu select textarea radio-group slider switch --yes
npm install lucide-react
```

### 3. Cleanup Test Tarball
When you are done testing, you can remove the generated `.tgz` file:
```bash
rm /Users/sandesh/personal-projects/dynamic-form-builder/*.tgz
```
