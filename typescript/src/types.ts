/** Shared response / request types for the LawDiver API v1. */

export type JurisdictionType =
  | "all_states"
  | "all_states_and_federal"
  | "all_federal"
  | "one_state"
  | "one_state_plus_federal"
  | "federal_circuit"
  | "federal_district"
  | "us_supreme_court";

export interface Jurisdiction {
  type: JurisdictionType;
  state?: string;
  circuit?: string;
  districtState?: string;
}

export type SearchType =
  | "auto"
  | "citation"
  | "case_name"
  | "keyword"
  | "semantic"
  | "hybrid";

export interface SearchRequest {
  query: string;
  jurisdiction: Jurisdiction;
  searchType?: SearchType;
  limit?: number;
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    includeUnpublished?: boolean;
    publishedOnly?: boolean;
    goodLawOnly?: boolean;
  };
  include?: {
    caseCard?: boolean;
    opinionText?: boolean;
    goodLawReport?: boolean;
  };
  opinionTextMaxChars?: number;
}

export interface UsageBlock {
  operation: string;
  quantity: number;
  costMillicents?: number;
  costCents?: number;
  breakdown?: Record<string, number>;
  replayed?: boolean;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; message: string }>;
  };
  usage: UsageBlock | null;
  requestId: string;
}

export interface GoodLawSummary {
  status: string;
  negative: boolean;
  unknown: boolean;
  negativeTreatmentCount?: number;
  basis?: string;
  computedAt?: string;
  negativeCitations?: unknown[];
}

export type MatchedBy =
  | "reporter_key"
  | "case_name"
  | "volume_page_near"
  | "docket_number"
  | string;

export interface KnownCitation {
  cite: string;
  kind?: string;
  preferred?: boolean;
  matched?: boolean;
}

export interface SearchResult {
  caseId: string;
  caseName: string;
  citation: string | null;
  /** Preferred Bluebook form when known. */
  bluebookCitation?: string | null;
  /** Other locators on file for the same decision. */
  parallelCitations?: string[];
  opinionType?: string;
  court?: string;
  courtAbbreviation?: string;
  jurisdiction?: string;
  dateFiled?: string;
  year?: number;
  published?: boolean;
  citedByCount?: number;
  snippet?: string;
  snippetSource?: string;
  goodLaw?: GoodLawSummary;
  caseCard?: Record<string, unknown> | null;
  opinion?: {
    mode: string;
    text: string;
    charCount: number;
    sourceCharCount?: number;
    truncated?: boolean;
  } | null;
  matchExplanation?: string;
  retrievalUrl?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  totalAvailable?: number;
  searchInfo?: Record<string, unknown>;
  suggestion?: string | null;
  replayed?: boolean;
  usage: UsageBlock;
  requestId: string;
}

/**
 * Cite-check verdict taxonomy (sync + document jobs).
 * There is no cite verdict `not_found` -- that code is only HTTP 404 or retrieve `status: "not_found"`.
 */
export type CiteVerdict =
  | "valid"
  | "name_mismatch"
  | "page_mismatch"
  | "likely_valid"
  | "implausible"
  | "not_in_corpus"
  | "not_covered"
  | "unverified"
  | "error";

/** All cite-check verdicts -- useful for exhaustive switches / tests. */
export const CITE_VERDICTS: readonly CiteVerdict[] = [
  "valid",
  "name_mismatch",
  "page_mismatch",
  "likely_valid",
  "implausible",
  "not_in_corpus",
  "not_covered",
  "unverified",
  "error",
] as const;

export type CiteLookupStatus =
  | "completed"
  | "deadline_exceeded"
  | "skipped_budget"
  | "failed";

/**
 * Structured coverage for graded negatives (`implausible`, `not_in_corpus`, `not_covered`).
 * Shape varies by reporter family; unknown keys are allowed.
 */
export interface CiteCoverage {
  reporter?: string;
  series?: string;
  volume?: number | string;
  page?: number | string;
  held?: boolean;
  reason?: string;
  [key: string]: unknown;
}

/**
 * Per-field comparison when as-written caption/year/court diverge (`name_mismatch` and kin).
 */
export interface CiteFieldMatch {
  field?: string;
  asWritten?: string | null;
  expected?: string | null;
  matched?: boolean;
  [key: string]: unknown;
}

export interface CiteCheckCandidate {
  caseId?: string;
  caseName?: string;
  bluebookCitation?: string;
  citation?: string;
  parallelCitations?: string[];
  knownCitations?: KnownCitation[];
  court?: string;
  year?: number;
  published?: boolean;
  citedByCount?: number;
  goodLaw?: GoodLawSummary;
  matchedBy?: MatchedBy;
  confidence?: number;
  retrievalUrl?: string;
  pdfUrl?: string;
  [key: string]: unknown;
}

/**
 * One cite-check result row.
 *
 * Compounds / subsequent-history phrases can expand to multiple rows that share
 * the same `inputIndex` (with `unitIndex` distinguishing units). Always match on
 * `inputIndex`, not array position -- `results.length` may exceed the input count.
 */
export interface CiteCheckItem {
  /** Index into the original `citations` / `citation` input (0-based). */
  inputIndex: number;
  /** Unit within an expanded compound (0 = primary). */
  unitIndex?: number;
  /** e.g. primary / subsequent history role when expanded. */
  role?: string;
  /** Exact input string echoed back. */
  citationAsSent: string;
  /** As-written form (may match citationAsSent). Still returned by the API. */
  citationAsWritten?: string;
  verdict: CiteVerdict;
  /** Soft-lookup outcome; soft timeouts are never silent absences. */
  lookupStatus?: CiteLookupStatus;
  correctedCitation?: string | null;
  explanation?: string;
  corpusCaveat?: string | null;
  coverage?: CiteCoverage | null;
  /** Field-level match detail when caption/year/court diverge from the resolved case. */
  fieldMatches?: CiteFieldMatch[] | Record<string, CiteFieldMatch | boolean | string | null> | null;
  reporterKeys?: string[];
  candidates?: CiteCheckCandidate[];
}

export interface CiteCheckResponse {
  results: CiteCheckItem[];
  usage: UsageBlock;
  requestId: string;
  replayed?: boolean;
}

export interface DocumentJobStart {
  jobId: string;
  status: string;
  fileName: string;
  fileSize: number;
  message?: string;
  statusUrl?: string;
  reportUrl?: string;
  pollAfterSeconds?: number;
  requestId: string;
}

export interface DocumentJobStatus {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed" | string;
  fileName?: string;
  pageCount?: number | null;
  citationCount?: number | null;
  counts?: Record<string, number> | null;
  otherAuthoritiesFound?: number | null;
  citations?: CiteCheckItem[] | null;
  reportUrl?: string | null;
  error?: string | null;
  createdAt?: string;
  startedAt?: string | null;
  completedAt?: string | null;
  requestId?: string;
}

export interface RetrieveCandidate {
  caseId: string;
  caseName: string;
  bluebookCitation?: string;
  citation?: string;
  year?: number;
  confidence?: number;
  matchedBy?: MatchedBy;
  pdfUrl?: string;
}

export interface RetrieveOk {
  status: "ok";
  case: Record<string, unknown> & { pdfUrl?: string; caseId?: string };
  usage: UsageBlock;
  requestId: string;
}

export interface RetrieveDidYouMean {
  status: "did_you_mean";
  message?: string;
  candidates: RetrieveCandidate[];
  usage: UsageBlock;
  requestId: string;
}

/** Retrieve miss -- not a cite-check verdict. Always HTTP 200. */
export interface RetrieveNotFound {
  status: "not_found";
  corpusCaveat?: string | null;
  usage: UsageBlock;
  requestId: string;
}

export type RetrieveResponse = RetrieveOk | RetrieveDidYouMean | RetrieveNotFound;

export interface StatuteSection {
  authorityKey: string;
  authorityId?: string | null;
  authorityNum?: number | null;
  kind: "statute" | "rule" | "constitution" | "regulation" | string;
  bluebook: string;
  heading?: string | null;
  body?: string | null;
  bodyChars?: number | null;
  edition?: string | null;
  editionYear?: number | null;
  officialUrl?: string | null;
  repealed?: boolean;
  jurisdiction?: string | null;
  section?: string | null;
  subsections?: string | null;
  verifiedBy?: string | null;
}

export interface StatuteRetrieveResponse {
  status: "ok" | "not_found" | "unavailable" | "not_a_statute" | string;
  message?: string;
  query?: string;
  citationAsWritten?: string | null;
  verdict?: string | null;
  note?: string | null;
  statute?: StatuteSection | null;
  usage: UsageBlock;
  requestId: string;
  replayed?: boolean;
}

export interface ResolveCitationResponse {
  verdict?: CiteVerdict | string;
  correctedCitation?: string | null;
  explanation?: string;
  candidates: CiteCheckCandidate[];
  usage: UsageBlock;
  requestId: string;
}

export interface CaseMetadata {
  caseId?: string;
  caseName?: string;
  citation?: string | null;
  bluebookCitation?: string | null;
  parallelCitations?: string[];
  court?: string;
  year?: number;
  dateFiled?: string;
  published?: boolean;
  citedByCount?: number;
  goodLaw?: GoodLawSummary;
  [key: string]: unknown;
}

export interface CaseMetadataResponse extends CaseMetadata {
  usage?: UsageBlock;
  requestId: string;
}

export interface CaseBatchResponse {
  cases: CaseMetadata[];
  notFound: string[];
  usage: UsageBlock;
  requestId: string;
}

export interface GoodLawResponse extends GoodLawSummary {
  caseId?: string;
  usage?: UsageBlock;
  requestId: string;
}

export interface CitedByItem {
  caseId: string;
  caseName?: string;
  citation?: string | null;
  bluebookCitation?: string | null;
  court?: string;
  year?: number;
  [key: string]: unknown;
}

export interface CitedByResponse {
  caseId?: string;
  results?: CitedByItem[];
  citingCases?: CitedByItem[];
  total?: number;
  limit?: number;
  offset?: number;
  usage: UsageBlock;
  requestId: string;
  [key: string]: unknown;
}

export interface JurisdictionsResponse {
  types?: JurisdictionType[] | Array<{ type: JurisdictionType; [key: string]: unknown }>;
  states?: string[];
  circuits?: string[];
  examples?: unknown[];
  usage?: UsageBlock | null;
  requestId: string;
  [key: string]: unknown;
}

export interface DiscoveryEndpoint {
  method: string;
  path: string;
  description?: string;
}

export interface DiscoveryResponse {
  api?: string;
  version?: string;
  documentation?: string;
  authentication?: Record<string, unknown>;
  endpoints?: DiscoveryEndpoint[];
  pricing?: Record<string, unknown>;
  usage?: UsageBlock | null;
  requestId: string;
  [key: string]: unknown;
}

export interface UsageResponse {
  consumer: { name?: string; email?: string; status?: string };
  periodDays: number;
  since?: string;
  byOperation: Array<{
    operation: string;
    calls: number;
    units: number;
    costCents: number;
  }>;
  totalCostCents: number;
  yourPricing: Record<string, string | number>;
  requestId: string;
}
