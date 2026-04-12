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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "@inertiajs/react";
import { useToast } from "@/hooks/use-toast";

export default function ExpensesIndex({ expenses, categories }: { expenses: any, categories: any[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { toast } = useToast();
    
    const { data, setData, post, processing, errors, reset } = useForm({
        expense_category_id: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        reference_no: "",
        note: "",
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post("/accounting/expenses", {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
                toast({ title: "Success", description: "Expense recorded successfully" });
            },
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
                        <p className="text-sm text-muted-foreground">Log and manage your direct expenses.</p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> Record Expense</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Record New Expense</DialogTitle></DialogHeader>
                            <form onSubmit={submitCreate} className="space-y-4">
                                <div>
                                    <Label>Category</Label>
                                    <Select value={data.expense_category_id} onValueChange={v => setData('expense_category_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.expense_category_id && <p className="text-sm text-destructive">{errors.expense_category_id}</p>}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Amount (Tk)</Label>
                                        <Input type="number" step="0.01" value={data.amount} onChange={e => setData("amount", e.target.value)} />
                                        {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
                                    </div>
                                    <div>
                                        <Label>Date</Label>
                                        <Input type="date" value={data.date} onChange={e => setData("date", e.target.value)} />
                                        {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
                                    </div>
                                </div>
                                
                                <div>
                                    <Label>Reference No. (Optional)</Label>
                                    <Input value={data.reference_no} onChange={e => setData("reference_no", e.target.value)} />
                                </div>

                                <div>
                                    <Label>Note (Optional)</Label>
                                    <Textarea value={data.note} onChange={e => setData("note", e.target.value)} />
                                </div>

                                <Button type="submit" className="w-full" disabled={processing}>Save Expense</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Created By</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses?.data && expenses.data.length > 0 ? (
                                    expenses.data.map((expense: any) => (
                                        <TableRow key={expense.id}>
                                            <TableCell>{expense.date}</TableCell>
                                            <TableCell>{expense.category?.name}</TableCell>
                                            <TableCell>{expense.reference_no || "-"}</TableCell>
                                            <TableCell className="font-bold">Tk. {Number(expense.amount).toLocaleString()}</TableCell>
                                            <TableCell>{expense.creator?.name || "System"}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No expenses recorded yet.
                                        </TableCell>
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
