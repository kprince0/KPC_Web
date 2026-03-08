-- Create the ENUM for User Roles
CREATE TYPE user_role AS ENUM (
  'Guest', 
  'Member(Pending)', 
  'Member(Approved)', 
  'Pastor', 
  'Elder', 
  'MediaTeam', 
  'Deacon', 
  'Admin'
);

-- Note: In a real environment, you should initialize 'Admin' with password 'Password' via Supabase Auth UI or Seed data.
-- Since this is purely SQL for Schema:

-- 1. Create Profiles Table mapping to auth.users
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'Guest'::user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policy: User can see their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 4. Policy: Admins can view all profiles
-- Adjust logic below depending on specific admin roles required to see directory
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('Admin', 'Pastor', 'Elder')
);

-- 5. Trigger Function to Handle new User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    -- Set default admin role if email matches the preset admin email
    CASE
      WHEN new.email = 'admin@admin.com' THEN 'Admin'::user_role
      ELSE 'Guest'::user_role
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger on auth.users insertions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
