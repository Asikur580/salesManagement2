import { useState } from "react";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@inertiajs/react";
import { useToast } from "@/hooks/use-toast";

export default function Categories({ categories }: { categories: any[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { toast } = useToast();
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        description: "",
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post("/accounting/expense-categories", {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Expense Categories</h1>
                        <p className="text-sm text-muted-foreground">Manage your accounting expense categories here.</p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Add Expense Category</DialogTitle></DialogHeader>
                            <form onSubmit={submitCreate} className="space-y-4">
                                <div>
                                    <Label>Name</Label>
                                    <Input value={data.name} onChange={e => setData("name", e.target.value)} />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Textarea value={data.description} onChange={e => setData("description", e.target.value)} />
                                </div>
                                <Button type="submit" className="w-full" disabled={processing}>Save Category</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Expenses Count</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories && categories.length > 0 ? (
                                    categories.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell>{category.description || "-"}</TableCell>
                                            <TableCell>{category.expenses_count}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No categories found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
