export type BookStatus = 'pending' | 'published' | 'rejected';

export type Book = {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  buy_link: string | null;
  cover_bg: string;
  cover_text: string;
  tags: string[];
  status: BookStatus;
  invite_token_id: string | null;
  created_at: string;
};

export type InviteToken = {
  id: string;
  token: string;
  label: string;
  max_books: number | null;
  expires_at: string | null;
  revoked: boolean;
  created_at: string;
};

export type Excerpt = {
  id: string;
  book_id: string;
  order: number;
  text: string;
  created_at: string;
};

export type ExcerptStats = {
  excerpt_id: string;
  views: number;
  likes: number;
  want_clicks: number;
};

export type ExcerptWithStats = Excerpt & {
  stats: { views: number; likes: number; want_clicks: number };
};

export type Profile = {
  id: string;
  is_admin: boolean;
  created_at: string;
};

// Minimal Database shape for @supabase/ssr generics. Generated schema is preferred
// in real projects (via `supabase gen types typescript`); this is a hand-written stub
// so the app compiles without the Supabase CLI.
type TableShape<Row, Insert = Row, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      invite_tokens: TableShape<
        InviteToken,
        Omit<InviteToken, "id" | "token" | "created_at" | "revoked"> & {
          id?: string;
          token?: string;
          created_at?: string;
          revoked?: boolean;
        },
        Partial<Omit<InviteToken, "id" | "token" | "created_at">>
      >;
      books: TableShape<
        Book,
        Omit<Book, "id" | "created_at" | "status" | "invite_token_id"> & {
          id?: string;
          created_at?: string;
          status?: BookStatus;
          invite_token_id?: string | null;
        },
        Partial<Omit<Book, "id" | "created_at">>
      >;
      excerpts: TableShape<
        Excerpt,
        Omit<Excerpt, "id" | "created_at"> & { id?: string; created_at?: string },
        Partial<Omit<Excerpt, "id" | "created_at">>
      >;
      excerpt_stats: TableShape<ExcerptStats>;
      profiles: TableShape<Profile>;
      likes: TableShape<
        { user_id: string; excerpt_id: string; created_at: string },
        { user_id: string; excerpt_id: string },
        never
      >;
      bookmarks: TableShape<
        { user_id: string; excerpt_id: string; created_at: string },
        { user_id: string; excerpt_id: string },
        never
      >;
      view_sessions: TableShape<
        { user_id: string; excerpt_id: string; last_viewed_at: string },
        { user_id: string; excerpt_id: string; last_viewed_at?: string },
        { last_viewed_at?: string }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      toggle_like: {
        Args: { p_excerpt_id: string };
        Returns: boolean;
      };
      toggle_bookmark: {
        Args: { p_excerpt_id: string };
        Returns: boolean;
      };
      register_view: {
        Args: { p_excerpt_id: string };
        Returns: void;
      };
      register_want: {
        Args: { p_excerpt_id: string };
        Returns: void;
      };
      move_excerpt: {
        Args: { p_excerpt_id: string; p_direction: number };
        Returns: void;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      validate_invite_token: {
        Args: { p_token: string };
        Returns: {
          id: string;
          label: string;
          max_books: number | null;
          book_count: number;
          is_valid: boolean;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
