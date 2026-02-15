import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const guestSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  guestNote: z.string().optional(),
});

export type ExperienceGuestInput = z.input<typeof guestSchema>;

type ExperienceGuestFormProps = {
  isSubmitting: boolean;
  hasDate: boolean;
  onSubmit: (data: ExperienceGuestInput) => void;
};

export function ExperienceGuestForm({
  isSubmitting,
  hasDate,
  onSubmit,
}: ExperienceGuestFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExperienceGuestInput>({
    resolver: zodResolver(guestSchema),
  });

  const inputCls =
    "w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="exp-firstname"
            className="block text-xs text-muted-foreground mb-1"
          >
            First Name
          </label>
          <input
            id="exp-firstname"
            {...register("firstName")}
            className={inputCls}
          />
          {errors.firstName && (
            <p className="text-xs text-red-400 mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="exp-lastname"
            className="block text-xs text-muted-foreground mb-1"
          >
            Last Name
          </label>
          <input
            id="exp-lastname"
            {...register("lastName")}
            className={inputCls}
          />
          {errors.lastName && (
            <p className="text-xs text-red-400 mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>
      <div>
        <label
          htmlFor="exp-email"
          className="block text-xs text-muted-foreground mb-1"
        >
          Email
        </label>
        <input
          id="exp-email"
          type="email"
          {...register("email")}
          className={inputCls}
        />
        {errors.email && (
          <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="exp-phone"
          className="block text-xs text-muted-foreground mb-1"
        >
          Phone (optional)
        </label>
        <input
          id="exp-phone"
          type="tel"
          {...register("phone")}
          className={inputCls}
        />
      </div>
      <div>
        <label
          htmlFor="exp-note"
          className="block text-xs text-muted-foreground mb-1"
        >
          Special requests (optional)
        </label>
        <textarea
          id="exp-note"
          rows={3}
          {...register("guestNote")}
          className={`${inputCls} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={!hasDate || isSubmitting}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
          hasDate && !isSubmitting
            ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
            Processing...
          </span>
        ) : hasDate ? (
          "Proceed to Payment"
        ) : (
          "Select a date first"
        )}
      </button>
    </form>
  );
}
