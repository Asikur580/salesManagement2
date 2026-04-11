import { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle, XCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function LeaveRequests({ leaves, filters, canManage }: any) {
    const { toast } = useToast();
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        type: "casual",
        start_date: "",
        end_date: "",
        reason: "",
    });

    const handleApplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('hrm.leaves.store'), {
            onSuccess: () => {
                toast({ title: "Leave Requested", description: "Your leave application has been submitted." });
                setIsApplyDialogOpen(false);
                reset();
            }
        });
    };

    const updateStatus = (id: number, status: string) => {
        router.patch(route('hrm.leaves.status', id), { status }, {
            preserveScroll: true,
            onSuccess: () => toast({ title: "Status Updated", description: `Leave request marked as ${status}.` })
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-500">Approved</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
            default: return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <Head title="Leave Management" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Leave Requests</h1>
                        <p className="text-muted-foreground mt-2">Manage and view your leave history.</p>
                    </div>
                    <Button onClick={() => setIsApplyDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Apply for Leave
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Leave History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                        {canManage && <TableHead className="text-right">Actions</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaves.data.length > 0 ? (
                                        leaves.data.map((leave: any) => (
                                            <TableRow key={leave.id}>
                                                <TableCell className="font-medium">
                                                    {leave.user?.name || 'Unknown'}
                                                </TableCell>
                                                <TableCell className="capitalize">{leave.type}</TableCell>
                                                <TableCell>
                                                    {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate" title={leave.reason}>
                                                    {leave.reason || '-'}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(leave.status)}</TableCell>
                                                {canManage && (
                                                    <TableCell className="text-right">
                                                        {leave.status === 'pending' && (
                                                            <div className="flex justify-end gap-2">
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="icon" 
                                                                    className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                                                    onClick={() => updateStatus(leave.id, 'approved')}
                                                                    title="Approve"
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="icon" 
                                                                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                                                    onClick={() => updateStatus(leave.id, 'rejected')}
                                                                    title="Reject"
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={canManage ? 6 : 5} className="text-center h-24 text-muted-foreground">
                                                No leave requests found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Component */}
                        {leaves?.meta?.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-muted-foreground">
                                    Showing {leaves.meta.from || 0} to {leaves.meta.to || 0} of {leaves.meta.total} entries
                                </div>
                                <div className="flex gap-2">
                                    {leaves.links.map((link: any, i: number) => {
                                        let label = link.label;
                                        if (label.includes("&laquo;")) label = "«";
                                        if (label.includes("&raquo;")) label = "»";

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    if (link.url) router.visit(link.url, { preserveScroll: true });
                                                }}
                                                disabled={!link.url || link.active}
                                                className={`px-3 py-1 text-sm border rounded hover:bg-muted ${link.active ? "bg-primary text-primary-foreground border-primary" : ""} ${!link.url ? "opacity-50 cursor-not-allowed" : ""}`}
                                                dangerouslySetInnerHTML={{ __html: label }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Apply for Leave</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleApplySubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Leave Type *</Label>
                            <Select value={data.type} onValueChange={(v) => setData('type', v)} required>
                                <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="casual">Casual Leave</SelectItem>
                                    <SelectItem value="sick">Sick Leave</SelectItem>
                                    <SelectItem value="annual">Annual Leave</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date *</Label>
                                <Input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} required />
                                {errors.start_date && <p className="text-xs text-red-500">{errors.start_date}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>End Date *</Label>
                                <Input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} required />
                                {errors.end_date && <p className="text-xs text-red-500">{errors.end_date}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Reason (Optional)</Label>
                            <Textarea 
                                placeholder="Why do you need this leave?" 
                                value={data.reason} 
                                onChange={e => setData('reason', e.target.value)} 
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsApplyDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Submitting...' : 'Submit Application'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
