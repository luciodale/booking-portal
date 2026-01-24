/**
 * FormSection - Styled section container for form groups
 */

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <section className="bg-card border border-border p-6 rounded-xl">
      <h2 className="text-xl font-semibold text-foreground mb-4">{title}</h2>
      {children}
    </section>
  );
}

