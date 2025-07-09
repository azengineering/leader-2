'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, set, parseISO } from 'date-fns';
import type { DateRange } from 'react-day-picker';

import { getNotifications, addNotification, updateNotification, deleteNotification, type SiteNotification } from '@/data/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Bell, PlusCircle, Edit, Trash2, CalendarIcon, Loader2, ChevronLeft, Users, Plus, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { indianStates } from '@/data/locations';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const notificationSchema = z.object({
    message: z.string().min(1, 'Message cannot be empty.'),
    dateRange: z.object({
        from: z.date(), // 'from' is now required
        to: z.date().optional(),
    }).optional(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    isActive: z.boolean(),
    target_filters: z.object({
        states: z.array(z.string()).optional(),
        constituencies: z.array(z.string()).optional(),
        gender: z.array(z.string()).optional(),
        age_min: z.number().min(18).max(100).optional(),
        age_max: z.number().min(18).max(100).optional(),
    }).optional(),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

// Function to convert URLs in text to clickable links
const linkifyText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
        if (urlRegex.test(part)) {
            return (
                <a
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                    {part}
                </a>
            );
        }
        return part;
    });
};

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<SiteNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingNotification, setEditingNotification] = useState<SiteNotification | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const [constituencyInput, setConstituencyInput] = useState('');


    const form = useForm<NotificationFormData>({
        resolver: zodResolver(notificationSchema),
        defaultValues: {
            message: '',
            dateRange: { from: new Date(), to: undefined }, // 'from' is now required
            startTime: '00:00',
            endTime: '23:59',
            isActive: true,
            target_filters: {
                states: [],
                constituencies: [],
                gender: [],
                age_min: undefined,
                age_max: undefined,
            },
        },
    });

    const fetchAllNotifications = async () => {
        setIsLoading(true);
        const data = await getNotifications();
        setNotifications(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAllNotifications();
    }, []);

    const handleOpenDialog = (notification: SiteNotification | null = null) => {
        setEditingNotification(notification);
        if (notification) {
            const start = notification.startTime ? parseISO(notification.startTime) : null;
            const end = notification.endTime ? parseISO(notification.endTime) : null;
            form.reset({
                message: notification.message,
                dateRange: { from: start || new Date(), to: end || undefined }, // Ensure 'from' is always a Date
                startTime: start ? format(start, 'HH:mm') : '00:00',
                endTime: end ? format(end, 'HH:mm') : '23:59',
                isActive: notification.isActive,
                target_filters: notification.target_filters || {
                    states: [],
                    constituencies: [],
                    gender: [],
                    age_min: undefined,
                    age_max: undefined,
                },
            });
            setConstituencyInput(''); // Clear constituency input when opening dialog
        } else {
            form.reset({
                message: '',
                dateRange: { from: new Date(), to: undefined }, // Ensure 'from' is always a Date
                startTime: '00:00',
                endTime: '23:59',
                isActive: true,
                target_filters: {
                    states: [],
                    constituencies: [],
                    gender: [],
                    age_min: undefined,
                    age_max: undefined,
                },
            });
            setConstituencyInput(''); // Clear constituency input when opening dialog
        }
        setIsDialogOpen(true);
    };

    const onSubmit = async (data: NotificationFormData) => {
        setIsSubmitting(true);
        try {
            const { dateRange, startTime, endTime } = data;
            const [startHour, startMinute] = startTime.split(':').map(Number);
            const [endHour, endMinute] = endTime.split(':').map(Number);

            let startDateTime: string | null = null;
            if (dateRange?.from) {
                startDateTime = set(dateRange.from, { hours: startHour, minutes: startMinute }).toISOString();
            }

            let endDateTime: string | null = null;
            const endDate = dateRange?.to || dateRange?.from;
            if (endDate) {
                endDateTime = set(endDate, { hours: endHour, minutes: endMinute }).toISOString();
            }

            const payload = {
                message: data.message,
                isActive: data.isActive,
                startTime: startDateTime,
                endTime: endDateTime,
                target_filters: data.target_filters && (
                    data.target_filters.states?.length || 
                    data.target_filters.constituencies?.length || 
                    data.target_filters.gender?.length ||
                    data.target_filters.age_min ||
                    data.target_filters.age_max
                ) ? data.target_filters : undefined,
            };

            if (editingNotification) {
                await updateNotification(editingNotification.id, payload);
                toast({ title: 'Notification Updated' });
            } else {
                await addNotification(payload);
                toast({ title: 'Notification Added' });
            }

            setIsDialogOpen(false);
            await fetchAllNotifications();
        } catch (error) {
            toast({ variant: 'destructive', title: 'An error occurred', description: 'Could not save the notification.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        await deleteNotification(id);
        toast({ variant: 'destructive', title: 'Notification Deleted' });
        await fetchAllNotifications();
    };

    const TableSkeleton = () => (
         <div className="border rounded-md p-4">
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
        </div>
    );

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'N/A';
        return format(parseISO(dateString), 'MMM dd, yyyy, hh:mm a');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-headline">Manage Notifications</h1>
                <Button variant="outline" onClick={() => router.back()}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>
            <Card>
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Bell /> Site Notifications</CardTitle>
                        <CardDescription>Create, edit, and manage site-wide announcements.</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenDialog()}>
                        <PlusCircle className="mr-2" /> Add New
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? <TableSkeleton /> : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Starts</TableHead>
                                    <TableHead>Ends</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notifications.length > 0 ? notifications.map(n => (
                                    <TableRow key={n.id}>
                                        <TableCell className="max-w-md">
                                            <div className="break-words" title={n.message}>
                                                {linkifyText(n.message)}
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatDate(n.startTime)}</TableCell>
                                        <TableCell>{formatDate(n.endTime)}</TableCell>
                                        <TableCell>
                                            <span className={cn('px-2 py-1 text-xs rounded-full', n.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                                                {n.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(n)}><Edit className="h-4 w-4" /></Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This action will permanently delete this notification.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(n.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">No notifications created yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>{editingNotification ? 'Edit' : 'Add'} Notification</DialogTitle>
                        <DialogDescription>Set the message and schedule for your notification.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <Card className="p-4">
                                <CardHeader className="p-0 pb-4">
                                    <CardTitle className="text-lg">Notification Details</CardTitle>
                                    <CardDescription>Define the core content and visibility of your announcement.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 space-y-4">
                                    <FormField control={form.control} name="message" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Message</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} rows={4} placeholder="Enter your notification message here..." />
                                            </FormControl>
                                            <FormDescription>This message will be displayed to users.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={form.control} name="isActive" render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Activate Notification</FormLabel>
                                                <FormDescription>Turn this on to make the notification visible on the site.</FormDescription>
                                            </div>
                                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}/>
                                </CardContent>
                            </Card>

                            <Card className="p-4">
                                <CardHeader className="p-0 pb-4">
                                    <CardTitle className="text-lg">Schedule</CardTitle>
                                    <CardDescription>Set the start and end dates/times for the notification to be active.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 space-y-4">
                                    <FormField control={form.control} name="dateRange" render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date Range (Optional)</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value?.from && "text-muted-foreground")}>
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {field.value?.from ? (field.value.to ? (<>{format(field.value.from, "LLL dd, y")} - {format(field.value.to, "LLL dd, y")}</>) : (format(field.value.from, "LLL dd, y"))) : (<span>Pick a date range</span>)}
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar initialFocus mode="range" selected={field.value || undefined} onSelect={field.onChange} numberOfMonths={2} />
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription>The period during which the notification will be active.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="startTime" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Time</FormLabel>
                                                <FormControl><Input type="time" {...field} /></FormControl>
                                                <FormDescription>The time the notification becomes active.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        <FormField control={form.control} name="endTime" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End Time</FormLabel>
                                                <FormControl><Input type="time" {...field} /></FormControl>
                                                <FormDescription>The time the notification becomes inactive.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="p-4">
                                <CardHeader className="p-0 pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Target Audience (Optional)
                                    </CardTitle>
                                    <CardDescription>Define specific user groups to target this notification. Leave blank to target all users.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 space-y-6">
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                form.setValue('target_filters.states', []);
                                                form.setValue('target_filters.constituencies', []);
                                                form.setValue('target_filters.gender', []);
                                                form.setValue('target_filters.age_min', undefined);
                                                form.setValue('target_filters.age_max', undefined);
                                                setConstituencyInput('');
                                            }}
                                        >
                                            Clear All Filters
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => form.setValue('target_filters.states', indianStates)}
                                        >
                                            Select All States
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <FormLabel>States ({form.watch('target_filters.states')?.length || 0}/{indianStates.length})</FormLabel>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg bg-muted/20">
                                            {indianStates.map((state) => (
                                                <FormField
                                                    key={state}
                                                    control={form.control}
                                                    name="target_filters.states"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(state)}
                                                                    onCheckedChange={(checked) => {
                                                                        const currentStates = field.value || [];
                                                                        if (checked) {
                                                                            field.onChange([...currentStates, state]);
                                                                        } else {
                                                                            field.onChange(currentStates.filter(s => s !== state));
                                                                        }
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="text-xs font-normal cursor-pointer">
                                                                {state}
                                                            </FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <FormDescription>Select specific states to target.</FormDescription>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Constituencies ({form.watch('target_filters')?.constituencies?.length || 0})</FormLabel>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="MP/MLA/Panchayat constituency name"
                                                value={constituencyInput}
                                                onChange={(e) => setConstituencyInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const value = constituencyInput.trim();
                                                        if (value) {
                                                            const currentConstituencies = form.getValues('target_filters.constituencies') || [];
                                                            if (!currentConstituencies.includes(value)) {
                                                                form.setValue('target_filters.constituencies', [...currentConstituencies, value]);
                                                            }
                                                            setConstituencyInput('');
                                                        }
                                                    }
                                                }}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    const value = constituencyInput.trim();
                                                    if (value) {
                                                        const currentConstituencies = form.getValues('target_filters.constituencies') || [];
                                                        if (!currentConstituencies.includes(value)) {
                                                            form.setValue('target_filters.constituencies', [...currentConstituencies, value]);
                                                        }
                                                        setConstituencyInput('');
                                                    }
                                                }}
                                            >
                                                <Plus className="h-4 w-4" /> Add
                                            </Button>
                                        </div>
                                        {form.watch('target_filters.constituencies')?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2 p-2 border rounded-lg bg-muted/20 max-h-32 overflow-y-auto">
                                                {form.watch('target_filters.constituencies')?.map((constituency, index) => (
                                                    <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs">
                                                        {constituency}
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                const currentConstituencies = form.getValues('target_filters.constituencies') || [];
                                                                const filteredConstituencies = currentConstituencies.filter((_, i) => i !== index);
                                                                form.setValue('target_filters.constituencies', filteredConstituencies);
                                                            }}
                                                            className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                                        >
                                                            <Trash2 className="h-2 w-2" />
                                                        </Button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        <FormDescription>Add specific constituencies to target.</FormDescription>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <FormLabel>Gender ({form.watch('target_filters.gender')?.length || 0})</FormLabel>
                                            <div className="flex gap-2 p-2 border rounded-lg bg-muted/20">
                                                {['Male', 'Female', 'Other'].map((gender) => (
                                                    <FormField
                                                        key={gender}
                                                        control={form.control}
                                                        name="target_filters.gender"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(gender)}
                                                                        onCheckedChange={(checked) => {
                                                                            const currentGenders = field.value || [];
                                                                            if (checked) {
                                                                                field.onChange([...currentGenders, gender]);
                                                                            } else {
                                                                                field.onChange(currentGenders.filter(g => g !== gender));
                                                                            }
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="text-sm font-normal cursor-pointer">
                                                                    {gender}
                                                                </FormLabel>
                                                            </FormItem>
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            <FormDescription>Select genders to target.</FormDescription>
                                        </div>
                                        <div className="space-y-2">
                                            <FormLabel>Age Range</FormLabel>
                                            <div className="flex gap-2 items-center p-2 border rounded-lg bg-muted/20">
                                                <FormField
                                                    control={form.control}
                                                    name="target_filters.age_min"
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min="18"
                                                                    max="100"
                                                                    placeholder="Min"
                                                                    value={field.value || ''}
                                                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <span className="text-sm text-muted-foreground">to</span>
                                                <FormField
                                                    control={form.control}
                                                    name="target_filters.age_max"
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min="18"
                                                                    max="100"
                                                                    placeholder="Max"
                                                                    value={field.value || ''}
                                                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <FormDescription>Define a minimum and maximum age for the target audience.</FormDescription>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        form.reset({
                                            message: '',
                                            dateRange: { from: new Date(), to: undefined }, // Ensure 'from' is always a Date
                                            startTime: '00:00',
                                            endTime: '23:59',
                                            isActive: true,
                                            target_filters: {
                                                states: [],
                                                constituencies: [],
                                                gender: [],
                                                age_min: undefined,
                                                age_max: undefined,
                                            },
                                        });
                                        setConstituencyInput('');
                                    }}
                                >
                                    Clear Form
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" /> Save Notification
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
