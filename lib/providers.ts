import type { Provider, LLMIntentResult } from "./types";
import { MAX_RESULTS } from "./constants";

function matchScore(searchTerms: string[], values: string[]): number {
  let score = 0;
  const lowerValues = values.map((v) => v.toLowerCase());

  for (const term of searchTerms) {
    const lowerTerm = term.toLowerCase();
    for (const val of lowerValues) {
      if (val.includes(lowerTerm) || lowerTerm.includes(val)) {
        score += 1;
      }
    }
  }

  return score;
}

// Original search function as fallback
/*
export function searchProvidersFallback(
  providers: Provider[],
  intent: LLMIntentResult
): Provider[] {
  let filtered = providers;

  // Hard filter by region if specified
  if (intent.region) {
    const regionLower = intent.region.toLowerCase();
    const regionFiltered = filtered.filter(
      (p) =>
        p.region.toLowerCase().includes(regionLower) ||
        p.province.toLowerCase().includes(regionLower) ||
        p.location.toLowerCase().includes(regionLower)
    );
    // Only apply filter if it produces results; otherwise search all
    if (regionFiltered.length > 0) {
      filtered = regionFiltered;
    }
  }

  // Hard filter by mode of delivery if specified
  if (intent.modeOfDelivery) {
    const modeLower = intent.modeOfDelivery.toLowerCase();
    const modeFiltered = filtered.filter((p) =>
      p.modeOfDelivery.some((m) => m.toLowerCase().includes(modeLower))
    );
    if (modeFiltered.length > 0) {
      filtered = modeFiltered;
    }
  }

  // Score remaining providers
  const scored = filtered.map((provider) => {
    let score = 0;

    // Specialization match (highest weight: 5 per match)
    score +=
      matchScore(intent.specializations, provider.specializations) * 5;

    // Service match (weight: 3 per match)
    score += matchScore(intent.services, provider.servicesOffered) * 3;

    // Category match (weight: 2 per match)
    score +=
      matchScore(
        [...intent.specializations, ...intent.services],
        provider.categories
      ) * 2;

    // Inclusivity match (weight: 2 per match)
    if (intent.inclusivityPreferences && intent.inclusivityPreferences.length > 0) {
      score +=
        matchScore(intent.inclusivityPreferences, provider.inclusivityTags) * 2;
    }

    // Mode of payment match (weight: 1)
    if (intent.modeOfPayment) {
      const payLower = intent.modeOfPayment.toLowerCase();
      if (
        provider.modeOfPayment.some((m) =>
          m.toLowerCase().includes(payLower)
        )
      ) {
        score += 1;
      }
    }

    // Freetext search terms fallback (weight: 1 per match)
    const textFields = [
      provider.name,
      provider.description,
      ...provider.servicesOffered,
      ...provider.specializations,
      ...provider.categories,
    ];
    score += matchScore(intent.searchTerms, textFields);

    return { provider, score };
  });

  // Sort by score descending, filter out zero-score entries
  scored.sort((a, b) => b.score - a.score);

  return scored
    .filter((s) => s.score > 0)
    .slice(0, MAX_RESULTS)
    .map((s) => s.provider);
}
  */

// Main search function - uses Chroma vector search with fallback
export async function searchProviders(
  providers: Provider[],
  intent: LLMIntentResult
): Promise<Provider[]> {
  // Try Chroma vector search first
  try {
    const { searchProvidersVector } = await import("./chroma");
    const matchedIds = await searchProvidersVector(intent);

    console.log(matchedIds)
    
    if (matchedIds.length > 0) {
      // Map IDs back to providers (IDs are provider_0, provider_1, etc.)
      const idToIndex = new Map(
        matchedIds.map((id) => [id, parseInt(id.replace("provider_", ""), 10)])
      );
      
      return providers
        .filter((_, index) => idToIndex.has(`provider_${index}`))
        .slice(0, MAX_RESULTS);
    }
  } catch (error) {
    console.warn("Chroma search failed, using fallback:", error);
  }
  return []
}

/*
// Synchronous version for backwards compatibility
export function searchProvidersSync(
  providers: Provider[],
  intent: LLMIntentResult
): Provider[] {
  return searchProvidersFallback(providers, intent);
}
*/