import { google } from "googleapis";
import type { Provider } from "./types";
import {
  COLUMN_PATTERNS,
  MULTI_COLUMN_PATTERNS,
  CACHE_TTL_MS,
} from "./constants";

let cachedProviders: Provider[] | null = null;
let cacheTimestamp = 0;

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY environment variables"
    );
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

function buildColumnMap(
  headers: string[]
): {
  single: Record<string, number>;
  multi: Record<string, number[]>;
} {
  const single: Record<string, number> = {};
  const multi: Record<string, number[]> = {};

  const trimmedHeaders = headers.map((h) => h.trim());

  // Map single-value columns by exact match (case-insensitive)
  for (const [field, pattern] of Object.entries(COLUMN_PATTERNS)) {
    const lowerPattern = pattern.toLowerCase();
    const idx = trimmedHeaders.findIndex(
      (h) => h.toLowerCase() === lowerPattern
    );
    if (idx !== -1) {
      single[field] = idx;
    }
  }

  // Map multi-value columns by pattern match (starts with or equals, case-insensitive)
  for (const [field, pattern] of Object.entries(MULTI_COLUMN_PATTERNS)) {
    const lowerPattern = pattern.toLowerCase();
    const indices: number[] = [];
    for (let i = 0; i < trimmedHeaders.length; i++) {
      const h = trimmedHeaders[i].toLowerCase();
      if (h === lowerPattern || h.startsWith(lowerPattern + " ")) {
        indices.push(i);
      }
    }
    // Also check for "Others" columns that follow the group
    // They appear right after the last column of the group
    if (indices.length > 0) {
      const lastIdx = indices[indices.length - 1];
      if (
        lastIdx + 1 < trimmedHeaders.length &&
        trimmedHeaders[lastIdx + 1].toLowerCase() === "others"
      ) {
        indices.push(lastIdx + 1);
      }
    }
    multi[field] = indices;
  }

  return { single, multi };
}

function getStr(row: string[], idx: number | undefined): string {
  if (idx === undefined || idx < 0 || idx >= row.length) return "";
  return (row[idx] || "").trim();
}

function getMulti(row: string[], indices: number[]): string[] {
  return indices
    .map((i) => (i < row.length ? (row[i] || "").trim() : ""))
    .filter((v) => v.length > 0);
}

function normalizeRow(
  row: string[],
  columnMap: ReturnType<typeof buildColumnMap>
): Provider {
  const { single, multi } = columnMap;

  return {
    name: getStr(row, single.name),
    region: getStr(row, single.region),
    province: getStr(row, single.province),
    status: getStr(row, single.status),
    phone: getStr(row, single.phone),
    email: getStr(row, single.email),
    categories: getMulti(row, multi.categories || []),
    classifications: getMulti(row, multi.classifications || []),
    servicesOffered: getMulti(row, multi.servicesOffered || []),
    specializations: getMulti(row, multi.specializations || []),
    mhpssLevel: getStr(row, single.mhpssLevel),
    mhpssLevelFromDb: getStr(row, single.mhpssLevelFromDb),
    modeOfDelivery: getMulti(row, multi.modeOfDelivery || []),
    modeOfPayment: getMulti(row, multi.modeOfPayment || []),
    location: getStr(row, single.location),
    faxNumber: getStr(row, single.faxNumber),
    websiteUrl: getStr(row, single.websiteUrl),
    socialMedia: {
      facebook: getStr(row, single.facebook) || undefined,
      instagram: getStr(row, single.instagram) || undefined,
      linkedin: getStr(row, single.linkedin) || undefined,
      twitter: getStr(row, single.twitter) || undefined,
      youtube: getStr(row, single.youtube) || undefined,
      flickr: getStr(row, single.flickr) || undefined,
    },
    photoUrl: getStr(row, single.photoUrl),
    description: getStr(row, single.description),
    videoUrl: getStr(row, single.videoUrl),
    priceRange: getStr(row, single.priceRange),
    openingHours: getStr(row, single.openingHours),
    dateOfEstablishment: getStr(row, single.dateOfEstablishment),
    inclusivityTags: getMulti(row, multi.inclusivityTags || []),
  };
}

async function fetchFromSheet(): Promise<Provider[]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME || "Sheet1";

  if (!sheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID environment variable");
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: sheetName,
  });

  const rows = response.data.values;
  if (!rows || rows.length < 2) {
    return [];
  }

  const headers = rows[0] as string[];
  const columnMap = buildColumnMap(headers);

  const providers: Provider[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] as string[];
    const provider = normalizeRow(row, columnMap);
    // Skip rows without a facility name
    if (provider.name) {
      providers.push(provider);
    }
  }

  return providers;
}

export async function getProviders(): Promise<Provider[]> {
  const now = Date.now();

  if (cachedProviders && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedProviders;
  }

  const providers = await fetchFromSheet();
  cachedProviders = providers;
  cacheTimestamp = now;

  return providers;
}
