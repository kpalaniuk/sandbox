-- Sandbox Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sandboxes table
CREATE TABLE sandboxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  owner_id TEXT NOT NULL, -- Clerk user ID
  privacy TEXT NOT NULL CHECK (privacy IN ('private', 'link', 'public')) DEFAULT 'private',
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  location TEXT,
  metadata JSONB DEFAULT '{}',
  state TEXT NOT NULL CHECK (state IN ('active', 'archived', 'deleted')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participants table
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sandbox_id UUID NOT NULL REFERENCES sandboxes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID or guest identifier
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'contributor', 'viewer')) DEFAULT 'contributor',
  display_name TEXT,
  consent_flags JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sandbox_id, user_id)
);

-- Media items table
CREATE TABLE media_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sandbox_id UUID NOT NULL REFERENCES sandboxes(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL, -- Clerk user ID
  type TEXT NOT NULL CHECK (type IN ('photo', 'video', 'audio', 'document')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  location_lat DECIMAL,
  location_lng DECIMAL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events/Itinerary items table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sandbox_id UUID NOT NULL REFERENCES sandboxes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location TEXT,
  location_lat DECIMAL,
  location_lng DECIMAL,
  created_by TEXT NOT NULL, -- Clerk user ID
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sandbox_id UUID NOT NULL REFERENCES sandboxes(id) ON DELETE CASCADE,
  payer_id TEXT NOT NULL, -- Clerk user ID
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  splits JSONB NOT NULL DEFAULT '[]', -- Array of {user_id, amount}
  status TEXT NOT NULL CHECK (status IN ('pending', 'settled', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages/Chat table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sandbox_id UUID NOT NULL REFERENCES sandboxes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID
  content TEXT NOT NULL,
  media_id UUID REFERENCES media_items(id) ON DELETE SET NULL, -- Optional: thread on media item
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reactions table
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(media_id, user_id, emoji)
);

-- Indexes for performance
CREATE INDEX idx_sandboxes_owner ON sandboxes(owner_id);
CREATE INDEX idx_sandboxes_state ON sandboxes(state);
CREATE INDEX idx_participants_sandbox ON participants(sandbox_id);
CREATE INDEX idx_participants_user ON participants(user_id);
CREATE INDEX idx_media_sandbox ON media_items(sandbox_id);
CREATE INDEX idx_media_owner ON media_items(owner_id);
CREATE INDEX idx_media_timestamp ON media_items(timestamp);
CREATE INDEX idx_events_sandbox ON events(sandbox_id);
CREATE INDEX idx_events_time ON events(start_time);
CREATE INDEX idx_expenses_sandbox ON expenses(sandbox_id);
CREATE INDEX idx_messages_sandbox ON messages(sandbox_id);
CREATE INDEX idx_reactions_media ON reactions(media_id);

-- Row Level Security (RLS)
ALTER TABLE sandboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - can be refined)
-- Sandboxes: visible to participants or public
CREATE POLICY "Sandboxes visible to participants"
  ON sandboxes FOR SELECT
  USING (
    privacy = 'public' OR
    owner_id = current_setting('request.jwt.claims', true)::json->>'sub' OR
    id IN (
      SELECT sandbox_id FROM participants
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Participants: visible within same sandbox
CREATE POLICY "Participants visible to sandbox members"
  ON participants FOR SELECT
  USING (
    sandbox_id IN (
      SELECT sandbox_id FROM participants
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Media: visible to sandbox participants
CREATE POLICY "Media visible to sandbox participants"
  ON media_items FOR SELECT
  USING (
    sandbox_id IN (
      SELECT sandbox_id FROM participants
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Events: visible to sandbox participants
CREATE POLICY "Events visible to sandbox participants"
  ON events FOR SELECT
  USING (
    sandbox_id IN (
      SELECT sandbox_id FROM participants
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Expenses: visible to sandbox participants
CREATE POLICY "Expenses visible to sandbox participants"
  ON expenses FOR SELECT
  USING (
    sandbox_id IN (
      SELECT sandbox_id FROM participants
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Messages: visible to sandbox participants
CREATE POLICY "Messages visible to sandbox participants"
  ON messages FOR SELECT
  USING (
    sandbox_id IN (
      SELECT sandbox_id FROM participants
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Reactions: visible to all
CREATE POLICY "Reactions visible to all"
  ON reactions FOR SELECT
  USING (true);
