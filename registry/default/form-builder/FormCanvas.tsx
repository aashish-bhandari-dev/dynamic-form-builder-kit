'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { FormField, FormRow, PaletteFieldTemplate } from './types';
import { toFormFieldName as toFormFieldNameRaw } from './utils';
import {
    Trash2,
    Copy,
    Plus,
    ChevronLeft,
    ChevronRight,
    GripVertical,
    ChevronDown,
    ChevronUp,
    X,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface FormCanvasProps {
    fields: FormField[];
    rows: FormRow[];
    selectedFieldId: string | null;
    onSelectField: (id: string) => void;
    onRemoveField: (id: string) => void;
    onUpdateField: (id: string, updates: Partial<FormField>) => void;
    onDuplicateField: (id: string) => void;
    onAddFieldToRow: (type: string, rowId: string) => void;
    onInsertField: (type: string, index: number) => void;
    onInsertTemplateSet?: (setId: string, index: number) => void;
    onInsertConfiguredField?: (template: PaletteFieldTemplate, index: number) => void;
    onReorderField: (fieldId: string, direction: 'left' | 'right') => void;
    onReorderRows: (fromIndex: number, toIndex: number) => void;
    loading?: boolean;
}

const fieldTypes = [
    { type: 'text', label: 'Text' },
    { type: 'email', label: 'Email' },
    { type: 'password', label: 'Password' },
    { type: 'number', label: 'Number' },
    { type: 'url', label: 'URL' },
    { type: 'tel', label: 'Phone' },
    { type: 'textarea', label: 'Textarea' },
    { type: 'date', label: 'Date' },
    { type: 'time', label: 'Time' },
    { type: 'datetime-local', label: 'DateTime' },
    { type: 'checkbox', label: 'Checkbox Group' },
    { type: 'radio', label: 'Radio Group' },
    { type: 'select', label: 'Select' },
    { type: 'multiselect', label: 'Multi-Select' },
    { type: 'file', label: 'File Upload' },
    { type: 'toggle', label: 'Toggle' },
    { type: 'slider', label: 'Slider' },
    { type: 'rating', label: 'Rating' },
    { type: 'header', label: 'Header' },
    { type: 'paragraph', label: 'Paragraph' },
    { type: 'image', label: 'Image' },
    { type: 'hidden', label: 'Hidden Input' },
] as const;

export function FormCanvas({
    fields,
    rows,
    selectedFieldId,
    onSelectField,
    onRemoveField,
    onUpdateField,
    onDuplicateField,
    onAddFieldToRow,
    onInsertField,
    onInsertTemplateSet,
    onInsertConfiguredField,
    onReorderField,
    onReorderRows,
    loading,
}: FormCanvasProps) {
    const toFormFieldName = (value: string): string => {
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
    };

    const [propertiesHeight, setPropertiesHeight] = useState(300);
    const [isResizing, setIsResizing] = useState(false);
    const resizingRef = useRef<{ startY: number; startHeight: number } | null>(null);

    const startResizing = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        resizingRef.current = { startY: e.clientY, startHeight: propertiesHeight };
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !resizingRef.current) return;
            const delta = resizingRef.current.startY - e.clientY;
            setPropertiesHeight(
                Math.max(
                    150,
                    Math.min(resizingRef.current.startHeight + delta, window.innerHeight - 200),
                ),
            );
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
    const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
    const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);
    const [dropTarget, setDropTarget] = useState<{
        index: number;
        position: 'top' | 'bottom';
    } | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const prevRowsLength = useRef(rows.length);
    const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (rows.length > prevRowsLength.current) {
            if (scrollContainerRef.current) {
                setTimeout(() => {
                    scrollContainerRef.current?.scrollTo({
                        top: scrollContainerRef.current.scrollHeight,
                        behavior: 'smooth',
                    });
                }, 100);
            }
        }
        prevRowsLength.current = rows.length;
    }, [rows.length]);

    // Cleanup scroll interval on unmount
    useEffect(() => {
        return () => {
            if (scrollIntervalRef.current) {
                clearInterval(scrollIntervalRef.current);
            }
        };
    }, []);

    // Scroll selected field into view
    useEffect(() => {
        if (selectedFieldId && scrollContainerRef.current) {
            const field = fields.find((f) => f.id === selectedFieldId);
            if (field) {
                // We need a small delay to allow the properties panel to open/render
                // and the container height to adjust
                setTimeout(() => {
                    const rowElement = document.getElementById(`form-row-${field.rowId}`);
                    if (rowElement && scrollContainerRef.current) {
                        rowElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest',
                        });
                    }
                }, 150);
            }
        }
    }, [selectedFieldId, isPropertiesOpen, fields]);

    const stopAutoScroll = () => {
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
        }
    };

    const handleDragOverScroll = (e: React.DragEvent) => {
        e.preventDefault();
        const container = scrollContainerRef.current;
        if (!container) return;

        const { top, bottom, height } = container.getBoundingClientRect();
        const mouseY = e.clientY;
        const threshold = 60; // Distance from edge to start scrolling
        const speed = 10; // Scroll speed

        // Check if mouse is near top or bottom
        if (mouseY < top + threshold) {
            // Scroll Up
            if (!scrollIntervalRef.current) {
                scrollIntervalRef.current = setInterval(() => {
                    container.scrollTop -= speed;
                }, 16);
            }
        } else if (mouseY > bottom - threshold) {
            // Scroll Down
            if (!scrollIntervalRef.current) {
                scrollIntervalRef.current = setInterval(() => {
                    container.scrollTop += speed;
                }, 16);
            }
        } else {
            // In the middle, stop scrolling
            stopAutoScroll();
        }
    };

    const handleDragLeaveScroll = (e: React.DragEvent) => {
        // Stop scrolling if leaving the container (but not if entering a child)
        if (scrollContainerRef.current?.contains(e.relatedTarget as Node)) {
            return;
        }
        stopAutoScroll();
    };

    const selectedField = fields.find((f) => f.id === selectedFieldId);
    const isDefaultField = (field: FormField) => field.isDefault === true;

    const isMandatoryField = (field: FormField) => {
        const nameKey = toFormFieldName(field.name || '');
        return nameKey === 'full_name' || nameKey === 'email' || nameKey === 'phone_number';
    };

    const handleRowDragStart = (e: React.DragEvent, rowIndex: number) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('rowIndex', rowIndex.toString());
        setDraggedRowId(rows[rowIndex].id);
    };

    const handleRowDragOver = (e: React.DragEvent, rowIndex: number) => {
        e.preventDefault();

        // Check if we are dragging a field from palette (copy) or reordering rows (move)
        const types = e.dataTransfer.types;
        const isFieldType = Array.from(types).some((t) => t.toLowerCase() === 'fieldtype');
        const isTemplateSet = Array.from(types).some((t) => t.toLowerCase() === 'templatesetid');
        const isConfiguredField = Array.from(types).some(
            (t) => t.toLowerCase() === 'configuredfield',
        );

        if (isFieldType || isTemplateSet || isConfiguredField) {
            e.dataTransfer.dropEffect = 'copy';
        } else {
            e.dataTransfer.dropEffect = 'move';
        }

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const midY = rect.top + rect.height / 2;

        setDropTarget({
            index: rowIndex,
            position: e.clientY < midY ? 'top' : 'bottom',
        });
    };

    const handleRowDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();

        const configuredFieldRaw = e.dataTransfer.getData('configuredField');
        if (configuredFieldRaw) {
            e.stopPropagation();
            let insertIndex = targetIndex;
            if (dropTarget?.index === targetIndex && dropTarget.position === 'bottom') {
                insertIndex = targetIndex + 1;
            }
            try {
                const template = JSON.parse(configuredFieldRaw) as PaletteFieldTemplate;
                onInsertConfiguredField?.(template, insertIndex);
            } catch {
                // ignore invalid payload
            }
            setDraggedRowId(null);
            setDropTarget(null);
            return;
        }

        const templateSetId = e.dataTransfer.getData('templateSetId');
        if (templateSetId) {
            e.stopPropagation();
            let insertIndex = targetIndex;
            if (dropTarget?.index === targetIndex && dropTarget.position === 'bottom') {
                insertIndex = targetIndex + 1;
            }
            onInsertTemplateSet?.(templateSetId, insertIndex);
            setDraggedRowId(null);
            setDropTarget(null);
            return;
        }

        const fieldType = e.dataTransfer.getData('fieldType');
        if (fieldType) {
            e.stopPropagation();
            let insertIndex = targetIndex;
            if (dropTarget?.index === targetIndex && dropTarget.position === 'bottom') {
                insertIndex = targetIndex + 1;
            }
            onInsertField(fieldType, insertIndex);
            setDraggedRowId(null);
            setDropTarget(null);
            return;
        }

        // Allow bubbling if not handled here (though we mostly handle it)

        const fromIndex = Number.parseInt(e.dataTransfer.getData('rowIndex'));
        if (isNaN(fromIndex)) {
            setDropTarget(null);
            return; // Let it bubble to container (e.g. for new field addition)
        }

        e.stopPropagation(); // Stop bubbling only if we successfully handled a row reorder

        let toIndex = targetIndex;
        if (dropTarget?.index === targetIndex && dropTarget.position === 'bottom') {
            toIndex = targetIndex + 1;
        }

        // Adjust index if moving downwards
        if (fromIndex < toIndex) {
            toIndex -= 1;
        }

        if (fromIndex !== toIndex) {
            onReorderRows(fromIndex, toIndex);
        }
        setDraggedRowId(null);
        setDropTarget(null);
    };

    const handleCanvasDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleCanvasDrop = (e: React.DragEvent, rowId?: string) => {
        e.preventDefault();
        const configuredFieldRaw = e.dataTransfer.getData('configuredField');
        if (configuredFieldRaw) {
            try {
                const template = JSON.parse(configuredFieldRaw) as PaletteFieldTemplate;
                onInsertConfiguredField?.(template, rows.length);
            } catch {
                // ignore invalid payload
            }
            return;
        }
        const templateSetId = e.dataTransfer.getData('templateSetId');
        if (templateSetId) {
            onInsertTemplateSet?.(templateSetId, rows.length);
            return;
        }
        const fieldType = e.dataTransfer.getData('fieldType');
        // If dropping on empty canvas, add to end (which is index 0)
        if (fieldType) {
            onInsertField(fieldType, rows.length);
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-background min-h-0 h-full">
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto scrollbar-thin"
                onDragOver={handleDragOverScroll}
                onDragLeave={handleDragLeaveScroll}
                onDragEnd={stopAutoScroll}
                onMouseUp={stopAutoScroll}
                onDrop={(e) => {
                    stopAutoScroll();
                    const configuredFieldRaw = e.dataTransfer.getData('configuredField');
                    if (configuredFieldRaw) {
                        e.preventDefault();
                        try {
                            const template = JSON.parse(configuredFieldRaw) as PaletteFieldTemplate;
                            onInsertConfiguredField?.(template, rows.length);
                        } catch {
                            // ignore invalid payload
                        }
                        return;
                    }
                    const templateSetId = e.dataTransfer.getData('templateSetId');
                    if (templateSetId) {
                        e.preventDefault();
                        onInsertTemplateSet?.(templateSetId, rows.length);
                        return;
                    }
                    const fieldType = e.dataTransfer.getData('fieldType');
                    if (fieldType) {
                        e.preventDefault();
                        onInsertField(fieldType, rows.length);
                    }
                }}
            >
                <div className="p-2">
                    <div className="space-y-1">
                        {loading ? (
                            <div>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className="relative flex gap-1 items-stretch p-1.5 rounded border border-border bg-card animate-pulse"
                                    >
                                        <div className="shrink-0 w-4 pt-0.5">
                                            <div className="w-3 h-3 bg-muted rounded mt-3.5" />
                                        </div>
                                        <div className="flex-1 flex gap-1">
                                            <div className="flex-1 min-w-0">
                                                <div className="h-17 bg-muted/50 rounded-lg" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="h-17 bg-muted/50 rounded-lg" />
                                            </div>
                                        </div>
                                        <div className="shrink-0 self-start mt-3.5 ml-1">
                                            <div className="w-8 h-8 bg-muted/50 rounded border border-dashed" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : rows.length === 0 ? (
                            <Card
                                className="p-8 bg-card border-dashed border-2 border-border flex items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-colors"
                                onDragOver={handleCanvasDragOver}
                                onDrop={(e) => handleCanvasDrop(e)}
                            >
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">
                                        Click on the fields to start
                                    </p>
                                </div>
                            </Card>
                        ) : (
                            rows.map((row, rowIndex) => {
                                const rowFields = row.fields
                                    .map((fieldId) => fields.find((f) => f.id === fieldId))
                                    .filter((f): f is FormField => f !== undefined);
                                return (
                                    <div
                                        key={row.id}
                                        id={`form-row-${row.id}`}
                                        draggable
                                        onDragStart={(e) => handleRowDragStart(e, rowIndex)}
                                        onDragOver={(e) => handleRowDragOver(e, rowIndex)}
                                        onDrop={(e) => handleRowDrop(e, rowIndex)}
                                        onDragLeave={() => setDropTarget(null)}
                                        className={`relative flex gap-1 items-stretch p-1.5 rounded border transition-all cursor-grab active:cursor-grabbing ${
                                            draggedRowId === row.id
                                                ? 'border-primary bg-primary/5 border-2'
                                                : 'border-border hover:border-border/70'
                                        }`}
                                    >
                                        {dropTarget?.index === rowIndex &&
                                            dropTarget.position === 'top' && (
                                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary rounded-full transform -translate-y-1/2 z-10 pointer-events-none" />
                                            )}
                                        {dropTarget?.index === rowIndex &&
                                            dropTarget.position === 'bottom' && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full transform translate-y-1/2 z-10 pointer-events-none" />
                                            )}
                                        <div className="shrink-0 flex items-start pt-0.5 cursor-grab active:cursor-grabbing">
                                            <GripVertical className="w-3 h-3 text-muted-foreground mt-3.5" />
                                        </div>

                                        {rowFields.map((field, idx) => (
                                            <div key={field.id} className="flex-1 min-w-0">
                                                <FieldCard
                                                    field={field}
                                                    isSelected={selectedFieldId === field.id}
                                                    onSelect={() => onSelectField(field.id)}
                                                    onRemove={() => onRemoveField(field.id)}
                                                    onDuplicate={() => onDuplicateField(field.id)}
                                                    onReorderLeft={() =>
                                                        idx > 0 && onReorderField(field.id, 'left')
                                                    }
                                                    onReorderRight={() =>
                                                        idx < rowFields.length - 1 &&
                                                        onReorderField(field.id, 'right')
                                                    }
                                                    canMoveLeft={idx > 0}
                                                    canMoveRight={idx < rowFields.length - 1}
                                                    isDragged={draggedFieldId === field.id}
                                                    disableDelete={isMandatoryField(field)}
                                                />
                                            </div>
                                        ))}

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-auto p-0.5 self-start mt-3.5 border-dashed bg-transparent hover:bg-accent shrink-0 disabled:opacity-50"
                                                    title={
                                                        rowFields.length >= 3
                                                            ? 'Row is full (max 3)'
                                                            : 'Add field to row'
                                                    }
                                                    disabled={rowFields.length >= 3}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="start"
                                                className="max-h-64 overflow-y-auto w-40"
                                            >
                                                {fieldTypes.map((ft) => (
                                                    <DropdownMenuItem
                                                        key={ft.type}
                                                        onClick={() =>
                                                            onAddFieldToRow(ft.type, row.id)
                                                        }
                                                    >
                                                        <span className="text-xs">{ft.label}</span>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {selectedField && (
                <>
                    <div
                        className="h-1.5 w-full cursor-row-resize hover:bg-primary/20 active:bg-primary/40 transition-colors flex items-center justify-center group"
                        onMouseDown={startResizing}
                        title="Drag to resize"
                    >
                        <div className="w-8 h-1 bg-border rounded-full group-hover:bg-primary/50 transition-colors" />
                    </div>
                    <div className="border-t border-border bg-card/50 transition-all">
                        <div
                            className="flex items-center justify-between px-2 py-2 cursor-pointer hover:bg-accent/50"
                            onClick={() => setIsPropertiesOpen(!isPropertiesOpen)}
                        >
                            <div className="font-semibold text-xs text-muted-foreground">
                                Properties
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectField(selectedField.id); // Toggle selection (deselect)
                                    }}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                    {isPropertiesOpen ? (
                                        <ChevronDown className="w-3.5 h-3.5" />
                                    ) : (
                                        <ChevronUp className="w-3.5 h-3.5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        {isPropertiesOpen && (
                            <div
                                style={{ height: propertiesHeight }}
                                className="overflow-y-auto scrollbar-thin border-t border-border/50 px-2"
                            >
                                <div className="p-2 space-y-2.5 text-xs">
                                    <div className="flex gap-2">
                                        <div className="space-y-1 flex-[0.8]">
                                            <Label className="text-xs font-medium">Label</Label>
                                            <Input
                                                value={selectedField.label}
                                                onChange={(e) => {
                                                    const nextLabel = e.target.value;
                                                    const currentAutoName = toFormFieldName(
                                                        selectedField.label || '',
                                                    );
                                                    const isAuto =
                                                        !selectedField.name ||
                                                        selectedField.name === currentAutoName;
                                                    onUpdateField(selectedField.id, {
                                                        label: nextLabel,
                                                        ...(isAuto
                                                            ? { name: toFormFieldName(nextLabel) }
                                                            : {}),
                                                    });
                                                }}
                                                className="mt-0.5 h-6 text-xs"
                                                disabled={isDefaultField(selectedField)}
                                            />
                                        </div>
                                        <div className="flex flex-col items-center flex-[0.2]">
                                            <Label
                                                htmlFor="required"
                                                className="text-xs font-medium block truncate"
                                                title="Required"
                                            >
                                                Required ?
                                            </Label>
                                            <div className="h-6 flex items-center mt-0.5">
                                                <Checkbox
                                                    className="cursor-pointer h-4.5 w-4.5"
                                                    id="required"
                                                    checked={selectedField.required || false}
                                                    onCheckedChange={(checked) =>
                                                        onUpdateField(selectedField.id, {
                                                            required: checked === true,
                                                        })
                                                    }
                                                    disabled={
                                                        isDefaultField(selectedField) &&
                                                        selectedField.isDefaultRequired
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Name</Label>
                                        <Input
                                            value={selectedField.name || ''}
                                            onChange={(e) =>
                                                onUpdateField(selectedField.id, {
                                                    name: toFormFieldName(e.target.value),
                                                })
                                            }
                                            className="mt-0.5 h-6 text-xs"
                                            placeholder="full_name"
                                            disabled={isDefaultField(selectedField)}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Placeholder</Label>
                                        <Input
                                            value={selectedField.placeholder || ''}
                                            onChange={(e) =>
                                                onUpdateField(selectedField.id, {
                                                    placeholder: e.target.value,
                                                })
                                            }
                                            className="mt-0.5 h-6 text-xs"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Help Text</Label>
                                        <Input
                                            value={selectedField.helpText || ''}
                                            onChange={(e) =>
                                                onUpdateField(selectedField.id, {
                                                    helpText: e.target.value,
                                                })
                                            }
                                            className="mt-0.5 h-6 text-xs"
                                        />
                                    </div>

                                    <div
                                        className={`grid gap-2 ${
                                            ['radio', 'checkbox', 'multiselect'].includes(
                                                selectedField.type,
                                            )
                                                ? 'grid-cols-2'
                                                : 'grid-cols-1'
                                        }`}
                                    >
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">
                                                Column Width
                                            </Label>
                                            <Select
                                                value={selectedField.columnWidth || 'full'}
                                                onValueChange={(value) =>
                                                    onUpdateField(selectedField.id, {
                                                        columnWidth: value as any,
                                                    })
                                                }
                                            >
                                                <SelectTrigger className="mt-0.5 h-6 text-xs w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="full" className="text-xs">
                                                        Full Width
                                                    </SelectItem>
                                                    <SelectItem value="half" className="text-xs">
                                                        Half Width (1/2)
                                                    </SelectItem>
                                                    <SelectItem value="third" className="text-xs">
                                                        One Third (1/3)
                                                    </SelectItem>
                                                    <SelectItem value="quarter" className="text-xs">
                                                        One Quarter (1/4)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {['radio', 'checkbox', 'multiselect'].includes(
                                            selectedField.type,
                                        ) && (
                                            <div className="space-y-1">
                                                <Label className="text-xs font-medium">
                                                    Layout
                                                </Label>
                                                <Select
                                                    value={
                                                        selectedField.orientation || 'horizontal'
                                                    }
                                                    onValueChange={(value) =>
                                                        onUpdateField(selectedField.id, {
                                                            orientation: value as any,
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger className="mt-0.5 h-6 text-xs w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem
                                                            value="horizontal"
                                                            className="text-xs"
                                                        >
                                                            Horizontal
                                                        </SelectItem>
                                                        <SelectItem
                                                            value="vertical"
                                                            className="text-xs"
                                                        >
                                                            Vertical
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>

                                    {['select', 'radio', 'checkbox', 'multiselect'].includes(
                                        selectedField.type,
                                    ) && (
                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium">Options</Label>
                                            <div className="space-y-1.5">
                                                {(selectedField.options || []).map(
                                                    (option, idx) => (
                                                        <div key={idx} className="flex gap-1">
                                                            <Input
                                                                value={option}
                                                                onChange={(e) => {
                                                                    const newOptions = [
                                                                        ...(selectedField.options ||
                                                                            []),
                                                                    ];
                                                                    newOptions[idx] =
                                                                        e.target.value;
                                                                    onUpdateField(
                                                                        selectedField.id,
                                                                        {
                                                                            options: newOptions,
                                                                        },
                                                                    );
                                                                }}
                                                                className="h-7 text-xs flex-1"
                                                                placeholder={`Option ${idx + 1}`}
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10"
                                                                onClick={() => {
                                                                    const newOptions = (
                                                                        selectedField.options || []
                                                                    ).filter((_, i) => i !== idx);
                                                                    onUpdateField(
                                                                        selectedField.id,
                                                                        {
                                                                            options: newOptions,
                                                                        },
                                                                    );
                                                                }}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    ),
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full h-7 text-xs border-dashed"
                                                    onClick={() => {
                                                        const newOptions = [
                                                            ...(selectedField.options || []),
                                                            `Option ${(selectedField.options?.length || 0) + 1}`,
                                                        ];
                                                        onUpdateField(selectedField.id, {
                                                            options: newOptions,
                                                        });
                                                    }}
                                                >
                                                    <Plus className="w-3 h-3 mr-1" />
                                                    Add Option
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {['number', 'slider'].includes(selectedField.type) && (
                                        <div className="grid grid-cols-3 gap-1">
                                            <div className="space-y-1">
                                                <Label className="text-xs font-medium">Min</Label>
                                                <Input
                                                    type="number"
                                                    value={selectedField.minValue || 0}
                                                    onChange={(e) =>
                                                        onUpdateField(selectedField.id, {
                                                            minValue: Number.parseInt(
                                                                e.target.value,
                                                            ),
                                                        })
                                                    }
                                                    className="mt-0.5 h-6 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs font-medium">Max</Label>
                                                <Input
                                                    type="number"
                                                    value={selectedField.maxValue || 100}
                                                    onChange={(e) =>
                                                        onUpdateField(selectedField.id, {
                                                            maxValue: Number.parseInt(
                                                                e.target.value,
                                                            ),
                                                        })
                                                    }
                                                    className="mt-0.5 h-6 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs font-medium">Step</Label>
                                                <Input
                                                    type="number"
                                                    value={selectedField.step || 1}
                                                    onChange={(e) =>
                                                        onUpdateField(selectedField.id, {
                                                            step: Number.parseInt(e.target.value),
                                                        })
                                                    }
                                                    className="mt-0.5 h-6 text-xs"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {selectedField.type === 'textarea' && (
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">Rows</Label>
                                            <Input
                                                type="number"
                                                value={selectedField.rows || 3}
                                                onChange={(e) =>
                                                    onUpdateField(selectedField.id, {
                                                        rows: Number.parseInt(e.target.value),
                                                    })
                                                }
                                                className="mt-0.5 h-6 text-xs"
                                            />
                                        </div>
                                    )}

                                    {selectedField.type === 'file' && (
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">Accept</Label>
                                            <Input
                                                value={selectedField.accept || ''}
                                                placeholder=".pdf,.doc"
                                                onChange={(e) =>
                                                    onUpdateField(selectedField.id, {
                                                        accept: e.target.value,
                                                    })
                                                }
                                                className="mt-0.5 h-6 text-xs"
                                            />
                                        </div>
                                    )}

                                    {['header', 'paragraph', 'image'].includes(
                                        selectedField.type,
                                    ) && (
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">Content</Label>
                                            <Input
                                                value={selectedField.placeholder || ''}
                                                onChange={(e) =>
                                                    onUpdateField(selectedField.id, {
                                                        placeholder: e.target.value,
                                                    })
                                                }
                                                className="mt-0.5 h-6 text-xs"
                                                placeholder={
                                                    selectedField.type === 'image'
                                                        ? 'Image URL'
                                                        : 'Text content'
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function FieldCard({
    field,
    isSelected,
    onSelect,
    onRemove,
    onDuplicate,
    onReorderLeft,
    onReorderRight,
    canMoveLeft,
    canMoveRight,
    isDragged,
    disableDelete,
}: any) {
    return (
        <Card
            className={`p-1.5 cursor-pointer transition-all rounded-md ${
                isSelected
                    ? `
                border-border
                ring-1 ring-primary/25
                bg-primary/3
                dark:bg-muted
              `
                    : isDragged
                      ? `
                border-border
                ring-1 ring-primary/20
                bg-primary/5
                dark:bg-muted/30
                opacity-80
              `
                      : `
                border-border
                hover:ring-1 hover:ring-primary/20
                hover:bg-accent/20
                dark:hover:bg-muted/30
              `
            }`}
            onClick={onSelect}
        >
            <div className="space-y-0.5">
                <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs text-foreground truncate">
                            {field.label}
                            {field.required && <span className="text-destructive ml-0.5">*</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{field.type}</p>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 hover:bg-accent"
                            onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                onDuplicate();
                            }}
                            title="Duplicate"
                        >
                            <Copy className="w-2.5 h-2.5" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 text-destructive hover:bg-destructive/10"
                            onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            title="Delete"
                            disabled={Boolean(disableDelete)}
                        >
                            <Trash2 className="w-2.5 h-2.5" />
                        </Button>
                    </div>
                </div>
                <div className="flex gap-0.5">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0 text-xs hover:bg-accent"
                        disabled={!canMoveLeft}
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onReorderLeft();
                        }}
                        title="Move left"
                    >
                        <ChevronLeft className="w-2.5 h-2.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0 text-xs hover:bg-accent"
                        disabled={!canMoveRight}
                        onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onReorderRight();
                        }}
                        title="Move right"
                    >
                        <ChevronRight className="w-2.5 h-2.5" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
