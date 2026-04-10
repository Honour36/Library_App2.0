-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Roles Enum
CREATE TYPE user_role AS ENUM ('student', 'lecturer', 'admin');

-- Document Status Enum
CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected');

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    department TEXT,
    role user_role NOT NULL DEFAULT 'student',
    password_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL, -- Path in Supabase storage
    file_size BIGINT,
    category_id INTEGER REFERENCES public.categories(id),
    uploader_id UUID REFERENCES public.users(id),
    academic_year TEXT,
    semester TEXT,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    tags TEXT[],
    status document_status DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookmarks Table
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, document_id)
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Anyone can view uploader info, users can edit their own profile
CREATE POLICY "Public users are viewable by everyone." ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile." ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Categories: Anyone can view
CREATE POLICY "Categories are viewable by everyone." ON public.categories
    FOR SELECT USING (true);

-- Documents: 
-- 1. Students/Lecturers can view approved docs
-- 2. Lecturers can view their own docs (even pending)
-- 3. Admins can view everything
CREATE POLICY "View approved documents" ON public.documents
    FOR SELECT USING (
        status = 'approved' OR 
        uploader_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Lecturers can upload documents" ON public.documents
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('lecturer', 'admin'))
    );

CREATE POLICY "Admins can update all documents" ON public.documents
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    ) WITH CHECK (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Bookmarks: Users can manage their own
CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- RPC Functions
CREATE OR REPLACE FUNCTION increment_view_count(doc_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.documents
    SET view_count = view_count + 1
    WHERE id = doc_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_download_count(doc_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.documents
    SET download_count = download_count + 1
    WHERE id = doc_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
