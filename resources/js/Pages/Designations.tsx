import { useState, useEffect } from "react";
import { router, useForm } from "@inertiajs/react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, ArrowUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DesignationCard } from "@/components/designations/DesignationCard";
import { useAuth } from "@/hooks/useAuth";




export interface Designation {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}


interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

interface DesignationPropData {
  data: any[];
  links: any[];
  meta: PaginationMeta;
}

interface DesignationsProps {
  initialDesignations: DesignationPropData;
  filters: {
    search?: string;
    per_page?: string | number;
  };
}

export default function Designations({ initialDesignations, filters }: DesignationsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [designations, setDesignations] = useState<Designation[]>([]);

  useEffect(() => {
    if (initialDesignations?.data) {
        setDesignations(
            initialDesignations.data.map((d: any) => ({
                id: d.id.toString(),
                name: d.name,
                description: d.description || "",
                status: d.status || "active",
                createdAt: d.createdAt
            }))
        );
    }
  }, [initialDesignations]);

  const [isLoading, setIsLoading] = useState(false);
  const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
    name: "",
    description: "",
    status: "active",
  });

  const [searchQuery, setSearchQuery] = useState(filters.search || "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== (filters.search || "")) {
        router.get(
          '/designations',
          { search: searchQuery, per_page: filters.per_page },
          { preserveState: true, replace: true }
        );
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Scroll to top detection
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (value: string) => {
    router.get('/designations', { search: searchQuery, per_page: value }, { preserveState: true });
  };

  const handlePageChange = (url: string | null) => {
    if (url) {
        router.get(url, {}, { preserveState: true });
    }
  };

  const currentMeta = initialDesignations.meta;
  const paginationLinks = initialDesignations.links;

  const handleOpenDialog = (designation?: Designation) => {
    if (designation) {
      setSelectedDesignation(designation);
      setData({
        name: designation.name,
        description: designation.description,
        status: designation.status,
      });
    } else {
      setSelectedDesignation(null);
      reset();
    }
    setIsDialogOpen(true);
  };

  const handleOpenDeleteDialog = (designation: Designation) => {
    setSelectedDesignation(designation);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = () => {
    if (selectedDesignation) {
      put(`/designations/${selectedDesignation.id}`, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast({
            title: "Success",
            description: "Designation updated successfully",
          });
          reset();
        },
        onError: () => {
             toast({
                title: "Error",
                description: "Failed to update designation",
                variant: "destructive",
            });
        }
      });
    } else {
      post('/designations', {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast({
            title: "Success",
            description: "Designation created successfully",
          });
          reset();
        },
        onError: () => {
             toast({
                title: "Error",
                description: "Failed to create designation",
                variant: "destructive",
            });
        }
      });
    }
  };

  const handleDelete = () => {
    if (selectedDesignation) {
        router.delete(`/designations/${selectedDesignation.id}`, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                toast({
                    title: "Success",
                    description: "Designation deleted successfully",
                });
            },
            onError: () => {
                toast({
                    title: "Error",
                    description: "Failed to delete designation",
                    variant: "destructive",
                });
            }
        });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Designations</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Manage job titles and positions
            </p>
          </div>
          {user?.permissions?.includes('designation.create') && (
            <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Add Designation</span>
              <span className="xs:hidden">Add</span>
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search designations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mobile Card View */}
            <div className="md:hidden">
              {designations.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No designations found</p>
              ) : (
                designations.map((designation) => (
                  <DesignationCard
                    key={designation.id}
                    designation={designation}
                    onEdit={(d) => handleOpenDialog(d)}
                    onDelete={(d) => handleOpenDeleteDialog(d)}
                  />
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {designations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                            {isLoading ? "Loading designations..." : "No designations found"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        designations.map((designation) => (
                          <TableRow key={designation.id}>
                            <TableCell className="font-medium">{designation.name}</TableCell>

                            <TableCell className="max-w-xs truncate">
                              {designation.description}
                            </TableCell>
                            <TableCell>
                              <Badge variant={designation.status === 'active' ? 'default' : 'secondary'}>
                                {designation.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {user?.permissions?.includes('designation.update') && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenDialog(designation)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                                {user?.permissions?.includes('designation.delete') && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenDeleteDialog(designation)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Pagination */}
            <div className="sticky bottom-0 bg-background border-t mt-4 pt-4 pb-2 z-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                  <span className="text-xs sm:text-sm text-muted-foreground">Rows per page:</span>
                  <Select value={currentMeta.per_page.toString()} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-[70px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {currentMeta.total === 0
                      ? "No results"
                      : `${currentMeta.from}-${currentMeta.to} of ${currentMeta.total}`}
                  </span>
                  <div className="flex items-center gap-1">
                    {paginationLinks.map((link, idx) => {
                        const isPrev = idx === 0;
                        const isNext = idx === paginationLinks.length - 1;
                        const isActive = link.active;
                        const label = link.label
                            .replace('&laquo; Previous', '')
                            .replace('Next &raquo;', '');

                        if (isPrev) {
                            return (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handlePageChange(link.url)}
                                    disabled={!link.url}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            );
                        }

                        if (isNext) {
                            return (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handlePageChange(link.url)}
                                    disabled={!link.url}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            );
                        }

                        if (link.label === '...') {
                            return <span key={idx} className="px-2">...</span>;
                        }

                        return (
                            <Button
                                key={idx}
                                variant={isActive ? "default" : "outline"}
                                size="icon"
                                className="h-8 w-8 text-xs"
                                onClick={() => handlePageChange(link.url)}
                            >
                                {label}
                            </Button>
                        );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDesignation ? "Edit Designation" : "Add Designation"}
            </DialogTitle>
            <DialogDescription>
              {selectedDesignation
                ? "Update the designation details below"
                : "Create a new designation for your organization"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">

            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Software Engineer"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of responsibilities..."
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={processing} className="w-full sm:w-auto">
              {processing ? "Saving..." : (selectedDesignation ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the designation "{selectedDesignation?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Scroll to Top Button - Mobile Only */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-20 right-4 md:hidden z-50 h-12 w-12 rounded-full shadow-lg"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </DashboardLayout>
  );
}
