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
import { Calculator, CheckCircle, Printer } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function PayrollIndex({ salaries, selectedMonth }: any) {
    const { toast } = useToast();
    const [month, setMonth] = useState(selectedMonth);
    const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
    const [selectedSlip, setSelectedSlip] = useState<any>(null);

    const { post, processing } = useForm({
        month_year: month,
    });

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMonth = e.target.value;
        setMonth(newMonth);
        router.get(route('hrm.payroll.index'), { month_year: newMonth }, { preserveState: true });
    };

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('hrm.payroll.generate'), {
            onSuccess: () => {
                toast({ title: "Payroll Generated", description: `Payroll for ${month} has been calculated.` });
                setIsGenerateDialogOpen(false);
            }
        });
    };

    const markAsPaid = (id: number) => {
        router.patch(route('hrm.payroll.status', id), { status: 'paid' }, {
            preserveScroll: true,
            onSuccess: () => toast({ title: "Status Updated", description: "Salary marked as paid." })
        });
    };

    const viewSlip = (salary: any) => {
        setSelectedSlip(salary);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <DashboardLayout>
            <Head title="Payroll Management" />
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Payroll & Salaries</h1>
                        <p className="text-muted-foreground mt-2">Generate and manage monthly employee salaries.</p>
                    </div>
                    <Button onClick={() => setIsGenerateDialogOpen(true)}>
                        <Calculator className="mr-2 h-4 w-4" /> Generate Payroll
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-col md:flex-row justify-between md:items-center space-y-2 md:space-y-0">
                        <CardTitle>Salary Statements</CardTitle>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Select Month:</span>
                            <Input 
                                type="month" 
                                value={month} 
                                onChange={handleMonthChange}
                                className="w-auto"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead className="text-right">Base Salary</TableHead>
                                        <TableHead className="text-right text-red-500">Deduction (Absence)</TableHead>
                                        <TableHead className="text-right text-green-500">Bonus</TableHead>
                                        <TableHead className="text-right font-bold">Net Salary</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {salaries.length > 0 ? (
                                        salaries.map((salary: any) => (
                                            <TableRow key={salary.id}>
                                                <TableCell>
                                                    <p className="font-medium">{salary.user_name}</p>
                                                    <p className="text-xs text-muted-foreground">{salary.user_email}</p>
                                                </TableCell>
                                                <TableCell className="text-right">৳{Number(salary.base_salary).toFixed(2)}</TableCell>
                                                <TableCell className="text-right text-red-500">-৳{Number(salary.deduction).toFixed(2)}</TableCell>
                                                <TableCell className="text-right text-green-500">+৳{Number(salary.bonus).toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-bold">৳{Number(salary.net_salary).toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={salary.status === 'paid' ? 'default' : 'secondary'} className={salary.status === 'paid' ? 'bg-green-500' : 'bg-yellow-100 text-yellow-800'}>
                                                        {salary.status === 'paid' ? 'Paid' : 'Pending'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {salary.status === 'pending' && (
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="text-green-600 border-green-200 hover:bg-green-50"
                                                                onClick={() => markAsPaid(salary.id)}
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" /> Pay
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="sm" onClick={() => viewSlip(salary)}>
                                                            <Printer className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                                No payroll data found for {month}. Generate payroll to view records.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Generate Dialog */}
            <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Generate Payroll</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleGenerate}>
                        <div className="py-6 space-y-4">
                            <p className="text-sm text-muted-foreground">
                                This will extract base salaries and calculate absentee deductions based on the attendance logs for the selected month to generate net salaries.
                            </p>
                            <Input 
                                type="month" 
                                value={month} 
                                readOnly 
                                disabled
                                className="bg-muted font-bold text-center"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Generating...' : 'Confirm Generation'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Print Slip Dialog */}
            <Dialog open={!!selectedSlip} onOpenChange={() => setSelectedSlip(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader className="print:hidden">
                        <DialogTitle>Salary Slip</DialogTitle>
                    </DialogHeader>
                    
                    {/* Slip Design */}
                    {selectedSlip && (
                        <div className="p-6 border rounded-lg m-2 bg-white text-black" id="print-area">
                            <div className="text-center mb-6 border-b pb-4">
                                <h2 className="text-2xl font-bold">SALARY SLIP</h2>
                                <p className="text-sm text-gray-500">For the month of: <strong>{month}</strong></p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                <div>
                                    <p className="text-gray-500">Employee Name:</p>
                                    <p className="font-semibold text-lg">{selectedSlip.user_name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Status:</p>
                                    <p className={`font-semibold ${selectedSlip.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {selectedSlip.status.toUpperCase()}
                                    </p>
                                </div>
                            </div>
                            
                            <table className="w-full text-sm mb-6 border-collapse">
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-2">Base Salary</td>
                                        <td className="py-2 text-right">৳{Number(selectedSlip.base_salary).toFixed(2)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2">Bonus/Additions</td>
                                        <td className="py-2 text-right text-green-600">+ ৳{Number(selectedSlip.bonus).toFixed(2)}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2">Absence Deductions</td>
                                        <td className="py-2 text-right text-red-600">- ৳{Number(selectedSlip.deduction).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50 font-bold border-b-2 border-black">
                                        <td className="py-3 px-2">Net Salary</td>
                                        <td className="py-3 px-2 text-right text-lg">৳{Number(selectedSlip.net_salary).toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                            
                            <div className="text-center text-xs text-gray-400 mt-8">
                                <p>This is a computer generated document. No signature is required.</p>
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter className="print:hidden">
                        <Button variant="outline" onClick={() => setSelectedSlip(null)}>Close</Button>
                        <Button onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" /> Print Document
                        </Button>
                    </DialogFooter>
                    
                    {/* CSS to hide non-print elements */}
                    <style dangerouslySetInnerHTML={{__html: `
                        @media print {
                            body * {
                                visibility: hidden;
                            }
                            #print-area, #print-area * {
                                visibility: visible;
                            }
                            #print-area {
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                            }
                        }
                    `}} />
                </DialogContent>
            </Dialog>

        </DashboardLayout>
    );
}
