<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/17wzKDSyj5yCzo4IvLiTNqxQyNODfiHSb

## Run Locally

**Prerequisites:** Node.js and Supabase project


1. Install dependencies:
   `npm install`
2. Create a `.env.local` file in the project root and add your environment variables:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   **To get your Supabase credentials:**
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project (or create a new one)
   - Go to Settings → API
   - Copy the "Project URL" and "anon public" key

3. Run the app:
   `npm run dev`

**Note:** If you see "Failed to fetch" errors, make sure your Supabase environment variables are correctly set and restart the development server.