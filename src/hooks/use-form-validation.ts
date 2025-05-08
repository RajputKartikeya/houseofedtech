import { useState } from "react";
import {
  UseFormReturn,
  FieldValues,
  useForm,
  DefaultValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodSchema } from "zod";

interface UseFormValidationProps<T extends FieldValues> {
  schema: ZodSchema;
  defaultValues?: DefaultValues<T>;
  mode?: "onChange" | "onBlur" | "onSubmit" | "onTouched" | "all";
}

interface UseFormValidationReturn<T extends FieldValues> {
  form: UseFormReturn<T>;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  handleSubmit: (
    onValid: (data: T) => Promise<void> | void,
    onInvalid?: (errors: any) => void
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export function useFormValidation<T extends FieldValues>({
  schema,
  defaultValues = {} as DefaultValues<T>,
  mode = "onSubmit",
}: UseFormValidationProps<T>): UseFormValidationReturn<T> {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode,
  });

  const handleSubmit = (
    onValid: (data: T) => Promise<void> | void,
    onInvalid?: (errors: any) => void
  ) => {
    return form.handleSubmit(async (data: T) => {
      try {
        setIsSubmitting(true);
        await onValid(data);
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }, onInvalid);
  };

  return {
    form,
    isSubmitting,
    setIsSubmitting,
    handleSubmit,
  };
}
