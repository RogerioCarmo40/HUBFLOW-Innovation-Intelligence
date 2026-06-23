import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { lovable } from "@/integrations/lovable";
import type { AgentType, Idea, Insight, Project, User } from "./types";
import type { AgentResult } from "./ai-agents";

const isBrowser = typeof window !== "undefined";

type Result = { ok: boolean; error?: string };

// -----------------------------------------------------------------------------
// Row → domain mappers
// -----------------------------------------------------------------------------
type Row = Record<string, unknown>;

function rowToProject(r: Row): Project {
  return {
    id: r.id as string,
    name: r.name as string,
    description: (r.description as string) ?? "",
    sector: (r.sector as string) ?? "",
    maturity: r.maturity as Project["maturity"],
    status: r.status as Project["status"],
    owner: (r.owner as string) ?? "",
    createdAt: r.created_at as string,
  };
}

function rowToIdea(r: Row): Idea {
  return {
    id: r.id as string,
    title: r.title as string,
    description: (r.description as string) ?? "",
    type: r.type as Idea["type"],
    status: r.status as Idea["status"],
    projectId: (r.project_id as string | null) ?? null,
    author: (r.author as string) ?? "",
    sector: (r.sector as string) ?? "",
    tags: (r.tags as string[]) ?? [],
    createdAt: r.created_at as string,
  };
}

function rowToInsight(r: Row): Insight {
  return {
    id: r.id as string,
    ideaId: (r.idea_id as string | null) ?? null,
    projectId: (r.project_id as string | null) ?? null,
    agentType: r.agent_type as AgentType,
    inputContext: (r.input_context as Record<string, unknown>) ?? {},
    resultSummary: (r.result_summary as string) ?? "",
    resultStructured: (r.result_structured as Record<string, unknown>) ?? {},
    createdAt: r.created_at as string,
  };
}

// =============================================================================
// AUTH
// =============================================================================
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<Result>;
  register: (data: {
    name: string;
    company: string;
    email: string;
    password: string;
  }) => Promise<Result>;
  loginWithGoogle: () => Promise<Result>;
  loginWithApple: () => Promise<Result>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<Pick<User, "name" | "company" | "role">>) => Promise<Result>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  const fetchProfile = useCallback(async (session: Session) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();

    if (data) {
      setUser({
        id: data.id,
        name: data.name,
        email: data.email ?? session.user.email ?? "",
        company: data.company,
        role: data.role,
        createdAt: data.created_at,
      });
    } else {
      // Profile may not be ready yet right after sign-up — use a minimal fallback.
      setUser({
        id: session.user.id,
        name:
          (session.user.user_metadata?.name as string) ??
          session.user.email?.split("@")[0] ??
          "User",
        email: session.user.email ?? "",
        company: (session.user.user_metadata?.company as string) ?? "",
        role: "Innovation Manager",
        createdAt: session.user.created_at,
      });
    }
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Defer Supabase calls out of the callback to avoid deadlocks.
        setTimeout(() => void fetchProfile(session), 0);
      } else {
        setUser(null);
      }
      if (event === "SIGNED_OUT") {
        queryClient.clear();
      }
    });

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session) return fetchProfile(data.session);
      })
      .finally(() => setIsReady(true));

    return () => sub.subscription.unsubscribe();
  }, [fetchProfile, queryClient]);

  const login = useCallback<AuthContextValue["login"]>(
    async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { ok: false, error: error.message };
      if (data.session) await fetchProfile(data.session);
      return { ok: true };
    },
    [fetchProfile],
  );

  const register = useCallback<AuthContextValue["register"]>(
    async ({ name, company, email, password }) => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: isBrowser ? window.location.origin : undefined,
          data: { name: name.trim(), company: company.trim() },
        },
      });
      if (error) return { ok: false, error: error.message };
      if (data.session) {
        await fetchProfile(data.session);
        return { ok: true };
      }
      // No session means email confirmation is required.
      return { ok: false, error: "Check your email to confirm your account before signing in." };
    },
    [fetchProfile],
  );

  const loginWithGoogle = useCallback<AuthContextValue["loginWithGoogle"]>(async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: isBrowser ? window.location.origin : undefined,
    });
    if (result.error) return { ok: false, error: String(result.error.message ?? result.error) };
    return { ok: true };
  }, []);

  const loginWithApple = useCallback<AuthContextValue["loginWithApple"]>(async () => {
    const result = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: isBrowser ? window.location.origin : undefined,
    });
    if (result.error) return { ok: false, error: String(result.error.message ?? result.error) };
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    setUser(null);
  }, [queryClient]);

  const updateUser = useCallback<AuthContextValue["updateUser"]>(
    async (patch) => {
      if (!user) return { ok: false, error: "Not signed in." };
      const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
      if (error) return { ok: false, error: error.message };
      setUser({ ...user, ...patch });
      return { ok: true };
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isReady,
      login,
      register,
      loginWithGoogle,
      loginWithApple,
      logout,
      updateUser,
    }),
    [user, isReady, login, register, loginWithGoogle, loginWithApple, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AppProvider");
  return ctx;
}

// =============================================================================
// DATA
// =============================================================================
interface DataContextValue {
  projects: Project[];
  ideas: Idea[];
  insights: Insight[];
  isLoading: boolean;
  addProject: (data: Omit<Project, "id" | "createdAt">) => Promise<void>;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  addIdea: (data: Omit<Idea, "id" | "createdAt">) => Promise<void>;
  updateIdea: (id: string, patch: Partial<Idea>) => Promise<void>;
  addInsight: (data: {
    agentType: AgentType;
    input: string;
    result: AgentResult;
    projectId?: string | null;
    ideaId?: string | null;
  }) => Promise<void>;
  getProject: (id: string) => Project | undefined;
  getIdea: (id: string) => Idea | undefined;
  insightsForProject: (id: string) => Insight[];
  insightsForIdea: (id: string) => Insight[];
}

const DataContext = createContext<DataContextValue | null>(null);

function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const enabled = !!userId && isBrowser;

  const projectsQuery = useQuery({
    queryKey: ["projects", userId],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToProject);
    },
  });

  const ideasQuery = useQuery({
    queryKey: ["ideas", userId],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToIdea);
    },
  });

  const insightsQuery = useQuery({
    queryKey: ["insights", userId],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insights")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(rowToInsight);
    },
  });

  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data]);
  const ideas = useMemo(() => ideasQuery.data ?? [], [ideasQuery.data]);
  const insights = useMemo(() => insightsQuery.data ?? [], [insightsQuery.data]);

  const dataRef = useRef({ projects, ideas, insights });
  dataRef.current = { projects, ideas, insights };

  const invalidate = useCallback(
    (key: "projects" | "ideas" | "insights") =>
      queryClient.invalidateQueries({ queryKey: [key, userId] }),
    [queryClient, userId],
  );

  const addProject = useCallback<DataContextValue["addProject"]>(
    async (input) => {
      if (!userId) return;
      const { error } = await supabase.from("projects").insert({
        user_id: userId,
        name: input.name,
        description: input.description,
        sector: input.sector,
        maturity: input.maturity,
        status: input.status,
        owner: input.owner,
      });
      if (error) throw error;
      await invalidate("projects");
    },
    [userId, invalidate],
  );

  const updateProject = useCallback<DataContextValue["updateProject"]>(
    async (id, patch) => {
      const row: Row = {};
      if (patch.name !== undefined) row.name = patch.name;
      if (patch.description !== undefined) row.description = patch.description;
      if (patch.sector !== undefined) row.sector = patch.sector;
      if (patch.maturity !== undefined) row.maturity = patch.maturity;
      if (patch.status !== undefined) row.status = patch.status;
      if (patch.owner !== undefined) row.owner = patch.owner;
      const { error } = await supabase.from("projects").update(row as never).eq("id", id);
      if (error) throw error;
      await invalidate("projects");
    },
    [invalidate],
  );

  const addIdea = useCallback<DataContextValue["addIdea"]>(
    async (input) => {
      if (!userId) return;
      const { error } = await supabase.from("ideas").insert({
        user_id: userId,
        title: input.title,
        description: input.description,
        type: input.type,
        status: input.status,
        project_id: input.projectId,
        author: input.author,
        sector: input.sector,
        tags: input.tags,
      });
      if (error) throw error;
      await invalidate("ideas");
    },
    [userId, invalidate],
  );

  const updateIdea = useCallback<DataContextValue["updateIdea"]>(
    async (id, patch) => {
      const row: Row = {};
      if (patch.title !== undefined) row.title = patch.title;
      if (patch.description !== undefined) row.description = patch.description;
      if (patch.type !== undefined) row.type = patch.type;
      if (patch.status !== undefined) row.status = patch.status;
      if (patch.projectId !== undefined) row.project_id = patch.projectId;
      if (patch.author !== undefined) row.author = patch.author;
      if (patch.sector !== undefined) row.sector = patch.sector;
      if (patch.tags !== undefined) row.tags = patch.tags;
      const { error } = await supabase.from("ideas").update(row as never).eq("id", id);
      if (error) throw error;
      await invalidate("ideas");
    },
    [invalidate],
  );

  const addInsight = useCallback<DataContextValue["addInsight"]>(
    async ({ agentType, input, result, projectId = null, ideaId = null }) => {
      if (!userId) return;
      const { error } = await supabase.from("insights").insert({
        user_id: userId,
        agent_type: agentType,
        project_id: projectId,
        idea_id: ideaId,
        input_context: { input } as unknown as Json,
        result_summary: result.summary,
        result_structured: { blocks: result.blocks } as unknown as Json,
      });
      if (error) throw error;
      await invalidate("insights");
    },
    [userId, invalidate],
  );

  const value = useMemo<DataContextValue>(
    () => ({
      projects,
      ideas,
      insights,
      isLoading: projectsQuery.isLoading || ideasQuery.isLoading || insightsQuery.isLoading,
      addProject,
      updateProject,
      addIdea,
      updateIdea,
      addInsight,
      getProject: (id) => dataRef.current.projects.find((p) => p.id === id),
      getIdea: (id) => dataRef.current.ideas.find((i) => i.id === id),
      insightsForProject: (id) => dataRef.current.insights.filter((i) => i.projectId === id),
      insightsForIdea: (id) => dataRef.current.insights.filter((i) => i.ideaId === id),
    }),
    [
      projects,
      ideas,
      insights,
      projectsQuery.isLoading,
      ideasQuery.isLoading,
      insightsQuery.isLoading,
      addProject,
      updateProject,
      addIdea,
      updateIdea,
      addInsight,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within AppProvider");
  return ctx;
}

// =============================================================================
export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DataProvider>{children}</DataProvider>
    </AuthProvider>
  );
}