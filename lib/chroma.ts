import { ChromaClient, Collection } from "chromadb";
import OpenAI from "openai";
import type { Provider, LLMIntentResult } from "./types";
import { MAX_RESULTS } from "./constants";

// Initialize OpenAI-compatible client for Alibaba Cloud Model Studio embeddings
const openai = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
});

// Initialize Chroma client for Chroma Cloud
function getChromaClient(): ChromaClient {
  const tenant = process.env.CHROMA_TENANT;
  const database = process.env.CHROMA_DATABASE;
  const apiKey = process.env.CHROMA_API_KEY;

  if (!tenant || !database || !apiKey) {
    throw new Error(
      "Missing Chroma Cloud configuration. Set CHROMA_TENANT, CHROMA_DATABASE, and CHROMA_API_KEY environment variables."
    );
  }

  return new ChromaClient({
    ssl: true,
    host: "api.trychroma.com",
    port: 443,
    headers: {
      "X-Chroma-Token": apiKey,
    },
    tenant,
    database,
  });
}

const COLLECTION_NAME = "mhph_providers";
const EMBEDDING_MODEL = "text-embedding-v3";

// Generate embedding for text using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

// Generate embeddings for multiple texts in batch (max 10 per request for DashScope)
const EMBEDDING_BATCH_SIZE = 10;
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBEDDING_BATCH_SIZE);
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });
    results.push(...response.data.map((item) => item.embedding));
  }
  return results;
}

// Create searchable text from provider data
function providerToText(provider: Provider): string {
  const parts = [
    provider.name,
    provider.description,
    provider.region,
    provider.province,
    provider.location,
    ...provider.specializations,
    ...provider.servicesOffered,
    ...provider.categories,
    ...provider.modeOfDelivery,
    ...provider.modeOfPayment,
    ...provider.inclusivityTags,
    provider.priceRange,
  ].filter(Boolean);

  return parts.join(" ");
}

// Create intent search query text
function intentToQuery(intent: LLMIntentResult): string {
  const parts = [
    ...intent.specializations,
    ...intent.services,
    intent.region,
    intent.modeOfDelivery,
    intent.modeOfPayment,
    ...(intent.inclusivityPreferences || []),
    ...intent.searchTerms,
  ].filter(Boolean);

  return parts.join(" ");
}

// Get or create the providers collection
async function getCollection(): Promise<Collection> {
  const client = getChromaClient();
  
  try {
    return await client.getCollection({ name: COLLECTION_NAME });
  } catch {
    // Collection doesn't exist, create it
    return await client.createCollection({
      name: COLLECTION_NAME,
      embeddingFunction: null,
      metadata: { description: "MHPH mental health providers" },
    });
  }
}

// Index providers into Chroma
export async function indexProviders(providers: Provider[]): Promise<void> {
  if (providers.length === 0) return;

  const collection = await getCollection();
  
  // Generate IDs for providers
  const ids = providers.map((_, index) => `provider_${index}`);
  
  // Generate texts and embeddings
  const texts = providers.map(providerToText);
  const embeddings = await generateEmbeddings(texts);
  
  // Prepare metadata (store key provider info for filtering)
  const metadatas = providers.map((p) => ({
    name: p.name,
    region: p.region.toLowerCase(),
    province: p.province.toLowerCase(),
    location: p.location.toLowerCase(),
    modeOfDelivery: p.modeOfDelivery.join(",").toLowerCase(),
    status: p.status.toLowerCase(),
  }));

  // Clear existing data and add new
  const existingIds = await collection.get();
  if (existingIds.ids.length > 0) {
    await collection.delete({ ids: existingIds.ids });
  }

  await collection.add({
    ids,
    embeddings,
    metadatas,
    documents: texts,
  });

  console.log(`Indexed ${providers.length} providers into Chroma`);
}

// Search providers using vector similarity
export async function searchProvidersVector(
  intent: LLMIntentResult
): Promise<string[]> {
  const collection = await getCollection();
  
  // Generate query embedding
  const queryText = intentToQuery(intent);
  const queryEmbedding = await generateEmbedding(queryText);
  
  // Build where clause for hard filters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let whereClause: any = undefined;
  
  // Hard filter by region if specified
  if (intent.region) {
    const regionLower = intent.region.toLowerCase();
    whereClause = {
      $or: [
        { region: { $contains: regionLower } },
        { province: { $contains: regionLower } },
        { location: { $contains: regionLower } },
      ],
    };
  }
  
  // Hard filter by mode of delivery if specified
  if (intent.modeOfDelivery) {
    let modeLower = intent.modeOfDelivery.toLowerCase();

    // edge case to allow online requests to be served with hybrid schedules.
    if (modeLower =='online') modeLower = 'hybrid';
    console.log('modeLower', modeLower)

    if (whereClause) {
      whereClause = {
        $and: [
          whereClause,
          { modeOfDelivery: { $contains: modeLower } },
        ],
      };
    } else {
      whereClause = { modeOfDelivery: { $contains: modeLower } };
    }
  }

  // Query Chroma
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: MAX_RESULTS,
    where: whereClause,
  });

  // Return provider IDs
  return results.ids[0] || [];
}

// Get providers by their IDs from the indexed data
export async function getProvidersByIds(
  ids: string[]
): Promise<{ id: string; document: string; metadata: Record<string, unknown> }[]> {
  if (ids.length === 0) return [];
  
  const collection = await getCollection();
  const results = await collection.get({ ids });
  
  return ids.map((id, index) => ({
    id,
    document: results.documents[index] || "",
    metadata: (results.metadatas[index] as Record<string, unknown>) || {},
  }));
}

// Check if collection has data
export async function isCollectionPopulated(): Promise<boolean> {
  try {
    const collection = await getCollection();
    const count = await collection.count();
    return count > 0;
  } catch {
    return false;
  }
}
