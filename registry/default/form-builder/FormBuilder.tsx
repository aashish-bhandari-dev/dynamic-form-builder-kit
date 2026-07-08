'use client';

import { useState, useEffect, useCallback } from 'react';
import { FieldPalette } from './FieldPalette';
import { FormCanvas } from './FormCanvas';
import { FormPreview } from './FormPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Type, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
    CustomFieldSet,
    FormContent,
    FormField,
    FormPayload,
    FormRow,
    PaletteFieldTemplate,
} from '@/types/form-builder.types';
import { toFormFieldName as toFormFieldNameRaw } from '@/lib/form-builder-utils';
import {
    fetchFieldSpecs,
    fetchPaletteFields,
    fetchCustomFieldSets,
    type DefaultFieldSpec,
} from './form-builder.data';

export type { CustomFieldSet, FormContent, FormField, FormPayload, FormRow, PaletteFieldTemplate, DefaultFieldSpec };

type FormBuilderProps = {
    initialTitle?: string;
    initialContent?: FormContent;
    refKey?: string;
    isLoading?: boolean;
    /** Called when the user saves the form. Wire this to your API. */
    onSave?: (payload: FormPayload) => void | Promise<void>;
};

export function FormBuilder({
    initialTitle,
    initialContent,
    refKey,
    isLoading,
    onSave,
}: FormBuilderProps) {
    const [mounted, setMounted] = useState(false);
    const [fields, setFields] = useState<FormField[]>([]);
    const [rows, setRows] = useState<FormRow[]>([]);
    const [title, setTitle] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [fieldSpecs, setFieldSpecs] = useState<DefaultFieldSpec[]>([]);
    const [paletteFields, setPaletteFields] = useState<PaletteFieldTemplate[]>([]);
    const [customFieldSets, setCustomFieldSets] = useState<CustomFieldSet[]>([]);
    const [isMetadataLoading, setIsMetadataLoading] = useState<boolean>(true);
    const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);

    const showToast = useCallback((message: string, type: 'success' | 'error') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const toast = {
        success: useCallback((msg: string) => showToast(msg, 'success'), [showToast]),
        error: useCallback((msg: string) => showToast(msg, 'error'), [showToast]),
    };

    const toFormFieldName = useCallback((value: string): string => {
        if (typeof toFormFieldNameRaw === 'function') {
            return toFormFieldNameRaw(value);
        }
        const trimmed = value.trim().toLowerCase();
        const normalized = trimmed
            .replaceAll(/[^a-z0-9]+/g, '_')
            .replaceAll(/_+/g, '_')
            .replaceAll(/^_+|_+$/g, '');
        if (!normalized) return 'field';
        if (/^\d/.test(normalized)) return `field_${normalized}`;
        return normalized;
    }, []);

    const getUniqueFieldName = (desired: string, fieldId?: string) => {
        const base = toFormFieldName(desired);
        const used = new Set(
            fields
                .filter((f) => f.id !== fieldId)
                .map((f) => f.name)
                .filter((n): n is string => Boolean(n)),
        );
        let candidate = base;
        let i = 2;
        while (used.has(candidate)) {
            candidate = `${base}_${i}`;
            i += 1;
        }
        return candidate;
    };

    const normalizeWithDefaults = useCallback(
        (inputFields: FormField[], inputRows: FormRow[]) => {
            const nextFields: FormField[] = [...inputFields.map((f) => ({ ...f }))];
            const byId = new Map(nextFields.map((f) => [f.id, f]));
            const usedNames = new Set(
                nextFields
                    .map((f) => f.name)
                    .filter((n): n is string => Boolean(n))
                    .map((n) => toFormFieldName(n)),
            );

            const pickOrCreateDefaultField = (spec: DefaultFieldSpec) => {
                const canonical = toFormFieldName(spec.key);

                const existingCanonical = nextFields.find(
                    (f) => toFormFieldName(f.name || '') === canonical,
                );
                if (existingCanonical) return existingCanonical;

                const aliases = spec.aliases;
                const existingAlias = aliases?.length
                    ? nextFields.find((f) => aliases.includes(toFormFieldName(f.name || '')))
                    : undefined;

                if (existingAlias) return existingAlias;

                const created: FormField = {
                    id: spec.id,
                    type: spec.type,
                    name: spec.key,
                    label: spec.label,
                    placeholder: spec.placeholder,
                    required: spec.required,
                    columnWidth: 'full',
                    rowId: spec.rowId,
                    isDefault: true,
                    isDefaultRequired: spec.required,
                };
                nextFields.push(created);
                byId.set(created.id, created);
                usedNames.add(toFormFieldName(created.name || ''));
                return created;
            };

            const defaultFieldIds: string[] = [];
            for (const spec of fieldSpecs) {
                const picked = pickOrCreateDefaultField(spec);

                const desiredName = spec.key;
                const desiredNameNormalized = toFormFieldName(desiredName);
                const currentNameNormalized = toFormFieldName(picked.name || '');
                const shouldRenameToCanonical = currentNameNormalized !== desiredNameNormalized;
                const canRenameToCanonical =
                    !shouldRenameToCanonical ||
                    !usedNames.has(desiredNameNormalized) ||
                    currentNameNormalized === desiredNameNormalized;

                const nextName = canRenameToCanonical ? desiredName : picked.name;
                if (nextName) {
                    usedNames.add(toFormFieldName(nextName));
                }

                const updated: FormField = {
                    ...picked,
                    type: spec.type,
                    name: nextName,
                    label: spec.label,
                    placeholder: spec.placeholder,
                    required: spec.required,
                    columnWidth: 'full',
                    rowId: spec.rowId,
                    isDefault: true,
                    isDefaultRequired: spec.required,
                };
                byId.set(updated.id, updated);
                const idx = nextFields.findIndex((f) => f.id === updated.id);
                if (idx >= 0) nextFields[idx] = updated;
                defaultFieldIds.push(updated.id);
            }

            const pinnedRows: FormRow[] = fieldSpecs.map((spec, idx) => ({
                id: spec.rowId,
                fields: [defaultFieldIds[idx]],
            }));

            const pinnedRowIds = fieldSpecs.map((s) => s.rowId);

            const keptRows: FormRow[] = [];
            for (const row of inputRows ?? []) {
                if (pinnedRowIds.includes(row.id)) continue;
                const filtered = row.fields.filter((fid) => !defaultFieldIds.includes(fid));
                if (filtered.length === 0) continue;
                keptRows.push({ ...row, fields: filtered });
            }

            const rowFieldIds = new Set<string>(
                [...pinnedRows, ...keptRows].flatMap((r) => r.fields),
            );
            const orphanFields = nextFields.filter((f) => !rowFieldIds.has(f.id));

            const orphanRows: FormRow[] = orphanFields.map((f) => {
                const candidateRowId =
                    f.rowId && !pinnedRowIds.includes(f.rowId) ? f.rowId : '';
                const rowId = candidateRowId || `row-${Date.now()}-${f.id}`;
                const updated = { ...f, rowId };
                byId.set(updated.id, updated);
                const idx = nextFields.findIndex((ff) => ff.id === updated.id);
                if (idx >= 0) nextFields[idx] = updated;
                return { id: rowId, fields: [f.id] };
            });

            return { fields: nextFields, rows: [...pinnedRows, ...keptRows, ...orphanRows] };
        },
        [toFormFieldName, fieldSpecs],
    );

    const resetToInitial = useCallback(() => {
        if (initialContent) {
            const ensureUniqueFieldNames = (inputFields: FormField[]): FormField[] => {
                const used = new Set<string>();
                return inputFields.map((f) => {
                    const base =
                        (f.name ? toFormFieldName(f.name) : '') ||
                        toFormFieldName(f.label || '') ||
                        toFormFieldName(f.type || '') ||
                        'field';
                    let candidate = base;
                    let i = 2;
                    while (used.has(candidate)) {
                        candidate = `${base}_${i}`;
                        i += 1;
                    }
                    used.add(candidate);
                    return { ...f, name: candidate };
                });
            };
            const mappedFields: FormField[] = ensureUniqueFieldNames(
                (initialContent.fields ?? []).map((f) => ({
                    id: f.id,
                    type: f.type,
                    name: f.name,
                    label: f.label,
                    placeholder: f.placeholder,
                    required: f.required,
                    columnWidth: (f.columnWidth as any) ?? 'full',
                    rowId: f.rowId,
                    options: f.options,
                    rows: f.rows,
                    minValue: f.minValue,
                    maxValue: f.maxValue,
                    step: f.step,
                    accept: f.accept,
                    helpText: f.helpText,
                    orientation:
                        f.orientation ||
                        (['radio', 'checkbox', 'multiselect'].includes(f.type)
                            ? 'horizontal'
                            : undefined),
                    isDefault: f.isDefault,
                    isDefaultRequired: f.isDefaultRequired,
                })),
            );
            const mappedRows = (initialContent.rows ?? []).map((r) => ({
                id: r.id,
                fields: r.fields,
            }));
            const normalized = normalizeWithDefaults(mappedFields, mappedRows);
            setFields(normalized.fields);
            setRows(normalized.rows);
            setSelectedFieldId(null);
        } else {
            const normalized = normalizeWithDefaults([], []);
            setFields(normalized.fields);
            setRows(normalized.rows);
            setSelectedFieldId(null);
        }
    }, [initialContent, normalizeWithDefaults, toFormFieldName]);

    useEffect(() => {
        let active = true;
        async function loadSpecs() {
            try {
                const [specs, palette, sets] = await Promise.all([
                    fetchFieldSpecs(),
                    fetchPaletteFields(),
                    fetchCustomFieldSets(),
                ]);
                if (active) {
                    setFieldSpecs(specs);
                    setPaletteFields(palette);
                    setCustomFieldSets(sets);
                    setIsMetadataLoading(false);
                }
            } catch (error) {
                console.error('Failed to load form builder metadata:', error);
            }
        }
        loadSpecs();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        setMounted(true);
        if (isMetadataLoading) return;
        if (initialTitle) {
            setTitle(initialTitle);
        }
        resetToInitial();
    }, [initialTitle, resetToInitial, isMetadataLoading]);

    const addFieldToRow = (type: string, rowId?: string) => {
        if (rowId) {
            const targetRow = rows.find((r) => r.id === rowId);
            if (targetRow && targetRow.fields.length >= 3) {
                toast.error('Maximum 3 fields allowed per row');
                return;
            }
        }

        const newFieldId = `field-${Date.now()}`;
        const label = `${type.charAt(0).toUpperCase() + type.slice(1)}`;
        const newField: FormField = {
            id: newFieldId,
            type,
            name: getUniqueFieldName(label, newFieldId),
            label,
            placeholder: `Enter ${type}...`,
            required: false,
            columnWidth: 'full',
            rowId: rowId || `row-${Date.now()}`,
        };

        setFields([...fields, newField]);

        if (!rowId) {
            setRows([...rows, { id: newField.rowId, fields: [newFieldId] }]);
        } else {
            setRows(
                rows.map((r) => (r.id === rowId ? { ...r, fields: [...r.fields, newFieldId] } : r)),
            );
        }

        setSelectedFieldId(newFieldId);
    };

    const insertFieldAtIndex = (type: string, index: number) => {
        const newFieldId = `field-${Date.now()}`;
        const label = `${type.charAt(0).toUpperCase() + type.slice(1)}`;
        const newField: FormField = {
            id: newFieldId,
            type,
            name: getUniqueFieldName(label, newFieldId),
            label,
            placeholder: `Enter ${type}...`,
            required: false,
            columnWidth: 'full',
            rowId: `row-${Date.now()}`,
        };

        setFields([...fields, newField]);

        const newRow = { id: newField.rowId, fields: [newFieldId] };
        const newRows = [...rows];
        newRows.splice(index, 0, newRow);
        setRows(newRows);

        setSelectedFieldId(newFieldId);
    };

    const insertConfiguredFieldAtIndex = (template: PaletteFieldTemplate, index: number) => {
        const newFieldId = `field-${Date.now()}-${Math.random()}`;
        const rowId = `row-${Date.now()}-${Math.random()}`;
        const nextName = getUniqueFieldName(template.name || template.label, newFieldId);
        const newField: FormField = {
            id: newFieldId,
            type: template.type,
            name: nextName,
            label: template.label,
            placeholder: template.placeholder,
            required: template.required ?? false,
            options: template.options,
            minValue: template.minValue,
            maxValue: template.maxValue,
            step: template.step,
            rows: template.rows,
            accept: template.accept,
            helpText: template.helpText,
            columnWidth: template.columnWidth ?? 'full',
            rowId,
            isDefault: true,
        };

        setFields([...fields, newField]);

        const newRow = { id: rowId, fields: [newFieldId] };
        const newRows = [...rows];
        newRows.splice(index, 0, newRow);
        setRows(newRows);

        setSelectedFieldId(newFieldId);
    };

    const removeField = (id: string) => {
        const field = fields.find((f) => f.id === id);
        if (field) {
            const nameKey = toFormFieldName(field.name || '');
            const matchingSpec = fieldSpecs.find((spec) => toFormFieldName(spec.key) === nameKey);
            if (matchingSpec) {
                toast.error(`${matchingSpec.label} cannot be removed`);
                return;
            }
            setFields(fields.filter((f) => f.id !== id));
            setRows(
                rows
                    .map((r) => ({ ...r, fields: r.fields.filter((fId) => fId !== id) }))
                    .filter((r) => r.fields.length > 0),
            );
        }
        setSelectedFieldId(null);
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields(
            fields.map((f) => {
                if (f.id !== id) return f;
                if (f.isDefault) {
                    const safeUpdates: Partial<FormField> = { ...updates };
                    delete safeUpdates.name;
                    delete safeUpdates.label;

                    const nextName = f.name ?? getUniqueFieldName(f.label, id);
                    return { ...f, ...safeUpdates, name: nextName, label: f.label };
                }
                const nextName =
                    updates.name !== undefined
                        ? getUniqueFieldName(updates.name, id)
                        : (f.name ?? getUniqueFieldName(f.label, id));
                return { ...f, ...updates, name: nextName };
            }),
        );
    };

    const duplicateField = (id: string) => {
        const field = fields.find((f) => f.id === id);
        if (field) {
            const row = rows.find((r) => r.id === field.rowId);
            if (row && row.fields.length >= 3) {
                toast.error('Maximum 3 fields allowed per row');
                return;
            }

            const newId = `field-${Date.now()}`;
            const newField = {
                ...field,
                id: newId,
                isDefault: false,
                name: getUniqueFieldName(field.name || field.label, newId),
            };
            setFields([...fields, newField]);
            setRows(
                rows.map((r) =>
                    r.id === field.rowId ? { ...r, fields: [...r.fields, newField.id] } : r,
                ),
            );
            setSelectedFieldId(newField.id);
        }
    };

    const reorderFieldInRow = (fieldId: string, direction: 'left' | 'right') => {
        const field = fields.find((f) => f.id === fieldId);
        if (!field) return;

        setRows(
            rows.map((r) => {
                if (r.id !== field.rowId) return r;
                const idx = r.fields.indexOf(fieldId);
                if (
                    (direction === 'left' && idx === 0) ||
                    (direction === 'right' && idx === r.fields.length - 1)
                ) {
                    return r;
                }
                const newFields = [...r.fields];
                const swapIdx = direction === 'left' ? idx - 1 : idx + 1;
                [newFields[idx], newFields[swapIdx]] = [newFields[swapIdx], newFields[idx]];
                return { ...r, fields: newFields };
            }),
        );
    };

    const reorderRows = (fromIndex: number, toIndex: number) => {
        const newRows = [...rows];
        const [movedRow] = newRows.splice(fromIndex, 1);
        newRows.splice(toIndex, 0, movedRow);
        setRows(newRows);
    };

    const exportJSON = () => {
        const json = JSON.stringify({ fields, rows }, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'form-schema.json';
        a.click();
    };

    const copyJSON = () => {
        navigator.clipboard.writeText(JSON.stringify({ fields, rows }, null, 2));
    };

    const addCustomFieldSet = (setId: string, insertAtIndex?: number) => {
        const fieldSet = customFieldSets.find((s) => s.id === setId);
        if (fieldSet) {
            const newFields = fieldSet.fields.reduce<FormField[]>((acc, f) => {
                const newId = `field-${Date.now()}-${Math.random()}`;
                const nextName = (() => {
                    const base = toFormFieldName(f.name || f.label || '');
                    const used = new Set(
                        [...fields, ...acc]
                            .map((ff) => ff.name)
                            .filter((n): n is string => Boolean(n)),
                    );
                    let candidate = base;
                    let i = 2;
                    while (used.has(candidate)) {
                        candidate = `${base}_${i}`;
                        i += 1;
                    }
                    return candidate;
                })();
                acc.push({
                    ...f,
                    id: newId,
                    name: nextName,
                    rowId: `row-${Date.now()}-${Math.random()}`,
                });
                return acc;
            }, []);
            setFields([...fields, ...newFields]);
            const templateRows: FormRow[] = newFields.map((f) => ({ id: f.rowId, fields: [f.id] }));
            const targetIndex = insertAtIndex === undefined ? rows.length : insertAtIndex;
            const nextRows = [
                ...rows.slice(0, targetIndex),
                ...templateRows,
                ...rows.slice(targetIndex),
            ];
            setRows(nextRows);
        }
    };

    const saveForm = async () => {
        if (!title.trim()) {
            toast.error('Please enter a form title');
            return;
        }
        if (fields.length === 0 || rows.length === 0) {
            toast.error('Please add at least one field');
            return;
        }
        const payload: FormPayload = {
            title: title.trim(),
            content: {
                fields: fields.map((f) => ({
                    id: f.id,
                    type: f.type as FormPayload['content']['fields'][number]['type'],
                    name: f.name,
                    label: f.label,
                    placeholder: f.placeholder,
                    required: !!f.required,
                    columnWidth: f.columnWidth ?? 'full',
                    rowId: f.rowId,
                    options: f.options,
                    rows: f.rows,
                    minValue: f.minValue,
                    maxValue: f.maxValue,
                    step: f.step,
                    accept: f.accept,
                    helpText: f.helpText,
                    orientation:
                        f.orientation ||
                        (['radio', 'checkbox', 'multiselect'].includes(f.type)
                            ? 'horizontal'
                            : undefined),
                    isDefault: f.isDefault,
                })),
                rows: rows.map((r) => ({ id: r.id, fields: r.fields })),
            },
        };
        try {
            setIsSaving(true);
            if (onSave) {
                await onSave(payload);
                toast.success(refKey ? 'Form updated successfully' : 'Form saved successfully');
            } else {
                console.log('Form payload:', payload);
                toast.success('Form schema logged to console (provide onSave to persist)');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save form';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        const normalized = normalizeWithDefaults([], []);
        setFields(normalized.fields);
        setRows(normalized.rows);
        setSelectedFieldId(null);
    };

    const [activeMobileTab, setActiveMobileTab] = useState<'palette' | 'canvas' | 'preview'>(
        'palette',
    );

    const handleAddFieldFromPaletteMobile = (type: string) => {
        addFieldToRow(type);
        setActiveMobileTab('canvas');
    };

    const handleAddDefaultFieldMobile = (template: PaletteFieldTemplate) => {
        insertConfiguredFieldAtIndex(template, rows.length);
        setActiveMobileTab('canvas');
    };

    const handleAddCustomSetMobile = (setId: string) => {
        addCustomFieldSet(setId);
        setActiveMobileTab('canvas');
    };

    if (!mounted) return null;

    if (isMetadataLoading) {
        return (
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center bg-background text-foreground rounded-sm border border-border">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading form builder configuration...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-background text-foreground h-[calc(100vh-6rem)]">
            <div className="border-b border-border bg-card px-2 py-1.5 shrink-0 rounded-t-sm">
                <div className="flex flex-col gap-2 md:hidden">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-sm font-bold">Form</h1>
                            <p className="text-xs text-muted-foreground">
                                Tap fields to add them to your form
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={saveForm}
                            disabled={isSaving}
                            className="h-7 px-2 text-xs gap-1 bg-transparent"
                            title="Save"
                        >
                            {isSaving ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Save className="w-3 h-3" />
                            )}
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/40 rounded-md pl-3 w-full max-w-180">
                        <Type className="w-4 h-4 text-muted-foreground" />
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter form title ..."
                            className="h-8 px-2 text-sm bg-transparent border-none focus-visible:ring-0 w-full"
                        />
                    </div>
                </div>

                <div className="hidden md:flex items-center justify-between">
                    <div>
                        <h1 className="text-sm font-bold">Form</h1>
                        <p className="text-xs text-muted-foreground">
                            Drag & drop to create dynamic forms
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                        <div className="flex items-center gap-2 bg-muted/40 rounded-md pl-3 w-full max-w-180">
                            <Type className="w-4 h-4 text-muted-foreground" />
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter form title ..."
                                className="h-8 px-2 text-sm bg-transparent border-none focus-visible:ring-0 w-full"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={saveForm}
                            disabled={isSaving}
                            className="h-7 px-2 text-xs gap-1 bg-transparent"
                            title="Save"
                        >
                            {isSaving ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Save className="w-3 h-3" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-background rounded-b-sm overflow-hidden min-h-0">
                <div className="flex md:hidden h-full flex-col min-h-0">
                    <Tabs
                        value={activeMobileTab}
                        onValueChange={(value) =>
                            setActiveMobileTab(value as 'palette' | 'canvas' | 'preview')
                        }
                        className="flex-1 flex flex-col min-h-0"
                    >
                        <TabsList className="w-full justify-start px-2 py-1 h-9 bg-card border-b border-border rounded-none">
                            <TabsTrigger value="palette" className="text-xs h-7">
                                Palette
                            </TabsTrigger>
                            <TabsTrigger value="canvas" className="text-xs h-7">
                                Canvas
                            </TabsTrigger>
                            <TabsTrigger value="preview" className="text-xs h-7">
                                Preview
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="palette"
                            className="flex-1 overflow-y-auto m-0 p-0 min-h-0"
                        >
                            <FieldPalette
                                onAddField={handleAddFieldFromPaletteMobile}
                                defaultSingleFields={paletteFields}
                                onAddDefaultField={handleAddDefaultFieldMobile}
                                customFieldSets={customFieldSets}
                                onAddCustomSet={handleAddCustomSetMobile}
                                onReset={resetForm}
                                onResetToDefault={refKey ? resetToInitial : undefined}
                            />
                        </TabsContent>

                        <TabsContent
                            value="canvas"
                            className="flex-1 overflow-y-auto m-0 p-0 min-h-0"
                        >
                            <FormCanvas
                                fields={fields}
                                rows={rows}
                                selectedFieldId={selectedFieldId}
                                onSelectField={(id) =>
                                    setSelectedFieldId((prev) => (prev === id ? null : id))
                                }
                                onRemoveField={removeField}
                                onUpdateField={updateField}
                                onDuplicateField={duplicateField}
                                onAddFieldToRow={addFieldToRow}
                                onInsertField={insertFieldAtIndex}
                                onInsertTemplateSet={(setId, index) =>
                                    addCustomFieldSet(setId, index)
                                }
                                onInsertConfiguredField={(template, index) =>
                                    insertConfiguredFieldAtIndex(template, index)
                                }
                                onReorderField={reorderFieldInRow}
                                onReorderRows={reorderRows}
                                loading={Boolean(refKey) && Boolean(isLoading)}
                            />
                        </TabsContent>

                        <TabsContent
                            value="preview"
                            className="flex-1 overflow-y-auto m-0 p-0 min-h-0"
                        >
                            <FormPreview
                                fields={fields}
                                rows={rows}
                                loading={Boolean(refKey) && Boolean(isLoading)}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="hidden md:flex flex-1 h-full overflow-hidden min-h-0 gap-0 bg-background rounded-b-sm">
                    <FieldPalette
                        onAddField={addFieldToRow}
                        defaultSingleFields={paletteFields}
                        onAddDefaultField={(template) =>
                            insertConfiguredFieldAtIndex(template, rows.length)
                        }
                        customFieldSets={customFieldSets}
                        onAddCustomSet={addCustomFieldSet}
                        onReset={resetForm}
                        onResetToDefault={refKey ? resetToInitial : undefined}
                    />
                    <FormCanvas
                        fields={fields}
                        rows={rows}
                        selectedFieldId={selectedFieldId}
                        onSelectField={(id) =>
                            setSelectedFieldId((prev) => (prev === id ? null : id))
                        }
                        onRemoveField={removeField}
                        onUpdateField={updateField}
                        onDuplicateField={duplicateField}
                        onAddFieldToRow={addFieldToRow}
                        onInsertField={insertFieldAtIndex}
                        onInsertTemplateSet={(setId, index) => addCustomFieldSet(setId, index)}
                        onInsertConfiguredField={(template, index) =>
                            insertConfiguredFieldAtIndex(template, index)
                        }
                        onReorderField={reorderFieldInRow}
                        onReorderRows={reorderRows}
                        loading={Boolean(refKey) && Boolean(isLoading)}
                    />
                    <FormPreview
                        fields={fields}
                        rows={rows}
                        loading={Boolean(refKey) && Boolean(isLoading)}
                    />
                </div>
                {/* Custom Toast Container */}
                <div className="fixed top-4 right-4 left-4 md:left-auto z-[9999] flex flex-col gap-2 pointer-events-none w-auto md:w-full md:max-w-sm">
                    {toasts.map((t) => (
                        <div
                            key={t.id}
                            className={`pointer-events-auto flex w-full items-start gap-3 p-4 rounded-lg border shadow-md transition-all duration-300 animate-in fade-in slide-in-from-top-5 ${
                                t.type === 'success'
                                    ? 'bg-background border-emerald-500/30 text-foreground dark:border-emerald-500/20'
                                    : 'bg-background border-destructive/30 text-foreground dark:border-destructive/20'
                            }`}
                            style={{
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                            }}
                        >
                            {t.type === 'success' ? (
                                <svg className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5 text-destructive shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            )}
                            <div className="flex-1 text-sm leading-5 font-medium">{t.message}</div>
                            <button
                                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                                className="text-muted-foreground hover:text-foreground shrink-0 transition-colors ml-1"
                                aria-label="Close"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
