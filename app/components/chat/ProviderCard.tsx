"use client";

import { useState } from "react";
import type { Provider } from "@/lib/types";

interface ProviderCardProps {
  provider: Provider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const [expanded, setExpanded] = useState(false);

  const hasContact = provider.phone || provider.email;
  const hasSocial = Object.values(provider.socialMedia).some(Boolean);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-tight">
          {provider.name}
        </h3>
        {provider.status && (
          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
            {provider.status}
          </span>
        )}
      </div>

      {/* Location */}
      {(provider.region || provider.province || provider.location) && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {[provider.location, provider.province, provider.region]
            .filter(Boolean)
            .join(", ")}
        </p>
      )}

      {/* Contact */}
      {hasContact && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {provider.phone && (
            <a
              href={`tel:${provider.phone.replace(/[() -]/g, "")}`}
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              {provider.phone}
            </a>
          )}
          {provider.email && (
            <a
              href={`mailto:${provider.email}`}
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              {provider.email}
            </a>
          )}
        </div>
      )}

      {/* Specializations */}
      {provider.specializations.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {provider.specializations.slice(0, expanded ? undefined : 4).map((s, i) => (
            <span
              key={i}
              className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            >
              {s}
            </span>
          ))}
          {!expanded && provider.specializations.length > 4 && (
            <span className="text-xs text-zinc-400">
              +{provider.specializations.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Services */}
      {provider.servicesOffered.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {provider.servicesOffered.slice(0, expanded ? undefined : 3).map((s, i) => (
            <span
              key={i}
              className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
            >
              {s}
            </span>
          ))}
          {!expanded && provider.servicesOffered.length > 3 && (
            <span className="text-xs text-zinc-400">
              +{provider.servicesOffered.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Logistics row */}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        {provider.modeOfDelivery.length > 0 && (
          <span>{provider.modeOfDelivery.join(", ")}</span>
        )}
        {provider.modeOfPayment.length > 0 && (
          <span>{provider.modeOfPayment.join(", ")}</span>
        )}
        {provider.openingHours && <span>{provider.openingHours}</span>}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 space-y-2 border-t border-zinc-100 pt-3 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          {provider.description && <p>{provider.description}</p>}
          {provider.priceRange && (
            <p>
              <span className="font-medium">Price Range:</span>{" "}
              {provider.priceRange}
            </p>
          )}
          {provider.categories.length > 0 && (
            <p>
              <span className="font-medium">Categories:</span>{" "}
              {provider.categories.join(", ")}
            </p>
          )}
          {provider.inclusivityTags.length > 0 && (
            <p>
              <span className="font-medium">Inclusivity:</span>{" "}
              {provider.inclusivityTags.join(", ")}
            </p>
          )}
          {provider.websiteUrl && (
            <a
              href={provider.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-600 hover:underline dark:text-blue-400"
            >
              Website
            </a>
          )}
          {hasSocial && (
            <div className="flex gap-3">
              {provider.socialMedia.facebook && (
                <a href={provider.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">Facebook</a>
              )}
              {provider.socialMedia.instagram && (
                <a href={provider.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">Instagram</a>
              )}
              {provider.socialMedia.linkedin && (
                <a href={provider.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">LinkedIn</a>
              )}
              {provider.socialMedia.twitter && (
                <a href={provider.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">Twitter</a>
              )}
              {provider.socialMedia.youtube && (
                <a href={provider.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">YouTube</a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Show more / less toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
}
