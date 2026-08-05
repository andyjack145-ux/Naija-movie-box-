# Naija Movie Box

## Supabase setup

This app reads its Supabase configuration from Vite environment variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-anon-key
```

Copy `.env.example` to `.env` and fill in the values for local development. Never commit `.env` or any private service-role key to the repository.

When deploying, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the hosting provider's environment settings.