/**
 * LocationSectionEdit - Location fields for PropertyEditView
 * Uses EditableSectionField pattern with Photon autocomplete
 */

import { usePhotonAddressSearch } from "@/features/broker/property/hooks/usePhotonAddressSearch";
import { cn } from "@/modules/utils/cn";
import type { UpdatePropertyInput } from "@/schemas/property";
import { SearchableDropdown } from "@luciodale/react-searchable-dropdown";
import { ChevronDown } from "lucide-react";
import { useMemo } from "react";
import { EditableSectionField } from "./EditableField";

type LocationValues = {
  street: string;
  zip: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
  showFullAddress: boolean;
};

interface LocationSectionEditProps {
  property: {
    street: string | null;
    zip: string | null;
    city: string | null;
    country: string | null;
    latitude: string | null;
    longitude: string | null;
    showFullAddress: boolean;
  };
  saveFields: (data: Partial<UpdatePropertyInput>) => Promise<void>;
}

export function LocationSectionEdit({
  property,
  saveFields,
}: LocationSectionEditProps) {
  const initialValues: LocationValues = {
    street: property.street ?? "",
    zip: property.zip ?? "",
    city: property.city ?? "",
    country: property.country ?? "",
    latitude: property.latitude ?? "",
    longitude: property.longitude ?? "",
    showFullAddress: property.showFullAddress,
  };

  return (
    <EditableSectionField
      title="Location"
      values={initialValues}
      onSave={(values) => saveFields(values)}
      renderFields={({ values, onChange, disabled }) => (
        <LocationFields
          values={values}
          onChange={onChange}
          disabled={disabled}
        />
      )}
    />
  );
}

function LocationFields({
  values,
  onChange,
  disabled,
}: {
  values: LocationValues;
  onChange: (values: LocationValues) => void;
  disabled: boolean;
}) {
  const { query, setQuery, suggestions } = usePhotonAddressSearch();

  const options = useMemo(
    () => suggestions.map((s) => s.label),
    [suggestions]
  );

  function handleSelect(option: string) {
    const match = suggestions.find((s) => s.label === option);
    if (!match) return;
    onChange({
      ...values,
      street: match.street,
      zip: match.zip,
      city: match.city,
      country: match.country,
      latitude: match.latitude,
      longitude: match.longitude,
    });
  }

  function updateField<K extends keyof LocationValues>(
    field: K,
    value: LocationValues[K]
  ) {
    onChange({ ...values, [field]: value });
  }

  return (
    <div className="space-y-4">
      {/* Address autocomplete */}
      <div>
        <span className="block text-sm font-medium text-foreground mb-1">
          Address Search
        </span>
        <SearchableDropdown
          options={options}
          value={undefined}
          setValue={handleSelect}
          searchQuery={query}
          onSearchQueryChange={(q) => setQuery(q ?? "")}
          filterType="NO_MATCH"
          createNewOptionIfNoMatch={false}
          placeholder="Search to auto-fill fields..."
          disabled={disabled}
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

      {/* Street */}
      <div>
        <label
          htmlFor="edit-street"
          className="block text-sm font-medium text-foreground mb-1"
        >
          Street Address
        </label>
        <input
          id="edit-street"
          type="text"
          value={values.street}
          onChange={(e) => updateField("street", e.target.value)}
          disabled={disabled}
          placeholder="Via Cristoforo Colombo 12"
          className="input"
        />
      </div>

      {/* ZIP + City */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="edit-zip"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Postal Code
          </label>
          <input
            id="edit-zip"
            type="text"
            value={values.zip}
            onChange={(e) => updateField("zip", e.target.value)}
            disabled={disabled}
            placeholder="84011"
            className="input"
          />
        </div>
        <div>
          <label
            htmlFor="edit-city"
            className="block text-sm font-medium text-foreground mb-1"
          >
            City
          </label>
          <input
            id="edit-city"
            type="text"
            value={values.city}
            onChange={(e) => updateField("city", e.target.value)}
            disabled={disabled}
            placeholder="Amalfi"
            className="input"
          />
        </div>
      </div>

      {/* Country + Latitude */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="edit-country"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Country
          </label>
          <input
            id="edit-country"
            type="text"
            value={values.country}
            onChange={(e) => updateField("country", e.target.value)}
            disabled={disabled}
            placeholder="Italy"
            className="input"
          />
        </div>
        <div>
          <label
            htmlFor="edit-latitude"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Latitude
          </label>
          <input
            id="edit-latitude"
            type="text"
            value={values.latitude}
            onChange={(e) => updateField("latitude", e.target.value)}
            disabled={disabled}
            placeholder="40.6331"
            className="input"
          />
        </div>
      </div>

      {/* Longitude */}
      <div>
        <label
          htmlFor="edit-longitude"
          className="block text-sm font-medium text-foreground mb-1"
        >
          Longitude
        </label>
        <input
          id="edit-longitude"
          type="text"
          value={values.longitude}
          onChange={(e) => updateField("longitude", e.target.value)}
          disabled={disabled}
          placeholder="14.6028"
          className="input"
        />
      </div>

      {/* Show full address toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={values.showFullAddress}
          onChange={(e) => updateField("showFullAddress", e.target.checked)}
          disabled={disabled}
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
    </div>
  );
}
