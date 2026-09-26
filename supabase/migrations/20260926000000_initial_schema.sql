create extension if not exists pgcrypto;

create table if not exists public.users (
  id text primary key,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  target_score numeric not null default 60 check (target_score between 0 and 100),
  target_band text not null default 'Just qualify',
  daily_study_hours numeric not null default 5 check (daily_study_hours between 1 and 24),
  created_at timestamptz not null default now()
);
create index if not exists users_auth_user_id_idx on public.users(auth_user_id);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, auth_user_id, name, email)
  values (
    new.id::text,
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_gate_profile on auth.users;
create trigger on_auth_user_created_gate_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

create table if not exists public.subjects (
  id text primary key,
  name text not null,
  marks_range text not null default '',
  priority_tier text not null default '',
  strategy_note text not null default ''
);
create table if not exists public.chapters (
  id text primary key,
  subject_id text not null references public.subjects(id) on delete cascade,
  name text not null,
  "order" integer not null,
  unique (subject_id, "order")
);

create table if not exists public.chapter_progress (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  chapter_id text not null references public.chapters(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'done')),
  pyq_done boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, chapter_id)
);
create table if not exists public.weekly_log (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  week_number integer not null check (week_number between 1 and 19),
  start_date date not null,
  end_date date not null,
  focus text not null,
  class_notes_done boolean not null default false,
  dpp_questions_done boolean not null default false,
  pyqs_done boolean not null default false,
  mock_test_done boolean not null default false,
  error_log_done boolean not null default false,
  short_notes_done boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, week_number)
);
create table if not exists public.mock_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  mock_number integer not null check (mock_number > 0),
  date date not null,
  aptitude_score numeric not null check (aptitude_score between 0 and 15),
  core_score numeric not null check (core_score between 0 and 85),
  total_score numeric not null check (total_score between 0 and 100),
  biggest_leak text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, mock_number)
);
create table if not exists public.error_logs (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  date date not null,
  subject text not null,
  question_summary text not null,
  reason_tag text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.resources (
  id text primary key,
  user_id text references public.users(id) on delete cascade,
  title text not null,
  url text not null check (url ~ '^https?://'),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  check ((is_default and user_id is null) or (not is_default and user_id is not null))
);
create table if not exists public.milestone_progress (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  milestone_key text not null,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, milestone_key)
);

create index if not exists chapter_progress_user_idx on public.chapter_progress(user_id);
create index if not exists weekly_log_user_idx on public.weekly_log(user_id, week_number);
create index if not exists mock_logs_user_idx on public.mock_logs(user_id, date desc);
create index if not exists error_logs_user_idx on public.error_logs(user_id, date desc);
create index if not exists resources_user_idx on public.resources(user_id);

grant usage on schema public to anon, authenticated;
grant select on public.subjects, public.chapters to anon, authenticated;
grant select, insert, update, delete on public.users, public.chapter_progress, public.weekly_log,
  public.mock_logs, public.error_logs, public.resources, public.milestone_progress to authenticated;

insert into public.subjects (id, name, marks_range, priority_tier, strategy_note) values
  ('engineering-maths', 'Engineering Mathematics', '13–15', 'Tier 1', 'Discrete Maths repeats every year and carries most weight.'),
  ('discrete-maths', 'Discrete Mathematics', '13–15', 'Tier 1', 'Graph theory, combinatorics, logic, and sets are high yield.'),
  ('verbal-aptitude', 'Verbal Aptitude', '15', 'Tier 1', 'Daily mixed sets and vocabulary retention.'),
  ('general-aptitude', 'General Aptitude', '15', 'Tier 1', 'Keep this daily, never push it late.'),
  ('digital-logic', 'Digital Logic – Digital Electronics', '4–6', 'Tier 3', 'Concepts once, then PYQ-only practice.'),
  ('c-programming', 'C Programming', '9–11', 'Tier 1', 'Pointers, recursion tracing, arrays, and code-output questions.'),
  ('data-structures', 'Data Structures & Programming', '9–11', 'Tier 1', 'Recursion, heaps, hashing, trees, and linked lists dominate.'),
  ('algorithms', 'Algorithms', '8–10', 'Tier 1', 'Analyze complexity and recurrence relations deeply.'),
  ('dbms', 'Database Management Systems', '6–8', 'Tier 2', 'Normalisation, SQL output, and transactions are frequent.'),
  ('toc', 'Theory of Computation', '6–8', 'Tier 2', 'Regular languages and closure properties are highly repetitive.'),
  ('os', 'Operating Systems', '7–9', 'Tier 1', 'Synchronization, scheduling, deadlock, and paging are highly testable.'),
  ('coa', 'Computer Organization and Architecture', '7–9', 'Tier 1', 'Pipelining and cache memory are the highest return topics.'),
  ('compiler-design', 'Compiler Design', '4–6', 'Tier 2', 'Parsing is predictable; focus on LL(1), SLR, and LR conflicts.'),
  ('computer-networks', 'Computer Networks', '6–8', 'Tier 2', 'Avoid removed topics; focus on routing, TCP, and subnetting.')
on conflict (id) do update set name = excluded.name, marks_range = excluded.marks_range,
  priority_tier = excluded.priority_tier, strategy_note = excluded.strategy_note;

insert into public.chapters (id, subject_id, name, "order") values
  ('math-probability', 'engineering-maths', 'Probability & Statistics', 1),
  ('math-calculus', 'engineering-maths', 'Single Variable Calculus', 2),
  ('math-linear-algebra', 'engineering-maths', 'Linear Algebra', 3),
  ('discrete-graph', 'discrete-maths', 'Graph Theory', 1),
  ('discrete-logic', 'discrete-maths', 'Mathematical Logic', 2),
  ('discrete-set', 'discrete-maths', 'Set Theory', 3),
  ('discrete-combinatorics', 'discrete-maths', 'Combinatorics', 4),
  ('verbal-parts', 'verbal-aptitude', 'Parts of Speech', 1),
  ('verbal-vocab', 'verbal-aptitude', 'Vocabulary', 2),
  ('verbal-reading', 'verbal-aptitude', 'Reading Comprehension', 3),
  ('general-quant', 'general-aptitude', 'Quantitative Aptitude', 1),
  ('general-analytical', 'general-aptitude', 'Analytical Aptitude', 2),
  ('general-spatial', 'general-aptitude', 'Spatial Aptitude', 3),
  ('logic-gates', 'digital-logic', 'Logic Gates', 1),
  ('logic-minimization', 'digital-logic', 'Minimization (Boolean Algebra, K-Map, Implicants)', 2),
  ('logic-combinational', 'digital-logic', 'Combinational Circuits', 3),
  ('logic-sequential', 'digital-logic', 'Sequential Circuits', 4),
  ('logic-number-systems', 'digital-logic', 'Number System', 5),
  ('c-datatypes', 'c-programming', 'Data Types and Operators', 1),
  ('c-control-flow', 'c-programming', 'Control Flow Statements', 2),
  ('c-functions', 'c-programming', 'Functions & Storage Classes', 3),
  ('c-arrays-pointers', 'c-programming', 'Arrays and Pointers', 4),
  ('c-strings', 'c-programming', 'Strings', 5),
  ('c-structures', 'c-programming', 'Structures and Unions', 6),
  ('c-misc', 'c-programming', 'Miscellaneous', 7),
  ('ds-intro', 'data-structures', 'Introduction to Data Structures', 1),
  ('ds-arrays', 'data-structures', 'Arrays', 2),
  ('ds-linked-list', 'data-structures', 'Linked List', 3),
  ('ds-stack-queue', 'data-structures', 'Stack and Queues', 4),
  ('ds-tree', 'data-structures', 'Tree', 5),
  ('ds-graph', 'data-structures', 'Graphs', 6),
  ('ds-hashing', 'data-structures', 'Hashing', 7),
  ('algo-analysis', 'algorithms', 'Analysis of Algorithm', 1),
  ('algo-design', 'algorithms', 'Design Strategies', 2),
  ('algo-greedy', 'algorithms', 'Greedy Method', 3),
  ('algo-dp', 'algorithms', 'Dynamic Programming', 4),
  ('algo-graphs', 'algorithms', 'Graph Algorithms', 5),
  ('algo-heap', 'algorithms', 'Heap Algorithms', 6),
  ('algo-backtracking', 'algorithms', 'Backtracking & Branch-and-Bound', 7),
  ('db-fd', 'dbms', 'FDs & Normalization', 1),
  ('db-transaction', 'dbms', 'Transaction & Concurrency Control', 2),
  ('db-er', 'dbms', 'ER Model', 3),
  ('db-sql', 'dbms', 'Query Language (SQL - Relational Algebra)', 4),
  ('db-file', 'dbms', 'File Organization & Indexing', 5),
  ('toc-fa', 'toc', 'Finite Automata (DFA, NFA, Regular Expressions, Regular Grammars, Closure Properties)', 1),
  ('toc-pda', 'toc', 'Push Down Automata (Context-Free Languages / Grammars)', 2),
  ('toc-tm', 'toc', 'Turing Machine & Recursively Enumerable Languages', 3),
  ('toc-decidability', 'toc', 'Decidability & Undecidability', 4),
  ('os-intro', 'os', 'Introduction and Background', 1),
  ('os-process', 'os', 'Process Management (Concepts, Fork, Scheduling Queues, Context Switching)', 2),
  ('os-cpu', 'os', 'CPU Scheduling (FCFS, SJF, SRTF, Round Robin, Priority, HRRN)', 3),
  ('os-sync', 'os', 'Process Synchronization – Coordination', 4),
  ('os-deadlock', 'os', 'Deadlock', 5),
  ('os-memory', 'os', 'Memory Management (Paging, Segmentation, Page Replacement, Virtual Memory)', 6),
  ('os-filesystem', 'os', 'File System and Device Management', 7),
  ('os-system-calls', 'os', 'System Calls and Threads', 8),
  ('os-revision', 'os', 'Revision', 9),
  ('coa-intro', 'coa', 'Introduction of COA', 1),
  ('coa-instruction', 'coa', 'Machine Instruction & Addressing Modes', 2),
  ('coa-floating-point', 'coa', 'Floating Point Representation', 3),
  ('coa-alu', 'coa', 'ALU & Control Unit', 4),
  ('coa-pipeline', 'coa', 'Instruction Pipelining', 5),
  ('coa-cache', 'coa', 'Cache Memory', 6),
  ('coa-secondary', 'coa', 'Secondary Memory & I/O Interface', 7),
  ('compiler-lexical', 'compiler-design', 'Lexical Analysis & Syntax Analysis', 1),
  ('compiler-sdt', 'compiler-design', 'Syntax Directed Translation (SDT)', 2),
  ('compiler-optimization', 'compiler-design', 'Intermediate Code & Code Optimization', 3),
  ('cn-ipv4', 'computer-networks', 'IPv4 Addressing', 1),
  ('cn-error', 'computer-networks', 'Error Control', 2),
  ('cn-flow', 'computer-networks', 'Flow Control', 3),
  ('cn-header', 'computer-networks', 'IPv4 Header & Fragmentation', 4),
  ('cn-tcp', 'computer-networks', 'TCP & UDP', 5),
  ('cn-mac', 'computer-networks', 'Medium Access Control (MAC)', 6),
  ('cn-routing', 'computer-networks', 'Routing Protocols & Algorithms', 7),
  ('cn-switching', 'computer-networks', 'Switching', 8),
  ('cn-application', 'computer-networks', 'Application Layer Protocols', 9),
  ('cn-ip-support', 'computer-networks', 'IP Support Protocols', 10),
  ('cn-osi', 'computer-networks', 'OSI and TCP/IP Protocol', 11)
on conflict (id) do update set subject_id = excluded.subject_id, name = excluded.name, "order" = excluded."order";

insert into public.resources (id, user_id, title, url, is_default) values
  ('default-iitians-gate', null, 'IITians GATE Classes Previous Papers', 'https://iitiansgateclasses.com/gate-previous-year-question-papers', true),
  ('default-pdf-utility', null, 'PDF Utility Studio', 'https://pdf-utility-studio.vercel.app/', true),
  ('default-knowledge-gate', null, 'Knowledge Gate - GATE Guidance by Sanchit Sir', 'https://www.knowledgegate.ai/courses/GATE-GUIDANCE-BY-SANCHIT-SIR', true),
  ('default-tcs-calculator', null, 'Official GATE Scientific Calculator - TCS iON', 'https://tcsion.com/OnlineAssessment/ScientificCalculator/Calculator.html', true)
on conflict (id) do update set title = excluded.title, url = excluded.url, is_default = true;

alter table public.users enable row level security;
alter table public.subjects enable row level security;
alter table public.chapters enable row level security;
alter table public.chapter_progress enable row level security;
alter table public.weekly_log enable row level security;
alter table public.mock_logs enable row level security;
alter table public.error_logs enable row level security;
alter table public.resources enable row level security;
alter table public.milestone_progress enable row level security;

create policy "Authenticated users can read group profiles" on public.users for select to authenticated using (true);
create policy "Users can create their own profile" on public.users for insert to authenticated with check (auth_user_id = auth.uid());
create policy "Users can update their own profile" on public.users for update to authenticated using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());
create policy "Users can delete their own profile" on public.users for delete to authenticated using (auth_user_id = auth.uid());
create policy "Public curriculum is readable" on public.subjects for select to anon, authenticated using (true);
create policy "Public chapters are readable" on public.chapters for select to anon, authenticated using (true);

create policy "Authenticated group can read progress" on public.chapter_progress for select to authenticated using (true);
create policy "Owners manage chapter progress" on public.chapter_progress for all to authenticated
  using (exists (select 1 from public.users u where u.id = chapter_progress.user_id and u.auth_user_id = auth.uid()))
  with check (exists (select 1 from public.users u where u.id = chapter_progress.user_id and u.auth_user_id = auth.uid()));
create policy "Authenticated group can read weekly logs" on public.weekly_log for select to authenticated using (true);
create policy "Owners manage weekly logs" on public.weekly_log for all to authenticated
  using (exists (select 1 from public.users u where u.id = weekly_log.user_id and u.auth_user_id = auth.uid()))
  with check (exists (select 1 from public.users u where u.id = weekly_log.user_id and u.auth_user_id = auth.uid()));
create policy "Authenticated group can read mock logs" on public.mock_logs for select to authenticated using (true);
create policy "Owners manage mock logs" on public.mock_logs for all to authenticated
  using (exists (select 1 from public.users u where u.id = mock_logs.user_id and u.auth_user_id = auth.uid()))
  with check (exists (select 1 from public.users u where u.id = mock_logs.user_id and u.auth_user_id = auth.uid()));
create policy "Authenticated group can read error logs" on public.error_logs for select to authenticated using (true);
create policy "Owners manage error logs" on public.error_logs for all to authenticated
  using (exists (select 1 from public.users u where u.id = error_logs.user_id and u.auth_user_id = auth.uid()))
  with check (exists (select 1 from public.users u where u.id = error_logs.user_id and u.auth_user_id = auth.uid()));

create policy "Users read defaults and own resources" on public.resources for select to authenticated
  using (is_default or exists (select 1 from public.users u where u.id = resources.user_id and u.auth_user_id = auth.uid()));
create policy "Owners create custom resources" on public.resources for insert to authenticated
  with check (not is_default and exists (select 1 from public.users u where u.id = resources.user_id and u.auth_user_id = auth.uid()));
create policy "Owners update custom resources" on public.resources for update to authenticated
  using (not is_default and exists (select 1 from public.users u where u.id = resources.user_id and u.auth_user_id = auth.uid()))
  with check (not is_default and exists (select 1 from public.users u where u.id = resources.user_id and u.auth_user_id = auth.uid()));
create policy "Owners delete custom resources" on public.resources for delete to authenticated
  using (not is_default and exists (select 1 from public.users u where u.id = resources.user_id and u.auth_user_id = auth.uid()));

create policy "Authenticated group can read milestone progress" on public.milestone_progress for select to authenticated using (true);
create policy "Owners manage milestone progress" on public.milestone_progress for all to authenticated
  using (exists (select 1 from public.users u where u.id = milestone_progress.user_id and u.auth_user_id = auth.uid()))
  with check (exists (select 1 from public.users u where u.id = milestone_progress.user_id and u.auth_user_id = auth.uid()));

do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.users, public.chapter_progress, public.weekly_log,
        public.mock_logs, public.error_logs, public.resources, public.milestone_progress;
    exception when duplicate_object then null;
    end;
  end if;
end $$;