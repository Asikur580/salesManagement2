import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import {
    Check,
    X,
    Star,
    Plane,
    Calendar as CalendarIcon,
    AlertCircle,
    Plus,
    FileDown,
    RefreshCcw,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const STATUS_ICONS: Record<string, React.ReactNode> = {
    present: <Check className="h-4 w-4 text-green-500" />,
    absent: <X className="h-4 w-4 text-red-500" />,
    late: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    holiday: <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />,
    "half-day": <Star className="h-4 w-4 text-red-500 fill-red-500" />,
    "on-leave": <Plane className="h-4 w-4 text-orange-500" />,
    "day-off": <CalendarIcon className="h-4 w-4 text-gray-400" />,
};

const MONTHS = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

export default function AttendanceGrid({
    employees,
    selectedMonth,
    selectedYear,
    daysInMonth,
    roles,
    filters,
    monthName,
}: any) {
    const { toast } = useToast();
    const [isMarkDialogOpen, setIsMarkDialogOpen] = useState(false);
    const [markDate, setMarkDate] = useState(new Date().toISOString().split("T")[0]);

    const { data: markData, setData: setMarkData, post: postMark, processing: markProcessing, reset: resetMark } = useForm({
        date: markDate,
        attendances: [] as any[],
    });

    useEffect(() => {
        if (isMarkDialogOpen) {
            const initial = employees.map((emp: any) => {
                const dayNum = parseInt(markDate.split("-")[2]);
                const existing = emp.attendance_grid[dayNum];
                return {
                    user_id: emp.id,
                    status: existing?.status || "present",
                    check_in: existing?.check_in || "09:00",
                    check_out: existing?.check_out || "18:00",
                };
            });
            setMarkData("attendances", initial);
        }
    }, [isMarkDialogOpen, markDate]);

    const handleFilterChange = (key: string, value: any) => {
        router.get(
            route("hrm.attendance.index"),
            { ...filters, [key]: value },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleMarkAttendance = (e: React.FormEvent) => {
        e.preventDefault();
        postMark(route("hrm.attendance.store"), {
            onSuccess: () => {
                toast({ title: "Success", description: "Attendance marked successfully." });
                setIsMarkDialogOpen(false);
                resetMark();
            },
        });
    };

    const getDayName = (day: number) => {
        const d = new Date(selectedYear, selectedMonth - 1, day);
        return d.toLocaleDateString("en-US", { weekday: "short" }).substring(0, 3);
    };

    return (
        <DashboardLayout>
            <Head title="Attendance Grid" />
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Attendance Dashboard</h1>
                        <p className="text-sm text-muted-foreground">Monitor and manage monthly employee attendance records.</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" size="sm" onClick={() => handleFilterChange('month', selectedMonth === 1 ? 12 : selectedMonth - 1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold px-2">{monthName} {selectedYear}</span>
                        <Button variant="outline" size="sm" onClick={() => handleFilterChange('month', selectedMonth === 12 ? 1 : selectedMonth + 1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-lg border shadow-sm">
                    <div className="w-40">
                        <Select value={selectedMonth.toString()} onValueChange={(v) => handleFilterChange("month", v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {MONTHS.map((m) => (
                                    <SelectItem key={m.value} value={m.value.toString()}>
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-32">
                        <Select value={selectedYear.toString()} onValueChange={(v) => handleFilterChange("year", v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {YEARS.map((y) => (
                                    <SelectItem key={y} value={y.toString()}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-48">
                        <Select value={filters.role_id || "all"} onValueChange={(v) => handleFilterChange("role_id", v === "all" ? "" : v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Designation" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Designations</SelectItem>
                                {roles.map((r: any) => (
                                    <SelectItem key={r.id} value={r.id.toString()}>
                                        {r.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2">
                        <Button onClick={() => setIsApplyDialogOpen(true)} variant="default" onClick={() => setIsMarkDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" /> Mark Attendance
                        </Button>
                        <Button variant="outline" size="icon" title="Refresh">
                            <RefreshCcw className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" title="Export PDF">
                            <FileDown className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground p-2 border-b">
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> Holiday</span>
                    <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3 text-gray-400" /> Day Off</span>
                    <span className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" /> Present</span>
                    <span className="flex items-center gap-1"><AlertCircle className="h-3 w-3 text-yellow-500" /> Late</span>
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 text-red-500 fill-red-500" /> Half Day</span>
                    <span className="flex items-center gap-1"><X className="h-3 w-3 text-red-500" /> Absent</span>
                    <span className="flex items-center gap-1"><Plane className="h-3 w-3 text-orange-500" /> On Leave</span>
                </div>

                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table className="border-collapse">
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-12 text-center sticky left-0 z-20 bg-muted/50 border-r">SN</TableHead>
                                        <TableHead className="min-w-[200px] sticky left-12 z-20 bg-muted/50 border-r">Employee</TableHead>
                                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                                            <TableHead key={day} className="w-10 p-0 text-center border-r min-w-[40px]">
                                                <div className="text-[10px] font-bold leading-tight">{day}</div>
                                                <div className="text-[8px] uppercase text-muted-foreground">{getDayName(day)}</div>
                                            </TableHead>
                                        ))}
                                        <TableHead className="w-16 text-center font-bold">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {employees.map((emp: any, idx: number) => (
                                        <TableRow key={emp.id} className="hover:bg-muted/30">
                                            <TableCell className="text-center font-mono text-xs sticky left-0 z-10 bg-background border-r">{idx + 1}</TableCell>
                                            <TableCell className="sticky left-12 z-10 bg-background border-r">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm truncate max-w-[150px]">{emp.name}</span>
                                                    <span className="text-[10px] text-muted-foreground truncate">{emp.designation}</span>
                                                </div>
                                            </TableCell>
                                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                                const record = emp.attendance_grid[day];
                                                return (
                                                    <TableCell key={day} className="p-0 text-center border-r h-12">
                                                        <div className="flex items-center justify-center w-full h-full">
                                                            {record ? (
                                                                <div title={`${record.status}${record.check_in ? ' (' + record.check_in + ')' : ''}`}>
                                                                    {STATUS_ICONS[record.status] || "-"}
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground/20 text-[10px]">-</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell className="text-center font-bold text-sm bg-muted/10">
                                                {emp.total_present}/{daysInMonth}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isMarkDialogOpen} onOpenChange={setIsMarkDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Mark Attendance</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center gap-4 py-4 border-b">
                        <Label className="font-bold">Date:</Label>
                        <Input 
                            type="date" 
                            className="w-48" 
                            value={markDate} 
                            onChange={(e) => {
                                setMarkDate(e.target.value);
                                setMarkData("date", e.target.value);
                            }} 
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto py-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead className="w-32">Status</TableHead>
                                    <TableHead className="w-24">In</TableHead>
                                    <TableHead className="w-24">Out</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {markData.attendances.map((att: any, i: number) => {
                                    const emp = employees.find((e: any) => e.id === att.user_id);
                                    return (
                                        <TableRow key={att.user_id}>
                                            <TableCell className="py-2">
                                                <div className="text-sm font-medium">{emp?.name}</div>
                                                <div className="text-[10px] text-muted-foreground">{emp?.designation}</div>
                                            </TableCell>
                                            <TableCell className="py-2">
                                                <Select 
                                                    value={att.status} 
                                                    onValueChange={(v) => {
                                                        const newArr = [...markData.attendances];
                                                        newArr[i].status = v;
                                                        setMarkData("attendances", newArr);
                                                    }}
                                                >
                                                    <SelectTrigger className="h-8 py-0">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="present">Present</SelectItem>
                                                        <SelectItem value="absent">Absent</SelectItem>
                                                        <SelectItem value="late">Late</SelectItem>
                                                        <SelectItem value="holiday">Holiday</SelectItem>
                                                        <SelectItem value="half-day">Half Day</SelectItem>
                                                        <SelectItem value="on-leave">On Leave</SelectItem>
                                                        <SelectItem value="day-off">Day Off</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="py-2">
                                                <Input 
                                                    type="time" 
                                                    className="h-8 px-1" 
                                                    value={att.check_in} 
                                                    onChange={(e) => {
                                                        const newArr = [...markData.attendances];
                                                        newArr[i].check_in = e.target.value;
                                                        setMarkData("attendances", newArr);
                                                    }}
                                                    disabled={['absent', 'holiday', 'day-off', 'on-leave'].includes(att.status)}
                                                />
                                            </TableCell>
                                            <TableCell className="py-2">
                                                <Input 
                                                    type="time" 
                                                    className="h-8 px-1" 
                                                    value={att.check_out} 
                                                    onChange={(e) => {
                                                        const newArr = [...markData.attendances];
                                                        newArr[i].check_out = e.target.value;
                                                        setMarkData("attendances", newArr);
                                                    }}
                                                    disabled={['absent', 'holiday', 'day-off', 'on-leave'].includes(att.status)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    <DialogFooter className="pt-4 border-t">
                        <Button variant="outline" onClick={() => setIsMarkDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleMarkAttendance} disabled={markProcessing}>
                            {markProcessing ? "Saving..." : "Save Attendance"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
