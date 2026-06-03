'use client';

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import type { CustomFieldSet, PaletteFieldTemplate } from './types';
import {
    Type,
    Mail,
    Lock,
    Hash,
    LinkIcon,
    Phone,
    Calendar,
    Clock,
    MessageSquare,
    CheckSquare,
    Radio,
    ListTodo,
    FileText,
    ToggleLeft,
    Star,
    Sliders,
    Heading1,
    AlignLeft,
    Eye,
    AlignCenter,
    RotateCcw,
    History,
} from 'lucide-react';

const fieldTypes: Array<{
    type: string;
    label: string;
    icon: React.ReactNode;
    category: string;
}> = [
    {
        type: 'header',
        label: 'Header',
        icon: <Heading1 className="w-3.5 h-3.5" />,
        category: 'Content',
    },
    {
        type: 'paragraph',
        label: 'Paragraph',
        icon: <AlignLeft className="w-3.5 h-3.5" />,
        category: 'Content',
    },
    // {
    //     type: 'image',
    //     label: 'Image',
    //     icon: <ImageIcon className="w-3.5 h-3.5" />,
    //     category: 'Content',
    // },
    { type: 'text', label: 'Text', icon: <Type className="w-3.5 h-3.5" />, category: 'Basic' },
    { type: 'email', label: 'Email', icon: <Mail className="w-3.5 h-3.5" />, category: 'Basic' },
    {
        type: 'password',
        label: 'Password',
        icon: <Lock className="w-3.5 h-3.5" />,
        category: 'Basic',
    },
    { type: 'number', label: 'Number', icon: <Hash className="w-3.5 h-3.5" />, category: 'Basic' },
    { type: 'url', label: 'URL', icon: <LinkIcon className="w-3.5 h-3.5" />, category: 'Basic' },
    { type: 'tel', label: 'Phone', icon: <Phone className="w-3.5 h-3.5" />, category: 'Basic' },
    {
        type: 'textarea',
        label: 'Textarea',
        icon: <MessageSquare className="w-3.5 h-3.5" />,
        category: 'Basic',
    },

    {
        type: 'date',
        label: 'Date',
        icon: <Calendar className="w-3.5 h-3.5" />,
        category: 'Date & Time',
    },
    {
        type: 'time',
        label: 'Time',
        icon: <Clock className="w-3.5 h-3.5" />,
        category: 'Date & Time',
    },
    {
        type: 'datetime-local',
        label: 'DateTime',
        icon: <Calendar className="w-3.5 h-3.5" />,
        category: 'Date & Time',
    },

    {
        type: 'checkbox',
        label: 'Checkbox Group',
        icon: <CheckSquare className="w-3.5 h-3.5" />,
        category: 'Selection',
    },
    {
        type: 'radio',
        label: 'Radio Group',
        icon: <Radio className="w-3.5 h-3.5" />,
        category: 'Selection',
    },
    {
        type: 'select',
        label: 'Select',
        icon: <ListTodo className="w-3.5 h-3.5" />,
        category: 'Selection',
    },
    {
        type: 'multiselect',
        label: 'Multi-Select',
        icon: <ListTodo className="w-3.5 h-3.5" />,
        category: 'Selection',
    },

    {
        type: 'file',
        label: 'File Upload',
        icon: <FileText className="w-3.5 h-3.5" />,
        category: 'Advanced',
    },
    {
        type: 'toggle',
        label: 'Toggle',
        icon: <ToggleLeft className="w-3.5 h-3.5" />,
        category: 'Advanced',
    },
    {
        type: 'rating',
        label: 'Rating',
        icon: <Star className="w-3.5 h-3.5" />,
        category: 'Advanced',
    },
    {
        type: 'slider',
        label: 'Slider',
        icon: <Sliders className="w-3.5 h-3.5" />,
        category: 'Advanced',
    },
    {
        type: 'hidden',
        label: 'Hidden Input',
        icon: <Eye className="w-3.5 h-3.5" />,
        category: 'Advanced',
    },
];

const groupedFields = fieldTypes.reduce(
    (acc, field) => {
        if (!acc[field.category]) acc[field.category] = [];
        acc[field.category].push(field);
        return acc;
    },
    {} as Record<string, typeof fieldTypes>,
);

interface FieldPaletteProps {
    onAddField: (type: string) => void;
    defaultSingleFields: PaletteFieldTemplate[];
    onAddDefaultField: (template: PaletteFieldTemplate) => void;
    customFieldSets: CustomFieldSet[];
    onAddCustomSet: (setId: string) => void;
    onReset?: () => void;
    onResetToDefault?: () => void;
}

export function FieldPalette({
    onAddField,
    defaultSingleFields,
    onAddDefaultField,
    customFieldSets,
    onAddCustomSet,
    onReset,
    onResetToDefault,
}: FieldPaletteProps) {
    const handleDragStart = (e: React.DragEvent, fieldType: string) => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('fieldType', fieldType);
    };

    const handleTemplateDragStart = (e: React.DragEvent, setId: string) => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('templateSetId', setId);
    };

    const handleDefaultFieldDragStart = (e: React.DragEvent, template: PaletteFieldTemplate) => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('configuredField', JSON.stringify(template));
    };

    return (
        <div className="w-full md:w-52 border-b md:border-b-0 md:border-r border-border bg-card flex flex-col min-h-0 md:h-full">
            <div className="px-2 py-1.5 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-xs text-muted-foreground">Fields</h2>
                <div className="flex items-center gap-1">
                    {onResetToDefault && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            onClick={onResetToDefault}
                            title="Reset to Original"
                        >
                            <History className="w-3.5 h-3.5" />
                        </Button>
                    )}
                    {onReset && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={onReset}
                            title="Reset Form"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>
            </div>
            <div className="flex-1 overflow-hidden min-h-0">
                <Tabs defaultValue="fields" className="w-full h-full flex flex-col min-h-0">
                    <TabsList className="w-full justify-start px-2 py-1 h-7 bg-transparent rounded-none border-b border-border shrink-0">
                        <TabsTrigger value="fields" className="text-xs h-6">
                            Fields
                        </TabsTrigger>
                        <TabsTrigger value="templates" className="text-xs h-6">
                            Templates
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="fields"
                        className="flex-1 p-1.5 space-y-2 mt-0 overflow-y-auto scrollbar-thin"
                    >
                        {Object.entries(groupedFields).map(([category, fields]) => (
                            <div key={category}>
                                <h3 className="text-xs font-semibold text-muted-foreground px-1 mb-1">
                                    {category}
                                </h3>
                                <div className="space-y-0.5">
                                    {fields.map((field) => (
                                        <div
                                            key={field.type}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, field.type)}
                                            className="cursor-move"
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-start h-6 text-xs gap-2 bg-transparent hover:bg-accent"
                                                onClick={() => onAddField(field.type)}
                                            >
                                                {field.icon}
                                                <span className="truncate">{field.label}</span>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </TabsContent>

                    <TabsContent
                        value="templates"
                        className="flex-1 p-1.5 space-y-1 mt-0 overflow-y-auto scrollbar-thin"
                    >
                        <div className="space-y-1">
                            <h3 className="text-xs font-semibold text-muted-foreground px-1">
                                Default Fields
                            </h3>
                            {defaultSingleFields.map((template) => (
                                <div
                                    key={`${template.name ?? template.label}-${template.type}`}
                                    draggable
                                    onDragStart={(e) => handleDefaultFieldDragStart(e, template)}
                                    className="cursor-move"
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start h-6 text-xs gap-2 bg-transparent hover:bg-accent"
                                        onClick={() => onAddDefaultField(template)}
                                    >
                                        <AlignCenter className="w-3.5 h-3.5" />
                                        <span className="truncate">{template.label}</span>
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2 space-y-1">
                            <h3 className="text-xs font-semibold text-muted-foreground px-1">
                                Templates
                            </h3>
                            {customFieldSets.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-3">
                                    No templates
                                </p>
                            ) : (
                                customFieldSets.map((set) => (
                                    <Card
                                        key={set.id}
                                        draggable
                                        onDragStart={(e) => handleTemplateDragStart(e, set.id)}
                                        className="group cursor-move p-2 border border-border hover:border-primary/50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="text-xs font-medium truncate">
                                                {set.name}
                                            </h4>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-5 px-2 text-[11px] opacity-70 group-hover:opacity-100"
                                                onClick={() => onAddCustomSet(set.id)}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
