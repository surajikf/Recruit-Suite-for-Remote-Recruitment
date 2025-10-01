# Supabase Storage Setup for PDF Resumes

## Quick Setup (2 minutes)

### Step 1: Create Storage Bucket

1. Go to: https://supabase.com/dashboard/project/czzpkrtlujpejuzhdnnr/storage/buckets

2. Click **"New Bucket"**

3. Fill in:
   - **Name**: `resumes`
   - **Public bucket**: ✅ **YES** (check this box)
   - Click **"Create bucket"**

### Step 2: Set Storage Policy (Allow Public Access)

1. Click on the `resumes` bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"**
4. Select **"For full customization"**
5. Add this policy:

```sql
-- Allow public read access to resumes
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'resumes' );

-- Allow authenticated uploads
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'resumes' );
```

**OR** use the simple UI:
- Policy name: `Public Access`
- Allowed operation: **SELECT**
- Target roles: **public**
- USING expression: `bucket_id = 'resumes'`

### Step 3: That's It!

Now your app will:
- Upload PDF resumes to Supabase Storage
- Generate public URLs
- "View" button opens PDF in new tab

---

## Alternative: Quick Policy via SQL

Go to SQL Editor and run:

```sql
-- Create bucket if not exists (GUI is easier)
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read
CREATE POLICY IF NOT EXISTS "Public read access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'resumes' );

-- Allow anyone to upload (you can restrict this to authenticated users)
CREATE POLICY IF NOT EXISTS "Public upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'resumes' );
```

---

## Done!

Your resumes will now be stored at:
`https://czzpkrtlujpejuzhdnnr.supabase.co/storage/v1/object/public/resumes/[filename]`

And the "View" button will open them in a new tab! 🎉

