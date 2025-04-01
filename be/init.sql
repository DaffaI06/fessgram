CREATE TABLE IF NOT EXISTS users (
    created_at TIMESTAMPTZ DEFAULT now(),
    email TEXT PRIMARY KEY,
    name TEXT,
    google_id TEXT UNIQUE,
    avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS posts (
    created_at TIMESTAMPTZ DEFAULT now(),
    posted_by TEXT REFERENCES users(email) ON DELETE CASCADE,
    post_text TEXT,
    post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES posts(post_id) DEFAULT NULL,
    community_id UUID REFERENCES communities(community_id) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS likes (
    liked_by TEXT REFERENCES users(email) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(post_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS communities (
    community_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_name TEXT,
    description TEXT,
    made_by TEXT REFERENCES users(email) ON DELETE CASCADE,
    banner_url TEXT,
    pfp_url TEXT
);

CREATE TABLE IF NOT EXISTS community_members (
   community_id UUID REFERENCES communities(community_id) ON DELETE CASCADE,
   user_email TEXT REFERENCES users(email) ON DELETE CASCADE
);