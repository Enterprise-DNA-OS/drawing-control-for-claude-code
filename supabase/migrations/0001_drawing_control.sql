-- Drawing control is a record system. Human engineers make design decisions.
create table drawings (
 id uuid primary key default gen_random_uuid(), number text not null unique check (btrim(number) <> ''),
 title text not null check (btrim(title) <> ''), site text not null default '', discipline text not null default '',
 asset text not null default '', owner text not null default '', safety_critical boolean not null default false,
 source_id text unique, raw_source jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table revisions (
 id uuid primary key default gen_random_uuid(), drawing_id uuid not null references drawings(id),
 revision text not null check (btrim(revision) <> ''), sequence integer not null check (sequence>0),
 status text not null default 'draft' check (status in ('draft','in_review','approved','superseded','rejected')),
 file_ref text not null default '', purpose text not null default '', risk_ref text not null default '', safe_use_ref text not null default '',
 approved_by text, approved_at timestamptz, decision_ref text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(drawing_id,revision), unique(drawing_id,sequence),
 check (status not in ('approved','superseded') or (nullif(btrim(approved_by),'') is not null and approved_at is not null and nullif(btrim(decision_ref),'') is not null))
);
create unique index one_approved_revision on revisions(drawing_id) where status='approved';
create table reviews (
 id uuid primary key default gen_random_uuid(), revision_id uuid not null references revisions(id), reviewer text not null check (btrim(reviewer)<>''),
 due_on date not null, status text not null default 'pending' check(status in ('pending','accepted','rejected')),
 evidence text not null default '', decided_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(revision_id,reviewer), check(status='pending' or (btrim(evidence)<>'' and decided_at is not null))
);
create index reviews_revision on reviews(revision_id);
create index reviews_due on reviews(due_on) where status='pending';
create table transmittals (
 id uuid primary key default gen_random_uuid(), reference text not null unique check(btrim(reference)<>''),
 recipient text not null check(btrim(recipient)<>''), purpose text not null check(btrim(purpose)<>''), due_on date not null,
 recorded_by text not null, acknowledged_at timestamptz, acknowledgement_ref text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(acknowledged_at is null or nullif(btrim(acknowledgement_ref),'') is not null)
);
create table transmittal_items (
 id uuid primary key default gen_random_uuid(), transmittal_id uuid not null references transmittals(id), revision_id uuid not null references revisions(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(transmittal_id,revision_id)
);
create index transmittal_items_revision on transmittal_items(revision_id);
create table notes (
 id uuid primary key default gen_random_uuid(), drawing_id uuid not null references drawings(id), actor text not null, body text not null check(btrim(body)<>''),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index notes_drawing on notes(drawing_id);
create table imports (
 id uuid primary key default gen_random_uuid(), digest text not null unique, source text not null, original_csv text not null, mapping jsonb not null,
 actor text not null, row_count integer not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table audit_events (
 id uuid primary key default gen_random_uuid(), entity text not null, record_id uuid not null, action text not null, actor text not null,
 before_row jsonb, after_row jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index audit_record on audit_events(record_id,created_at);
create function touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
do $$ declare t text; begin
 foreach t in array array['drawings','revisions','reviews','transmittals','transmittal_items','notes','imports','audit_events'] loop
 execute format('create trigger touch_updated before update on %I for each row execute function touch_updated_at()',t);
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
 end loop;
end $$;
create view drawing_register as
 select d.id,d.number,d.title,d.site,d.discipline,d.asset,d.owner,d.safety_critical,
 a.revision as approved_revision,l.revision as latest_revision,l.status as latest_status,
 l.id as latest_revision_id, a.id as approved_revision_id,
 (select count(*)::int from reviews rv join revisions r on r.id=rv.revision_id where r.drawing_id=d.id and rv.status='pending') as pending_reviews
 from drawings d left join revisions a on a.drawing_id=d.id and a.status='approved'
 left join lateral (select * from revisions where drawing_id=d.id order by sequence desc limit 1) l on true;
create view review_queue as
 select rv.id,d.number,d.title,r.revision,rv.reviewer,rv.due_on, greatest(0,current_date-rv.due_on) as days_overdue,
 d.safety_critical,rv.status,r.status as revision_status
 from reviews rv join revisions r on r.id=rv.revision_id join drawings d on d.id=r.drawing_id where rv.status='pending';
create view handover_register as
 select t.id,t.reference,t.recipient,t.due_on,t.acknowledged_at,
 count(i.id)::int as drawings,
 count(*) filter(where r.status<>'approved')::int as superseded_items,
 greatest(0,current_date-t.due_on) as days_overdue
 from transmittals t join transmittal_items i on i.transmittal_id=t.id join revisions r on r.id=i.revision_id group by t.id;
create view compliance_findings as
 select d.number,r.revision,'DESIGN-INFORMATION'::text as rule,'Missing purpose, risk assessment or safe-use reference'::text as finding
 from drawings d join revisions r on r.drawing_id=d.id
 where d.safety_critical and r.status<>'superseded' and (btrim(r.purpose)='' or btrim(r.risk_ref)='' or btrim(r.safe_use_ref)='')
 union all select d.number,r.revision,'FILE-REFERENCE','No drawing file reference recorded' from drawings d join revisions r on r.drawing_id=d.id where r.status<>'superseded' and btrim(r.file_ref)=''
 union all select d.number,r.revision,'REVIEW-OVERDUE','Pending review is past its internal due date' from reviews rv join revisions r on r.id=rv.revision_id join drawings d on d.id=r.drawing_id where rv.status='pending' and rv.due_on<current_date
 union all select d.number,r.revision,'SUPERSEDED-HANDOVER','A handover includes a superseded revision' from transmittal_items i join revisions r on r.id=i.revision_id join drawings d on d.id=r.drawing_id where r.status='superseded';
revoke all on drawing_register,review_queue,handover_register,compliance_findings from public;
