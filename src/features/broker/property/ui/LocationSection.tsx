/**
 * LocationSection - Location fields for CreatePropertyForm
 * Includes Smoobu reference display, Photon address autocomplete, and structured fields
 */

import { usePhotonAddressSearch } from "@/features/broker/property/hooks/usePhotonAddressSearch";
import { COUNTRY_NAMES } from "@/modules/countries";
import { cn } from "@/modules/utils/cn";
import { FormSection } from "@/modules/ui/react/form-inputs/FormSection";
import { TextInput } from "@/modules/ui/react/form-inputs/TextInput";
import type { CreatePropertyInput } from "@/schemas/property";
import { SearchableDropdown } from "@luciodale/react-searchable-dropdown";
import { ChevronDown, MapPin } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";
import type { CreatePropertyFormData } from "./CreatePropertyForm";

const countryOptions = [...COUNTRY_NAMES];

interface LocationSectionProps {
  control: Control<CreatePropertyFormData>;
  setValue: UseFormSetValue<CreatePropertyFormData>;
  smoobuData?: Partial<CreatePropertyInput> | null;
  renderLink: (field: keyof CreatePropertyInput) => ReactNode;
}

const LOCATION_FIELDS = [
  "street",
  "zip",
  "city",
  "country",
  "latitude",
  "longitude",
] as const;

function hasSmoobuLocationData(
  data: Partial<CreatePropertyInput> | null | undefined
): boolean {
  if (!data) return false;
  return LOCATION_FIELDS.some(
    (f) => data[f] !== undefined && data[f] !== null && data[f] !== ""
  );
}

export function LocationSection({
  control,
  setValue,
  smoobuData,
  renderLink,
}: LocationSectionProps) {
  const { query, setQuery, suggestions } = usePhotonAddressSearch();
  const countryValue = useWatch({ control, name: "country" }) ?? "";
  const [countryQuery, setCountryQuery] = useState(countryValue);

  useEffect(() => {
    setCountryQuery(countryValue);
  }, [countryValue]);

  const options = useMemo(
    () => suggestions.map((s) => s.label),
    [suggestions]
  );

  function handleSelect(option: string) {
    const match = suggestions.find((s) => s.label === option);
    if (!match) return;
    setValue("street", match.street, { shouldDirty: true });
    setValue("zip", match.zip, { shouldDirty: true });
    setValue("city", match.city, { shouldDirty: true });
    setValue("country", match.country, { shouldDirty: true });
    setValue("latitude", match.latitude, { shouldDirty: true });
    setValue("longitude", match.longitude, { shouldDirty: true });
  }

  return (
    <FormSection title="Location">
      {/* Smoobu reference */}
      {smoobuData && hasSmoobuLocationData(smoobuData) && (
        <div className="bg-secondary/50 rounded-lg p-4 mb-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <MapPin className="w-4 h-4" />
            Smoobu Location Data (reference)
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm">
            {smoobuData.street && (
              <div>
                <span className="text-muted-foreground">Street:</span>{" "}
                {smoobuData.street}
              </div>
            )}
            {smoobuData.zip && (
              <div>
                <span className="text-muted-foreground">ZIP:</span>{" "}
                {smoobuData.zip}
              </div>
            )}
            {smoobuData.city && (
              <div>
                <span className="text-muted-foreground">City:</span>{" "}
                {smoobuData.city}
              </div>
            )}
            {smoobuData.country && (
              <div>
                <span className="text-muted-foreground">Country:</span>{" "}
                {smoobuData.country}
              </div>
            )}
            {smoobuData.latitude && (
              <div>
                <span className="text-muted-foreground">Lat:</span>{" "}
                {smoobuData.latitude}
              </div>
            )}
            {smoobuData.longitude && (
              <div>
                <span className="text-muted-foreground">Lng:</span>{" "}
                {smoobuData.longitude}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Address autocomplete */}
      <div>
        <span className="block text-sm font-medium text-foreground mb-1">
          Address Search
        </span>
        <p className="text-sm text-muted-foreground mb-2">
          Search to auto-fill street, ZIP, city, country, and coordinates
        </p>
        <SearchableDropdown
          options={options}
          value={undefined}
          setValue={handleSelect}
          searchQuery={query}
          onSearchQueryChange={(q) => setQuery(q ?? "")}
          filterType="NO_MATCH"
          createNewOptionIfNoMatch={false}
          placeholder="Start typing an address..."
          classNameSearchableDropdownContainer="relative"
          DropdownIcon={({ toggled }: { toggled: boolean }) => (
            <ChevronDown
              className={cn("w-4 h-4 shrink-0 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform", toggled && "rotate-180")}
            />
          )}
          classNameSearchQueryInput="input pr-9"
          classNameDropdownOptions="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
          classNameDropdownOption="px-3 py-2 text-sm text-foreground cursor-pointer"
          classNameDropdownOptionFocused="bg-secondary"
          classNameDropdownOptionNoMatch="px-3 py-2 text-sm text-muted-foreground"
        />
      </div>

      {/* Structured fields */}
      <TextInput
        name="street"
        control={control}
        label="Street Address"
        placeholder="Via Cristoforo Colombo 12"
        labelSuffix={renderLink("street")}
      />

      <div className="grid grid-cols-2 gap-4">
        <TextInput
          name="zip"
          control={control}
          label="ZIP Code"
          placeholder="84011"
          labelSuffix={renderLink("zip")}
        />
        <TextInput
          name="city"
          control={control}
          label="City"
          placeholder="Amalfi"
          labelSuffix={renderLink("city")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <div>
              <span className="block text-sm font-medium text-foreground mb-1">
                Country
                {renderLink("country")}
              </span>
              <SearchableDropdown
                options={countryOptions}
                value={field.value || undefined}
                setValue={(v) => {
                  field.onChange(v ?? "");
                  setCountryQuery(v ?? "");
                }}
                searchQuery={countryQuery}
                onSearchQueryChange={(q) => setCountryQuery(q ?? "")}
                placeholder="Select a country..."
                classNameSearchableDropdownContainer="relative"
                DropdownIcon={({ toggled }: { toggled: boolean }) => (
                  <ChevronDown
                    className={cn("w-4 h-4 shrink-0 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform", toggled && "rotate-180")}
                  />
                )}
                classNameSearchQueryInput="input pr-9"
                classNameDropdownOptions="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto"
                classNameDropdownOption="px-3 py-2 text-sm text-foreground cursor-pointer"
                classNameDropdownOptionFocused="bg-secondary"
                classNameDropdownOptionNoMatch="px-3 py-2 text-sm text-muted-foreground"
              />
            </div>
          )}
        />
        <TextInput
          name="latitude"
          control={control}
          label="Latitude"
          placeholder="40.6331"
          labelSuffix={renderLink("latitude")}
        />
      </div>

      <TextInput
        name="longitude"
        control={control}
        label="Longitude"
        placeholder="14.6028"
        labelSuffix={renderLink("longitude")}
      />

      {/* Show full address toggle */}
      <Controller
        name="showFullAddress"
        control={control}
        render={({ field }) => (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={field.value ?? true}
              onChange={(e) => field.onChange(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <div>
              <span className="text-sm font-medium text-foreground">
                Show full address publicly
              </span>
              <p className="text-xs text-muted-foreground">
                When off, only the city is shown until booking is confirmed
              </p>
            </div>
          </label>
        )}
      />
    </FormSection>
  );
}
