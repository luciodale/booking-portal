import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const bookingGuestSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  adults: z.number().int().min(1, "At least 1 adult"),
  children: z.number().int().min(0),
  guestNote: z.string().optional(),
});

type BookingGuestInput = z.input<typeof bookingGuestSchema>;

type BookingFormProps = {
  maxGuests: number;
  isAvailable: boolean;
  isSubmitting: boolean;
  onSubmit: (data: BookingGuestInput) => void;
};

export function BookingForm({
  maxGuests,
  isAvailable,
  isSubmitting,
  onSubmit,
}: BookingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingGuestInput>({
    resolver: zodResolver(bookingGuestSchema),
    defaultValues: { adults: 1, children: 0 },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            First Name
          </label>
          <input
            data-testid="booking-firstname"
            {...register("firstName")}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.firstName && (
            <p className="text-xs text-red-400 mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Last Name
          </label>
          <input
            data-testid="booking-lastname"
            {...register("lastName")}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.lastName && (
            <p className="text-xs text-red-400 mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          Email
        </label>
        <input
          data-testid="booking-email"
          type="email"
          {...register("email")}
          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {errors.email && (
          <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          Phone (optional)
        </label>
        <input
          data-testid="booking-phone"
          type="tel"
          {...register("phone")}
          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Adults
          </label>
          <input
            data-testid="booking-adults"
            type="number"
            min={1}
            max={maxGuests}
            {...register("adults", { valueAsNumber: true })}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.adults && (
            <p className="text-xs text-red-400 mt-1">{errors.adults.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Children
          </label>
          <input
            data-testid="booking-children"
            type="number"
            min={0}
            max={maxGuests}
            {...register("children", { valueAsNumber: true })}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          Special requests (optional)
        </label>
        <textarea
          rows={3}
          {...register("guestNote")}
          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      <button
        data-testid="booking-submit"
        type="submit"
        disabled={!isAvailable || isSubmitting}
        className={`
          w-full py-3 rounded-xl text-sm font-semibold transition-all
          ${
            isAvailable && !isSubmitting
              ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }
        `}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
            Processing...
          </span>
        ) : isAvailable ? (
          "Proceed to Payment"
        ) : (
          "Select available dates first"
        )}
      </button>
    </form>
  );
}
