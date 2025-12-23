
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { mockInventory } from "@/data/mockInventory";
import { InventoryDevice } from "@/types/models";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as z from "zod";

const formSchema = z.object({
    serialNumber: z.string().min(1, "Serial Number is required"),
    manufacturer: z.string().min(1, "Manufacturer is required"),
    modelNumber: z.string().min(1, "Model Number is required"),
    location: z.string().optional(),
    assetTag: z.string().optional(),
    assignedUser: z.string().optional(),
    userEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
});

const InventoryEditor = () => {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();
    const { toast } = useToast();
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            serialNumber: "",
            manufacturer: "",
            modelNumber: "",
            location: "",
            assetTag: "",
            assignedUser: "",
            userEmail: "",
        },
    });

    useEffect(() => {
        if (isEditing) {
            // Mock Fetch
            const device = mockInventory.find(d => d.id === id);
            if (device) {
                form.reset({
                    serialNumber: device.serialNumber,
                    manufacturer: device.manufacturer,
                    modelNumber: device.modelNumber,
                    location: device.location || "",
                    assetTag: device.assetTag || "",
                    assignedUser: device.assignedUser || "",
                    userEmail: device.userEmail || "",
                });
                toast({
                    title: "Demo Mode",
                    description: "Loaded mock data for demonstration.",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Device not found",
                    variant: "destructive",
                });
                navigate("/inventory");
            }
        }
    }, [id, isEditing, form, navigate, toast]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setSubmitting(true);
            // Simulate Network Delay
            await new Promise(resolve => setTimeout(resolve, 800));

            const payload: InventoryDevice = {
                ...(isEditing && { id }),
                serialNumber: values.serialNumber,
                manufacturer: values.manufacturer,
                modelNumber: values.modelNumber,
                location: values.location,
                assetTag: values.assetTag,
                assignedUser: values.assignedUser,
                userEmail: values.userEmail || undefined,
            };

            console.log("Mock Save Payload:", payload);

            toast({
                title: isEditing ? "Updated (Mock)" : "Created (Mock)",
                description: "Inventory data saved successfully (Simulation)",
            });
            navigate("/inventory");
        } catch (error) {
            console.error("Save error", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6 max-w-2xl mx-auto">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/inventory")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            {isEditing ? "Edit Device" : "Add Device"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditing ? "Update device details and assignment." : "Register a new hardware device."}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Device Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="serialNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Serial Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="SN-XXXX" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="assetTag"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Asset Tag</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="AST-XXXX" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="manufacturer"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Manufacturer</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Dell, Apple, etc." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="modelNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Model</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Latitude 5420" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Office Name or City" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-4 border-t pt-4">
                                    <h3 className="text-sm font-medium">Assignment</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="assignedUser"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Assigned User</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Employee Name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="userEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>User Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="email@example.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate("/inventory")}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={submitting}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {submitting ? "Saving..." : "Save Device"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
};

export default InventoryEditor;
