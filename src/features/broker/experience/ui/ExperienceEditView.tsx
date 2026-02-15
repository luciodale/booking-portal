/**
 * ExperienceEditView - Per-field edit interface for experiences
 */

import { experienceCategoryLabels } from "@/features/broker/experience/constants/categoryLabels";
import { experienceQueryKeys } from "@/features/broker/experience/constants/queryKeys";
import { useExperience } from "@/features/broker/experience/queries/useExperience";
import { useUpdateExperience } from "@/features/broker/experience/queries/useUpdateExperience";
import {
  EditableSelectField,
  EditableTextField,
  EditableTextareaField,
} from "@/features/broker/property/ui/EditableField";
import type { UpdateExperienceInput } from "@/schemas/experience";
import { useQueryClient } from "@tanstack/react-query";

interface ExperienceEditViewProps {
  experienceId: string;
}

export function ExperienceEditView({ experienceId }: ExperienceEditViewProps) {
  const queryClient = useQueryClient();
  const { data: experience, isLoading, error } = useExperience(experienceId);
  const updateExperience = useUpdateExperience();

  async function saveField<K extends keyof UpdateExperienceInput>(
    field: K,
    value: UpdateExperienceInput[K]
  ) {
    await updateExperience.mutateAsync({
      id: experienceId,
      data: { [field]: value },
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

  const categoryOptions = Object.entries(experienceCategoryLabels).map(
    ([value, label]) => ({ value, label })
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section className="bg-card border border-border p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Basic Information
        </h2>
        <div className="space-y-6">
          <EditableTextField
            label="Title"
            value={experience.title}
            onSave={(v) => saveField("title", v)}
            placeholder="Experience title"
            maxLength={200}
          />
          <EditableTextareaField
            label="Full Description"
            value={experience.description ?? ""}
            onSave={(v) => saveField("description", v)}
            placeholder="Detailed description..."
            rows={6}
          />
          <EditableTextareaField
            label="Short Description"
            value={experience.shortDescription ?? ""}
            onSave={(v) => saveField("shortDescription", v)}
            placeholder="Brief summary..."
            rows={3}
          />
        </div>
      </section>

      <section className="bg-card border border-border p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-foreground mb-6">Details</h2>
        <div className="space-y-6">
          <EditableSelectField
            label="Category"
            value={experience.category ?? ""}
            onSave={(v) => saveField("category", v)}
            options={categoryOptions}
          />
          <EditableTextField
            label="Duration"
            value={experience.duration ?? ""}
            onSave={(v) => saveField("duration", v)}
            placeholder="8 hours"
          />
          <EditableTextField
            label="Max Participants"
            value={String(experience.maxParticipants ?? "")}
            onSave={(v) =>
              saveField("maxParticipants", v ? Number(v) : undefined)
            }
            placeholder="10"
          />
        </div>
      </section>

      <section className="bg-card border border-border p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-foreground mb-6">Location</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <EditableTextField
              label="City"
              value={experience.city ?? ""}
              onSave={(v) => saveField("city", v)}
              placeholder="Sardinia"
            />
            <EditableTextField
              label="Country"
              value={experience.country ?? ""}
              onSave={(v) => saveField("country", v)}
              placeholder="Italy"
            />
          </div>
        </div>
      </section>

      <section className="bg-card border border-border p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-foreground mb-6">Pricing</h2>
        <div className="space-y-6">
          <EditableTextField
            label="Base Price (cents)"
            value={String(experience.basePrice)}
            onSave={(v) => saveField("basePrice", Number(v))}
            placeholder="25000"
          />
          <EditableSelectField
            label="Currency"
            value={experience.currency}
            onSave={(v) => saveField("currency", v)}
            options={[
              { value: "eur", label: "EUR" },
              { value: "usd", label: "USD" },
              { value: "gbp", label: "GBP" },
            ]}
          />
        </div>
      </section>

      <section className="bg-card border border-border p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-foreground mb-6">Status</h2>
        <EditableSelectField
          label="Status"
          value={experience.status}
          onSave={(v) =>
            saveField("status", v as "draft" | "published" | "archived")
          }
          options={[
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
            { value: "archived", label: "Archived" },
          ]}
        />
      </section>
    </div>
  );
}
