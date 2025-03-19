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
    post_id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

CREATE TABLE IF NOT EXISTS likes (
     liked_by TEXT REFERENCES users(email) ON DELETE CASCADE,
     post_id UUID REFERENCES posts(post_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
     created_at TIMESTAMPTZ DEFAULT now(),
     post_id UUID REFERENCES posts(post_id) ON DELETE CASCADE,
     commented_by TEXT REFERENCES users(email) ON DELETE CASCADE,
     comment_text TEXT,
     comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
