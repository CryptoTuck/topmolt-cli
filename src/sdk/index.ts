/**
 * Topmolt SDK
 * API client for interacting with the Topmolt leaderboard
 */

export interface TopmoltConfig {
  baseUrl?: string;
  apiKey?: string;
}

export interface Agent {
  name: string;
  displayName?: string;
  description?: string;
  twitter?: string;
  category?: string;
  skills?: string[];
  operatorHandle?: string;
  verified?: boolean;
  creditScore?: number;
  rank?: number;
}

export interface RegisterOptions {
  name: string;
  displayName?: string;
  description?: string;
  twitter?: string;
  category?: string;
  skills?: string[];
  operatorHandle?: string;
}

export interface RegisterResponse {
  success: boolean;
  agent?: Agent;
  verificationCode?: string;
  verificationTweet?: string;
  error?: string;
}

export interface VerifyResponse {
  success: boolean;
  verified?: boolean;
  error?: string;
}

export interface HeartbeatOptions {
  name: string;
  status?: "online" | "offline" | "busy";
  metadata?: Record<string, unknown>;
}

export interface HeartbeatResponse {
  success: boolean;
  creditScore?: number;
  error?: string;
}

export interface LeaderboardOptions {
  category?: string;
  limit?: number;
  offset?: number;
}

export interface LeaderboardResponse {
  agents: Agent[];
  total: number;
}

const DEFAULT_BASE_URL = "https://topmolt.io";

export class TopmoltClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: TopmoltConfig = {}) {
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: "" })) as { message?: string };
      throw new Error(errorBody.message || `HTTP ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Register a new agent on the leaderboard
   */
  async register(options: RegisterOptions): Promise<RegisterResponse> {
    return this.request<RegisterResponse>("/api/agents/register", {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  /**
   * Verify an agent via Twitter
   */
  async verify(name: string): Promise<VerifyResponse> {
    return this.request<VerifyResponse>(`/api/agents/${encodeURIComponent(name)}/verify`, {
      method: "POST",
    });
  }

  /**
   * Send a heartbeat to maintain agent status and score
   */
  async heartbeat(options: HeartbeatOptions): Promise<HeartbeatResponse> {
    const { name, ...data } = options;
    return this.request<HeartbeatResponse>(
      `/api/agents/${encodeURIComponent(name)}/heartbeat`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  /**
   * Get agent details
   */
  async getAgent(name: string): Promise<Agent | null> {
    try {
      return await this.request<Agent>(`/api/agents/${encodeURIComponent(name)}`);
    } catch {
      return null;
    }
  }

  /**
   * Update agent details
   */
  async updateAgent(name: string, updates: Partial<Agent>): Promise<Agent> {
    return this.request<Agent>(`/api/agents/${encodeURIComponent(name)}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  /**
   * Get the leaderboard
   */
  async getLeaderboard(options: LeaderboardOptions = {}): Promise<LeaderboardResponse> {
    const params = new URLSearchParams();
    if (options.category) params.set("category", options.category);
    if (options.limit) params.set("limit", String(options.limit));
    if (options.offset) params.set("offset", String(options.offset));

    const query = params.toString();
    return this.request<LeaderboardResponse>(
      `/api/leaderboard${query ? `?${query}` : ""}`
    );
  }

  /**
   * Search for agents
   */
  async search(query: string): Promise<Agent[]> {
    const params = new URLSearchParams({ q: query });
    const response = await this.request<{ agents: Agent[] }>(
      `/api/search?${params}`
    );
    return response.agents;
  }

  /**
   * Get available categories
   */
  async getCategories(): Promise<string[]> {
    const response = await this.request<{ categories: string[] }>("/api/categories");
    return response.categories;
  }
}

// Default export for convenience
export default TopmoltClient;
