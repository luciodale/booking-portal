/**
 * ExperienceEditView - Section-level edit interface for experiences
 */

import { experienceCategories } from "@/features/broker/experience/constants/categoryLabels";
import { useExperience } from "@/features/broker/experience/queries/useExperience";
import { useUpdateExperience } from "@/features/broker/experience/queries/useUpdateExperience";
import { EditableSectionField } from "@/features/broker/property/ui/EditableField";
import { CategoryPicker } from "@/modules/ui/react/form-inputs/IconSelectInput";
import type { ExperienceAdditionalCost } from "@/features/public/booking/domain/pricingTypes";
import {
  AdditionalCostsEditor,
  validateAdditionalCosts,
} from "@/modules/ui/react/AdditionalCostsEditor";
import type { UpdateExperienceInput } from "@/schemas/experience";
import { useQueryClient } from "@tanstack/react-query";
import { experienceQueryKeys } from "@/features/broker/experience/constants/queryKeys";
import { ExperienceImagesManager } from "./ExperienceImagesManager";
import { PropertyLinker } from "./PropertyLinker";

interface ExperienceEditViewProps {
  experienceId: string;
}

const experiencePerOptions = [
  { value: "booking", label: "Per Booking" },
  { value: "participant", label: "Per Participant" },
] as const;

export function ExperienceEditView({ experienceId }: ExperienceEditViewProps) {
  const queryClient = useQueryClient();
  const { data: experience, isLoading, error } = useExperience(experienceId);
  const updateExperience = useUpdateExperience();

  function refreshExperience() {
    queryClient.invalidateQueries({
      queryKey: experienceQueryKeys.detail(experienceId),
    });
  }

  async function saveField<K extends keyof UpdateExperienceInput>(
    field: K,
    value: UpdateExperienceInput[K]
  ) {
    await updateExperience.mutateAsync({
      id: experienceId,
      data: { [field]: value },
    });
  }

  async function saveFields(data: Partial<UpdateExperienceInput>) {
    await updateExperience.mutateAsync({
      id: experienceId,
      data,
    });
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="p-8">
        <div className="text-center text-error">
          {error?.message || "Experience not found"}
        </div>
      </div>
    );
  }

  const categoryDefaultOptions = experienceCategories.map((c) => ({
    value: c.id,
    label: c.label,
    icon: c.icon,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section className="bg-card border border-border p-6 rounded-xl">
        <EditableSectionField
          title="Basic Information"
          values={{
            title: experience.title,
            description: experience.description ?? "",
            shortDescription: experience.shortDescription ?? "",
          }}
          onSave={(data) => saveFields(data)}
          renderFields={({ values, onChange, disabled }) => (
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="edit-exp-title"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Title
                </label>
                <input
                  id="edit-exp-title"
                  type="text"
                  value={values.title}
                  onChange={(e) =>
                    onChange({ ...values, title: e.target.value })
                  }
                  disabled={disabled}
                  placeholder="Experience title"
                  maxLength={200}
                  className="input"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-exp-description"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Full Description
                </label>
                <textarea
                  id="edit-exp-description"
                  value={values.description}
                  onChange={(e) =>
                    onChange({ ...values, description: e.target.value })
                  }
                  disabled={disabled}
                  placeholder="Detailed description..."
                  rows={6}
                  className="input resize-none"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-exp-shortDescription"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Short Description
                </label>
                <textarea
                  id="edit-exp-shortDescription"
                  value={values.shortDescription}
                  onChange={(e) =>
                    onChange({ ...values, shortDescription: e.target.value })
                  }
                  disabled={disabled}
                  placeholder="Brief summary..."
                  rows={3}
                  className="input resize-none"
                />
              </div>
            </div>
          )}
        />
      </section>

      <section className="bg-card border border-border p-6 rounded-xl">
        <EditableSectionField
          title="Details"
          values={{
            category: experience.category ?? "",
            categoryIcon: experience.categoryIcon ?? "",
            duration: experience.duration ?? "",
            maxParticipants: String(experience.maxParticipants ?? ""),
          }}
          onSave={(data) =>
            saveFields({
              category: data.category,
              categoryIcon: data.categoryIcon,
              duration: data.duration,
              maxParticipants: data.maxParticipants
                ? Number(data.maxParticipants)
                : undefined,
            })
          }
          renderFields={({ values, onChange, disabled }) => (
            <div className="space-y-6">
              <div>
                <span className="block text-sm font-medium text-foreground mb-1">
                  Category
                </span>
                <CategoryPicker
                  category={values.category}
                  categoryIcon={values.categoryIcon}
                  onChange={(cat, icon) =>
                    onChange({
                      ...values,
                      category: cat,
                      categoryIcon: icon,
                    })
                  }
                  disabled={disabled}
                  defaultOptions={categoryDefaultOptions}
                />
              </div>

              <div>
                <label
                  htmlFor="edit-exp-duration"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Duration
                </label>
                <input
                  id="edit-exp-duration"
                  type="text"
                  value={values.duration}
                  onChange={(e) =>
                    onChange({ ...values, duration: e.target.value })
                  }
                  disabled={disabled}
                  placeholder="8 hours"
                  className="input"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-exp-maxParticipants"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Max Participants
                </label>
                <input
                  id="edit-exp-maxParticipants"
                  type="text"
                  value={values.maxParticipants}
                  onChange={(e) =>
                    onChange({ ...values, maxParticipants: e.target.value })
                  }
                  disabled={disabled}
                  placeholder="10"
                  className="input"
                />
              </div>
            </div>
          )}
        />
      </section>

      <section className="bg-card border border-border p-6 rounded-xl">
        <EditableSectionField
          title="Location"
          values={{
            city: experience.city ?? "",
            country: experience.country ?? "",
          }}
          onSave={(data) => saveFields(data)}
          renderFields={({ values, onChange, disabled }) => (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="edit-exp-city"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  City
                </label>
                <input
                  id="edit-exp-city"
                  type="text"
                  value={values.city}
                  onChange={(e) =>
                    onChange({ ...values, city: e.target.value })
                  }
                  disabled={disabled}
                  placeholder="Sardinia"
                  className="input"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-exp-country"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Country
                </label>
                <input
                  id="edit-exp-country"
                  type="text"
                  value={values.country}
                  onChange={(e) =>
                    onChange({ ...values, country: e.target.value })
                  }
                  disabled={disabled}
                  placeholder="Italy"
                  className="input"
                />
              </div>
            </div>
          )}
        />
      </section>

      <section className="bg-card border border-border p-6 rounded-xl">
        <EditableSectionField
          title="Pricing"
          values={{
            basePrice: String(experience.basePrice),
            currency: experience.currency,
            showPrice: experience.showPrice ? "yes" : "no",
          }}
          onSave={(data) =>
            saveFields({
              basePrice: Number(data.basePrice),
              currency: data.currency,
              showPrice: data.showPrice === "yes",
            })
          }
          renderFields={({ values, onChange, disabled }) => (
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="edit-exp-basePrice"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Base Price (cents)
                </label>
                <input
                  id="edit-exp-basePrice"
                  type="text"
                  value={values.basePrice}
                  onChange={(e) =>
                    onChange({ ...values, basePrice: e.target.value })
                  }
                  disabled={disabled}
                  placeholder="25000"
                  className="input"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-exp-currency"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Currency
                </label>
                <select
                  id="edit-exp-currency"
                  value={values.currency}
                  onChange={(e) =>
                    onChange({ ...values, currency: e.target.value })
                  }
                  disabled={disabled}
                  className="input"
                >
                  <option value="eur">EUR</option>
                  <option value="usd">USD</option>
                  <option value="gbp">GBP</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-exp-showPrice"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Show Price Publicly
                </label>
                <select
                  id="edit-exp-showPrice"
                  value={values.showPrice}
                  onChange={(e) =>
                    onChange({ ...values, showPrice: e.target.value })
                  }
                  disabled={disabled}
                  className="input"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          )}
        />
      </section>

      <section className="bg-card border border-border p-6 rounded-xl">
        <EditableSectionField
          title="Additional Costs"
          description="Optional fees charged on top of the base price (amounts in cents)."
          values={{ additionalCosts: (experience.additionalCosts ?? []) as ExperienceAdditionalCost[] }}
          onSave={(data) =>
            saveField("additionalCosts", data.additionalCosts)
          }
          validate={(data) => validateAdditionalCosts(data.additionalCosts)}
          renderFields={({ values, onChange, disabled, showErrors }) => (
            <AdditionalCostsEditor
              costs={values.additionalCosts}
              perOptions={[...experiencePerOptions]}
              onChange={(costs) =>
                onChange({ additionalCosts: costs as ExperienceAdditionalCost[] })
              }
              disabled={disabled}
              showErrors={showErrors}
            />
          )}
        />
      </section>

      <section className="bg-card border border-border p-6 rounded-xl">
        <EditableSectionField
          title="Booking Options"
          values={{
            instantBook: experience.instantBook ? "yes" : "no",
          }}
          onSave={(data) =>
            saveFields({ instantBook: data.instantBook === "yes" })
          }
          renderFields={({ values, onChange, disabled }) => (
            <div>
              <label
                htmlFor="edit-exp-instantBook"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Instant Book
              </label>
              <select
                id="edit-exp-instantBook"
                value={values.instantBook}
                onChange={(e) =>
                  onChange({ ...values, instantBook: e.target.value })
                }
                disabled={disabled}
                className="input"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          )}
        />
      </section>

      {/* Images */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <ExperienceImagesManager
          experienceId={experienceId}
          images={experience.images ?? []}
          onRefresh={refreshExperience}
        />
      </section>

      {/* Linked Properties */}
      <section className="bg-card border border-border p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Linked Properties
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Link this experience to properties so it appears on their pages.
        </p>
        <PropertyLinker
          experienceId={experienceId}
          linkedProperties={experience.linkedProperties ?? []}
        />
      </section>

      <section className="bg-card border border-border p-6 rounded-xl">
        <EditableSectionField
          title="Status"
          values={{
            status: experience.status,
          }}
          onSave={(data) =>
            saveFields({
              status: data.status as "draft" | "published" | "archived",
            })
          }
          renderFields={({ values, onChange, disabled }) => (
            <div>
              <label
                htmlFor="edit-exp-status"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Status
              </label>
              <select
                id="edit-exp-status"
                value={values.status}
                onChange={(e) =>
                  onChange({ ...values, status: e.target.value })
                }
                disabled={disabled}
                className="input"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}
        />
      </section>
    </div>
  );
}
