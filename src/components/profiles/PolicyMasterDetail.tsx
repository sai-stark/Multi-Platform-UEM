import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import React from 'react';

// ====================================================================
// Shared master-detail layout for iOS policy view & edit dialogs
// ====================================================================

export interface PolicyCategory {
    key: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    /** Whether this category has been modified / configured (shows a dot) */
    hasModifications?: boolean;
    /** Color for the dot indicator – defaults to 'amber' */
    dotColor?: string;
}

export interface PolicyMasterDetailProps {
    // Header
    headerIcon: React.ReactNode;
    headerColorClass: string;          // e.g. 'destructive', 'primary'
    title: string;
    subtitle: string;
    headerActions?: React.ReactNode;

    // Categories
    categories: PolicyCategory[];
    selectedCategoryKey: string;
    onSelectCategory: (key: string) => void;
    searchPlaceholder?: string;
    searchQuery: string;
    onSearchChange: (query: string) => void;

    // Right panel
    /** Header area on the right above content – optional extra actions (e.g. Remove button) */
    categoryHeaderActions?: React.ReactNode;
    /** The main content for the selected category */
    renderContent: (category: PolicyCategory) => React.ReactNode;

    // Footer
    footerActions: React.ReactNode;
}

export function PolicyMasterDetail({
    headerIcon,
    headerColorClass,
    title,
    subtitle,
    headerActions,
    categories,
    selectedCategoryKey,
    onSelectCategory,
    searchPlaceholder = 'Search...',
    searchQuery,
    onSearchChange,
    categoryHeaderActions,
    renderContent,
    footerActions,
}: PolicyMasterDetailProps) {
    const selectedCategory = categories.find(c => c.key === selectedCategoryKey) || categories[0];

    return (
        <div className="flex flex-col h-[78vh] mt-6 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b shrink-0 pr-8">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        'p-2.5 rounded-xl shadow-lg',
                        `bg-gradient-to-br from-${headerColorClass}/20 to-${headerColorClass}/10 shadow-${headerColorClass}/5`
                    )}>
                        {headerIcon}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
                    </div>
                </div>
                {headerActions && (
                    <div className="flex items-center gap-2">{headerActions}</div>
                )}
            </div>

            {/* Master-Detail */}
            <div className="flex flex-1 min-h-0 mt-4 gap-0 border rounded-lg overflow-hidden">
                {/* Left Panel — Category List */}
                <div className="w-[280px] shrink-0 border-r bg-gradient-to-b from-muted/30 to-muted/10 flex flex-col">
                    <div className="p-3 border-b bg-muted/20">
                        <div className="relative group/search">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground transition-colors group-focus-within/search:text-blue-500" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={e => onSearchChange(e.target.value)}
                                className="pl-8 h-8 text-xs bg-background/80 border-border/50 focus:border-blue-500/50 focus:bg-background transition-all duration-200"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {categories.map(cat => {
                            const isSelected = selectedCategoryKey === cat.key;
                            return (
                                <div
                                    key={cat.key}
                                    className={cn(
                                        'group flex items-center gap-3 px-3 py-3 cursor-pointer border-b border-border/30 transition-all duration-200',
                                        isSelected
                                            ? 'bg-blue-500/10 dark:bg-blue-500/15 border-l-[3px] border-l-blue-500 shadow-[inset_0_0_20px_-12px_rgba(59,130,246,0.3)]'
                                            : 'hover:bg-muted/60 border-l-[3px] border-l-transparent hover:border-l-border'
                                    )}
                                    onClick={() => onSelectCategory(cat.key)}
                                >
                                    <div className={cn(
                                        'shrink-0',
                                        // If icon is a string/emoji, render as text; otherwise wrap in styled div
                                        typeof cat.icon === 'string'
                                            ? 'text-xl opacity-90'
                                            : cn('p-1.5 rounded-lg', cat.hasModifications ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' : 'bg-muted/50 text-muted-foreground')
                                    )}>
                                        {cat.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn(
                                            'font-medium text-sm truncate transition-colors',
                                            isSelected && 'text-blue-600 dark:text-blue-400'
                                        )}>
                                            {cat.title}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                            {cat.subtitle}
                                        </p>
                                    </div>
                                    {cat.hasModifications && (
                                        <div
                                            className={cn(
                                                'w-2 h-2 rounded-full shrink-0',
                                                cat.dotColor === 'blue' ? 'bg-blue-500' : 'bg-amber-500'
                                            )}
                                            title="Has modifications"
                                        />
                                    )}
                                </div>
                            );
                        })}
                        {categories.length === 0 && searchQuery.trim() && (
                            <div className="text-center py-10 text-muted-foreground">
                                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                                    <Search className="w-5 h-5 opacity-50" />
                                </div>
                                <p className="text-xs font-medium">No matches for "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel */}
                <div className="flex-1 flex flex-col min-h-0 bg-background/50">
                    {selectedCategory ? (
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="flex items-center justify-between pb-2 border-b">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">{selectedCategory.icon}</div>
                                    <div>
                                        <h4 className="text-lg font-bold">{selectedCategory.title}</h4>
                                        <p className="text-sm text-muted-foreground">{selectedCategory.subtitle}</p>
                                    </div>
                                </div>
                                {categoryHeaderActions}
                            </div>

                            {renderContent(selectedCategory)}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            <p className="text-sm font-semibold">Select a category</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t shrink-0">
                {footerActions}
            </div>
        </div>
    );
}
