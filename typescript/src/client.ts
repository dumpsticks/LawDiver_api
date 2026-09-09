import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type {
  ApiErrorBody,
  CiteCheckResponse,
  DocumentJobStart,
  DocumentJobStatus,
  RetrieveResponse,
  SearchRequest,
  SearchResponse,
  UsageResponse,
} from "./types.js";

const DEFAULT_BASE = "https://lawdiver.com/api/v1";

/** Load KEY=VALUE pairs from a .env file if present (no dependency). */
function loadDotEnv(filePath: string): void {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function resolveApiKey(): string {
  // Walk up a few directories so examples work from typescript/ or repo root.
  const candidates = [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "..", ".env"),
    resolve(process.cwd(), "..", "..", ".env"),
  ];
  for (const p of candidates) loadDotEnv(p);

  const key =
    process.env.LAWDIVER_API_KEY?.trim() ||
    process.env.LAWTOOLS_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "Missing API key. Set LAWDIVER_API_KEY (or LAWTOOLS_API_KEY) in the environment or a .env file. Create a key at https://lawdiver.com/account/api-keys",
    );
  }
  return key;
}

export class LawDiverApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly requestId: string;
  readonly details?: ApiErrorBody["error"]["details"];

  constructor(status: number, body: ApiErrorBody) {
    super(`${body.error.code}: ${body.error.message} (${body.requestId})`);
    this.name = "LawDiverApiError";
    this.status = status;
    this.code = body.error.code;
    this.requestId = body.requestId;
    this.details = body.error.details;
  }
}

export interface LawDiverClientOptions {
  apiKey?: string;
  baseUrl?: string;
  /** Optional fetch implementation (tests / custom agents). */
  fetch?: typeof fetch;
}

/**
 * Thin LawDiver API client — plain fetch, no SDK magic.
 * Docs: https://lawdiver.com/docs/api
 */
export class LawDiverClient {
  readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: LawDiverClientOptions = {}) {
    this.apiKey = options.apiKey ?? resolveApiKey();
    this.baseUrl = (options.baseUrl ?? process.env.LAWDIVER_API_BASE ?? DEFAULT_BASE).replace(
      /\/$/,
      "",
    );
    this.fetchImpl = options.fetch ?? fetch;
  }

  /** Unauthenticated discovery document. */
  async discovery(): Promise<unknown> {
    const res = await this.fetchImpl(this.baseUrl);
    return res.json();
  }

  async search(body: SearchRequest, idempotencyKey?: string): Promise<SearchResponse> {
    return this.request<SearchResponse>("POST", "/search", body, idempotencyKey);
  }

  async jurisdictions(): Promise<unknown> {
    return this.request<unknown>("GET", "/jurisdictions");
  }

  async citeCheck(
    input: { citation: string } | { citations: string[] },
    idempotencyKey?: string,
  ): Promise<CiteCheckResponse> {
    return this.request<CiteCheckResponse>("POST", "/citecheck/cite", input, idempotencyKey);
  }

  async resolveCitation(query: string): Promise<unknown> {
    return this.request<unknown>("POST", "/citations/resolve", { query });
  }

  async retrieve(
    body: { query: string; caseId?: string },
    idempotencyKey?: string,
  ): Promise<RetrieveResponse> {
    return this.request<RetrieveResponse>("POST", "/cases/retrieve", body, idempotencyKey);
  }

  async caseMetadata(caseId: string): Promise<unknown> {
    return this.request<unknown>("GET", `/cases/${encodeURIComponent(caseId)}`);
  }

  async caseBatch(caseIds: string[]): Promise<unknown> {
    return this.request<unknown>("POST", "/cases/batch", { caseIds });
  }

  async goodLaw(caseId: string): Promise<unknown> {
    return this.request<unknown>("GET", `/cases/${encodeURIComponent(caseId)}/good-law`);
  }

  async citedBy(
    caseId: string,
    opts: { limit?: number; offset?: number } = {},
  ): Promise<unknown> {
    const q = new URLSearchParams();
    if (opts.limit != null) q.set("limit", String(opts.limit));
    if (opts.offset != null) q.set("offset", String(opts.offset));
    const qs = q.toString();
    return this.request<unknown>(
      "GET",
      `/cases/${encodeURIComponent(caseId)}/cited-by${qs ? `?${qs}` : ""}`,
    );
  }

  /** Returns raw PDF bytes. */
  async casePdf(caseId: string): Promise<ArrayBuffer> {
    const res = await this.fetchImpl(`${this.baseUrl}/cases/${encodeURIComponent(caseId)}/pdf`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as ApiErrorBody | null;
      if (json?.error) throw new LawDiverApiError(res.status, json);
      throw new Error(`PDF download failed: HTTP ${res.status}`);
    }
    return res.arrayBuffer();
  }

  async startDocumentCiteCheck(file: Blob, fileName: string): Promise<DocumentJobStart> {
    const form = new FormData();
    form.append("file", file, fileName);
    const res = await this.fetchImpl(`${this.baseUrl}/citecheck/document`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: form,
    });
    const json = (await res.json()) as DocumentJobStart & ApiErrorBody;
    if (!res.ok) throw new LawDiverApiError(res.status, json as ApiErrorBody);
    return json;
  }

  async documentJob(jobId: string): Promise<DocumentJobStatus> {
    return this.request<DocumentJobStatus>(
      "GET",
      `/citecheck/jobs/${encodeURIComponent(jobId)}`,
    );
  }

  async documentReport(jobId: string): Promise<ArrayBuffer> {
    const res = await this.fetchImpl(
      `${this.baseUrl}/citecheck/jobs/${encodeURIComponent(jobId)}/report`,
      { headers: { Authorization: `Bearer ${this.apiKey}` } },
    );
    if (!res.ok) {
      const json = (await res.json().catch(() => null)) as ApiErrorBody | null;
      if (json?.error) throw new LawDiverApiError(res.status, json);
      throw new Error(`Report download failed: HTTP ${res.status}`);
    }
    return res.arrayBuffer();
  }

  /**
   * Upload → poll → optional report download.
   * Caps polling so a stuck job becomes an error instead of an infinite loop.
   */
  async citeCheckDocument(
    file: Blob,
    fileName: string,
    opts: { pollMs?: number; maxPolls?: number; downloadReport?: boolean } = {},
  ): Promise<{ job: DocumentJobStatus; report?: ArrayBuffer }> {
    const started = await this.startDocumentCiteCheck(file, fileName);
    const pollMs = opts.pollMs ?? (started.pollAfterSeconds ?? 5) * 1000;
    const maxPolls = opts.maxPolls ?? 120;

    let job = started as unknown as DocumentJobStatus;
    for (let i = 0; i < maxPolls && (job.status === "queued" || job.status === "processing"); i++) {
      await new Promise((r) => setTimeout(r, pollMs));
      job = await this.documentJob(started.jobId);
    }
    if (job.status !== "completed") {
      throw new Error(`Cite check ${job.status}: ${job.error ?? "timed out"}`);
    }
    if (opts.downloadReport) {
      return { job, report: await this.documentReport(started.jobId) };
    }
    return { job };
  }

  async usage(days = 30): Promise<UsageResponse> {
    return this.request<UsageResponse>("GET", `/usage?days=${days}`);
  }

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    body?: unknown,
    idempotencyKey?: string,
  ): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
    };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const json = (await res.json()) as T & ApiErrorBody;
    if (!res.ok) throw new LawDiverApiError(res.status, json as ApiErrorBody);
    return json;
  }
}
