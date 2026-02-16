/**
 * PropertyLinker - Link/unlink properties to an experience
 * Shows linked properties as chips + searchable dropdown to add more.
 */

import { useProperties } from "@/features/broker/property/queries/useProperties";
import {
  useLinkProperty,
  useUnlinkProperty,
} from "@/features/broker/experience/queries/useLinkProperty";
import type { LinkedProperty } from "@/schemas/experience";
import { Plus, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

interface PropertyLinkerProps {
  experienceId: string;
  linkedProperties: LinkedProperty[];
}

export function PropertyLinker({
  experienceId,
  linkedProperties,
}: PropertyLinkerProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: propertyList } = useProperties();
  const linkMutation = useLinkProperty(experienceId);
  const unlinkMutation = useUnlinkProperty(experienceId);

  const linkedIds = useMemo(
    () => new Set(linkedProperties.map((lp) => lp.assetId)),
    [linkedProperties]
  );

  const availableProperties = useMemo(() => {
    if (!propertyList?.properties) return [];
    return propertyList.properties
      .filter((p) => !linkedIds.has(p.id))
      .filter(
        (p) =>
          !search ||
          p.title.toLowerCase().includes(search.toLowerCase())
      );
  }, [propertyList, linkedIds, search]);

  function handleLink(propertyId: string) {
    linkMutation.mutate(propertyId);
    setShowDropdown(false);
    setSearch("");
  }

  function handleUnlink(propertyId: string) {
    unlinkMutation.mutate(propertyId);
  }

  function openDropdown() {
    setShowDropdown(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <div className="space-y-3">
      {/* Linked property chips */}
      {linkedProperties.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {linkedProperties.map((lp) => (
            <span
              key={lp.assetId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-sm text-foreground border border-border"
            >
              {lp.title}
              <button
                type="button"
                onClick={() => handleUnlink(lp.assetId)}
                disabled={unlinkMutation.isPending}
                className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-error/20 hover:text-error transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add button / dropdown */}
      {showDropdown ? (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="Search properties..."
            className="input w-full"
          />
          {availableProperties.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-border bg-card shadow-lg">
              {availableProperties.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleLink(p.id)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors"
                  >
                    {p.title}
                    {p.city && (
                      <span className="text-muted-foreground ml-1">
                        — {p.city}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {availableProperties.length === 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg p-3 text-sm text-muted-foreground">
              No properties available
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={openDropdown}
          disabled={linkMutation.isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="w-4 h-4" />
          Link to property
        </button>
      )}
    </div>
  );
}
