'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import type { FormField, FormRow } from '@/types/form-builder.types';
import Image from 'next/image';

interface FormPreviewProps {
    fields: FormField[];
    rows: FormRow[];
    loading?: boolean;
}

export function FormPreview({ fields, rows, loading }: FormPreviewProps) {
    return (
        <div className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-border bg-card flex flex-col shrink-0 min-h-0 h-full">
            <div className="px-2 py-1.5 border-b border-border shrink-0">
                <h2 className="font-semibold text-xs uppercase text-muted-foreground">Preview</h2>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                <div className="p-2">
                    {loading ? (
                        <Card className="p-3 bg-card border border-border animate-pulse">
                            <div className="space-y-3">
                                <div className="h-4 bg-muted rounded w-1/2" />
                                <div className="h-7 bg-muted rounded" />
                                <div className="h-7 bg-muted rounded" />
                                <div className="h-7 bg-muted rounded" />
                                <div className="h-7 bg-muted rounded" />
                                <div className="h-7 bg-muted rounded" />
                                <div className="h-7 bg-muted rounded" />
                            </div>
                        </Card>
                    ) : rows.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-6">No fields</p>
                    ) : (
                        <Card className="p-3 bg-card rounded-sm">
                            <div className="space-y-3">
                                {rows.map((row) => {
                                    const rowFields = row.fields
                                        .map((fieldId) => fields.find((f) => f.id === fieldId))
                                        .filter((f): f is FormField => f !== undefined);

                                    // Calculate column spans for auto-sizing
                                    const fullWidthFieldsCount = rowFields.filter(
                                        (f) => !f.columnWidth || f.columnWidth === 'full',
                                    ).length;
                                    const explicitWidthsSum = rowFields.reduce((sum, f) => {
                                        if (f.columnWidth === 'half') return sum + 6;
                                        if (f.columnWidth === 'third') return sum + 4;
                                        if (f.columnWidth === 'quarter') return sum + 3;
                                        return sum;
                                    }, 0);

                                    const remainingCols = Math.max(0, 12 - explicitWidthsSum);
                                    const autoSpan =
                                        fullWidthFieldsCount > 0
                                            ? Math.max(
                                                1,
                                                Math.floor(remainingCols / fullWidthFieldsCount),
                                            )
                                            : 12;

                                    return (
                                        <div key={row.id} className="grid grid-cols-12 gap-2">
                                            {rowFields.map((field) => {
                                                let colSpanClass = 'col-span-12';

                                                if (field.columnWidth === 'half')
                                                    colSpanClass = 'col-span-6';
                                                else if (field.columnWidth === 'third')
                                                    colSpanClass = 'col-span-4';
                                                else if (field.columnWidth === 'quarter')
                                                    colSpanClass = 'col-span-3';
                                                else {
                                                    // Handle 'full' or undefined - use calculated auto span
                                                    colSpanClass = `col-span-${autoSpan}`;
                                                }

                                                return (
                                                    <div key={field.id} className={colSpanClass}>
                                                        <PreviewField field={field} />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                                <Button className="w-full h-7 text-xs mt-2 bg-blue-900/80 hover:bg-blue-800/80 text-white">
                                    Submit
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

function PreviewField({ field }: { field: FormField }) {
    // Don't render hidden fields in preview
    if (field.type === 'hidden') return null;

    if (field.type === 'header') {
        return <h3 className="font-bold text-xs text-foreground">{field.placeholder}</h3>;
    }

    if (field.type === 'paragraph') {
        return <p className="text-xs text-muted-foreground">{field.placeholder}</p>;
    }

    if (field.type === 'image') {
        return (
            <Image
                src={field.placeholder || '/placeholder.svg'}
                alt="Field image"
                width={400}
                height={300}
                className="w-full h-auto rounded"
                priority={false}
            />
        );
    }

    return (
        <div className="space-y-1">
            <Label className="text-xs font-medium">
                {field.label}
                {field.required && <span className="text-destructive ml-0.5">*</span>}
            </Label>
            {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}

            {field.type === 'textarea' && (
                <Textarea
                    placeholder={field.placeholder}
                    rows={field.rows || 2}
                    disabled
                    className="text-xs resize-none"
                />
            )}

            {field.type === 'checkbox' && (
                <div
                    className={
                        field.orientation === 'vertical'
                            ? 'flex flex-col gap-2'
                            : 'flex flex-wrap gap-3'
                    }
                >
                    {(field.options || ['Option 1']).map((option, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                            <Checkbox disabled />
                            <span className="text-xs">{option}</span>
                        </div>
                    ))}
                </div>
            )}

            {field.type === 'radio' && (
                <RadioGroup
                    disabled
                    className={
                        field.orientation === 'vertical'
                            ? 'flex flex-col gap-2'
                            : 'flex flex-wrap gap-3'
                    }
                >
                    {(field.options || ['Option 1']).map((option, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                            <RadioGroupItem value={option} disabled />
                            <span className="text-xs">{option}</span>
                        </div>
                    ))}
                </RadioGroup>
            )}

            {field.type === 'select' && (
                <Select disabled>
                    <SelectTrigger className="h-7! text-xs w-full">
                        <SelectValue placeholder={field.placeholder || 'Select...'} />
                    </SelectTrigger>
                    <SelectContent>
                        {(field.options || []).map((option, idx) => (
                            <SelectItem key={idx} value={option} className="text-xs">
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {field.type === 'multiselect' && (
                <div
                    className={
                        field.orientation === 'horizontal' ? 'flex flex-wrap gap-3' : 'space-y-1'
                    }
                >
                    {(field.options || []).map((option, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                            <Checkbox disabled />
                            <span className="text-xs">{option}</span>
                        </div>
                    ))}
                </div>
            )}

            {field.type === 'file' && (
                <Input type="file" accept={field.accept} disabled className="h-7 text-xs" />
            )}

            {field.type === 'toggle' && <Switch disabled />}

            {field.type === 'slider' && (
                <Slider
                    min={field.minValue || 0}
                    max={field.maxValue || 100}
                    step={field.step || 1}
                    disabled
                />
            )}

            {field.type === 'rating' && (
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} disabled className="text-xs text-muted-foreground">
                            ★
                        </button>
                    ))}
                </div>
            )}

            {![
                'textarea',
                'checkbox',
                'radio',
                'select',
                'multiselect',
                'file',
                'toggle',
                'slider',
                'rating',
            ].includes(field.type) && (
                    <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        disabled
                        className="h-7 text-xs"
                    />
                )}
        </div>
    );
}
