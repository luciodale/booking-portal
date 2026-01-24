/**
 * FormError Component
 * Displays validation errors for form fields
 */

interface FormErrorProps {
  message?: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <p className="mt-1 text-sm text-error" role="alert">
      {message}
    </p>
  );
}
