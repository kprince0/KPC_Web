-- 자유게시판 (Free Board) 테이블 생성
create table public.free_board_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  author_id uuid references public.profiles(id) not null,
  author_name text not null,
  view_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) 설정
alter table public.free_board_posts enable row level security;

-- 1. 누구나 (Guest 포함) 자유게시판 글 목록과 상세 내용을 읽을 수 있음 (Select)
create policy "Anyone can read free board posts" 
on public.free_board_posts for select 
using (true);

-- 2. 관리자 그룹 혹은 승인된(Approved) 회원만 자유게시판에 글을 쓸 수 있음 (Insert)
create policy "Approved members and admins can insert posts" 
on public.free_board_posts for insert 
with check (
  auth.uid() = author_id and (
    public.is_approved_or_admin(auth.uid()) = true
  )
);

-- 3. 관리자 혹은 작성자 본인만 글을 수정/삭제할 수 있음 (Update / Delete)
create policy "Authors and admins can update their posts" 
on public.free_board_posts for update 
using (
  auth.uid() = author_id or 
  ((select role from public.profiles where id = auth.uid()) in ('Admin', 'Pastor', 'Elder', 'MediaTeam', 'Deacon'))
);

create policy "Authors and admins can delete their posts" 
on public.free_board_posts for delete 
using (
  auth.uid() = author_id or 
  ((select role from public.profiles where id = auth.uid()) in ('Admin', 'Pastor', 'Elder', 'MediaTeam', 'Deacon'))
);
