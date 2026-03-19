import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { ArrowLeft, FileText, Download, ExternalLink, PenSquare } from 'lucide-react';
import DeleteButton from '@/components/DeleteButton';

dayjs.locale('ko');

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  // 세션 확인
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = 'Guest';
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile) userRole = profile.role;
  }

  // 게시글 조회 + 조회수 증가
  const { data: post, error } = await supabase
    .from('free_board_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !post) notFound();

  // 조회수 증가
  await supabase
    .from('free_board_posts')
    .update({ view_count: (post.view_count || 0) + 1 })
    .eq('id', id);

  const isAuthor = user?.id === post.author_id;
  const isAdmin = ['Admin', 'Pastor', 'Elder', 'MediaTeam', 'Deacon'].includes(userRole);
  const canDelete = isAuthor || isAdmin;
  
  const attachments = post.attachments || [];

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden w-full">
      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/board"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          자유게시판으로 돌아가기
        </Link>

        {/* Post Card */}
        <article className="bg-neutral-900/40 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
          {/* Post Header */}
          <div className="p-8 border-b border-white/10">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-4">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-neutral-400">
                <span className="font-medium text-neutral-200">{post.author_name}</span>
                <span>·</span>
                <time>{dayjs(post.created_at).format('YYYY년 MM월 DD일 HH:mm')}</time>
                <span>·</span>
                <span>조회 {(post.view_count || 0) + 1}</span>
              </div>
              {canDelete && (
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/board/edit/${id}`}
                    className="p-2 text-neutral-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"
                    title="게시글 수정"
                  >
                    <PenSquare className="w-5 h-5" />
                  </Link>
                  <DeleteButton 
                    postId={id} 
                    tableName="free_board_posts" 
                    redirectPath="/board" 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Post Content */}
          <div className="p-8">
            <div className="text-neutral-200 leading-relaxed whitespace-pre-wrap text-base mb-12">
              {post.content}
            </div>

            {/* Attachments Section */}
            {attachments.length > 0 && (
              <div className="mt-12 pt-8 border-t border-white/5">
                <h3 className="text-sm font-semibold text-neutral-400 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  첨부파일 ({attachments.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {attachments.map((file: any, index: number) => (
                    <div key={index} className="group flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                          <FileText className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-medium text-neutral-200 truncate">{file.name}</span>
                          <span className="text-[10px] text-neutral-500 uppercase">{file.type?.split('/')[1] || 'FILE'}</span>
                        </div>
                      </div>
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-neutral-400 hover:text-white transition-colors"
                        title="다운로드/열기"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  ))}
                </div>
                
                {/* Image Previews */}
                <div className="mt-8 grid grid-cols-1 gap-6">
                  {attachments.filter((f: any) => f.type?.startsWith('image/')).map((file: any, index: number) => (
                    <div key={index} className="rounded-2xl overflow-hidden border border-white/10">
                      <img 
                        src={file.url} 
                        alt={file.name} 
                        className="w-full h-auto object-contain bg-black/20"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Bottom Nav */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/board"
            className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로
          </Link>
          {user && (
            <Link
              href="/board/write"
              className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              새 글 작성
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

