create table public.user_personalization (
  id uuid references auth.users on delete cascade not null primary key,
  learning_style text not null,
  interests text[] not null default '{}',
  communication_style text not null,
  motivation_type text not null,
  custom_prompts jsonb[] not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.user_personalization enable row level security;

-- Create policy for users to access only their own data
create policy "Users can view their own personalization"
  on public.user_personalization for select
  using (auth.uid() = id);

create policy "Users can update their own personalization"
  on public.user_personalization for update
  using (auth.uid() = id);

create policy "Users can insert their own personalization"
  on public.user_personalization for insert
  with check (auth.uid() = id);

  //#endregion
//#endregion