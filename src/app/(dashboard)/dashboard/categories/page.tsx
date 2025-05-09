"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { apiClient } from "@/utils/api-client";
import { useFormValidation } from "@/hooks/use-form-validation";

// Form validation schema
const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters long")
    .max(30, "Category name cannot exceed 30 characters")
    .trim(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Form validation
  const { form, isSubmitting, handleSubmit } =
    useFormValidation<CategoryFormValues>({
      schema: categorySchema,
      defaultValues: {
        name: "",
      },
    });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Reset form when category to edit changes
  useEffect(() => {
    if (categoryToEdit) {
      form.reset({ name: categoryToEdit.name });
    } else {
      form.reset({ name: "" });
    }
  }, [categoryToEdit, form]);

  // Form submission handler
  const onSubmit = async (data: CategoryFormValues) => {
    try {
      if (categoryToEdit) {
        // Update existing category
        await apiClient.updateCategory(categoryToEdit.id, data);
        toast.success("Category updated successfully");
      } else {
        // Create new category
        await apiClient.createCategory(data);
        toast.success("Category created successfully");
      }

      // Close dialog and refresh categories
      setIsDialogOpen(false);
      setCategoryToEdit(null);
      fetchCategories();
    } catch (error: unknown) {
      console.error("Category save error:", error);

      const err = error as { status?: number; data?: { message?: string } };

      if (err.status === 409) {
        toast.error("A category with this name already exists");
      } else {
        toast.error(
          categoryToEdit
            ? "Failed to update category"
            : "Failed to create category"
        );
      }
    }
  };

  // Delete category handler
  const deleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setDeleteError(null);
      await apiClient.deleteCategory(categoryToDelete);
      toast.success("Category deleted successfully");
      fetchCategories();
      setCategoryToDelete(null);
    } catch (error: unknown) {
      console.error("Error deleting category:", error);

      const err = error as { status?: number; data?: { message?: string } };

      if (err.status === 400 && err.data?.message) {
        setDeleteError(err.data.message);
      } else {
        toast.error("Failed to delete category");
        setCategoryToDelete(null);
      }
    }
  };

  // Dialog open/close handlers
  const handleCreateCategory = () => {
    setCategoryToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setCategoryToEdit(category);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCategoryToEdit(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={handleCreateCategory}>
          <Plus className="mr-2 h-4 w-4" /> Create Category
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>
            Create categories to organize your tasks more effectively
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <p className="mb-2 text-xl font-semibold text-gray-700">
                No categories found
              </p>
              <p className="mb-4 text-gray-500">
                Create categories to help organize your tasks
              </p>
              <Button onClick={handleCreateCategory}>
                <Plus className="mr-2 h-4 w-4" /> Create Your First Category
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center">
                    <Tag className="mr-2 h-5 w-5 text-primary" />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditCategory(category)}
                      title="Edit category"
                    >
                      <Pencil className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCategoryToDelete(category.id)}
                      title="Delete category"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {categoryToEdit ? "Edit Category" : "Create Category"}
            </DialogTitle>
            <DialogDescription>
              {categoryToEdit
                ? "Update your category name"
                : "Enter a name for your new category"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? categoryToEdit
                      ? "Updating..."
                      : "Creating..."
                    : categoryToEdit
                    ? "Update"
                    : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category?
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
              {deleteError}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteCategory}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
