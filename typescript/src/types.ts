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

export interface SearchResult {
  caseId: string;
  caseName: string;
  citation: string | null;
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

export type CiteVerdict =
  | "valid"
  | "name_mismatch"
  | "likely_valid"
  | "not_found"
  | "error";

export interface CiteCheckItem {
  citationAsWritten: string;
  verdict: CiteVerdict;
  correctedCitation?: string | null;
  explanation?: string;
  corpusCaveat?: string | null;
  reporterKeys?: string[];
  candidates?: Array<Record<string, unknown>>;
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

export interface RetrieveOk {
  status: "ok";
  case: Record<string, unknown> & { pdfUrl?: string; caseId?: string };
  usage: UsageBlock;
  requestId: string;
}

export interface RetrieveDidYouMean {
  status: "did_you_mean";
  message?: string;
  candidates: Array<{
    caseId: string;
    caseName: string;
    bluebookCitation?: string;
    year?: number;
    confidence?: number;
    matchedBy?: string;
    pdfUrl?: string;
  }>;
  usage: UsageBlock;
  requestId: string;
}

export interface RetrieveNotFound {
  status: "not_found";
  corpusCaveat?: string | null;
  usage: UsageBlock;
  requestId: string;
}

export type RetrieveResponse = RetrieveOk | RetrieveDidYouMean | RetrieveNotFound;

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
