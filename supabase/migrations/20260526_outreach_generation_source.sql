-- Add a generation_source column to outreach_messages so we can tell at a
-- glance whether a draft came from the AI, a fallback template, or a manual
-- human paste-in. Existing rows default to 'ai' since the queue was the
-- only producer before this.

begin;

alter table public.outreach_messages
  add column if not exists generation_source text not null default 'ai'
    check (generation_source in ('ai', 'fallback_template', 'manual'));

create index if not exists outreach_messages_generation_source_idx
  on public.outreach_messages (generation_source);

commit;
