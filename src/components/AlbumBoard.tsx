'use client';

import { useState } from 'react';
import PhotoBoard from './PhotoBoard';
import { ArrowLeft, Images, PenSquare } from 'lucide-react';
import Link from 'next/link';
import DeleteButton from './DeleteButton';

export interface Album {
  id: string;
  title: string;
  content: string;
  created_at: string;
  attachments: { url: string; name: string }[];
}

export default function AlbumBoard({ albums, isAdmin = false }: { albums: Album[], isAdmin?: boolean }) {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  if (selectedAlbum) {
    const photos = selectedAlbum.attachments.map((att, idx) => ({
      id: `${selectedAlbum.id}-${idx}`,
      postId: selectedAlbum.id,
      url: att.url,
      alt: selectedAlbum.title,
      description: selectedAlbum.content,
    }));

    return (
      <div className="animate-in fade-in duration-500">
        <button 
          onClick={() => setSelectedAlbum(null)}
          className="mb-8 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>앨범 목록으로 돌아가기</span>
        </button>
        
        <div className="mb-8 px-4">
          <h2 className="text-3xl font-bold text-white mb-2">{selectedAlbum.title}</h2>
          <p className="text-neutral-400 flex items-center gap-2">
            <Images className="w-4 h-4" /> {selectedAlbum.attachments.length}장의 사진
          </p>
        </div>

        <PhotoBoard photos={photos} isAdmin={isAdmin} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
      {albums.map((album) => {
        const coverImg = album.attachments?.[0]?.url || 'https://via.placeholder.com/800x600?text=No+Photo';
        return (
          <div 
            key={album.id}
            onClick={() => setSelectedAlbum(album)}
            className="group relative rounded-2xl overflow-hidden cursor-pointer bg-neutral-900 border border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.3)] shadow-lg aspect-square"
          >
            <img 
              src={coverImg} 
              alt={album.title} 
              className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="text-white text-lg font-bold mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                {album.title}
              </h3>
              <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
                <span className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
                  <Images className="w-4 h-4" />
                  {album.attachments?.length || 0}장
                </span>
                <span className="uppercase tracking-wider">
                  {new Date(album.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
            
            {isAdmin && (
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-2">
                <Link 
                  href={`/photos/edit/${album.id}`}
                  className="p-2 bg-indigo-500/90 hover:bg-indigo-500 text-white rounded-xl transition-colors shadow-lg"
                  title="앨범 수정"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PenSquare className="w-4 h-4" />
                </Link>
                <div onClick={(e) => e.stopPropagation()}>
                  <DeleteButton 
                    postId={album.id} 
                    tableName="photo_posts" 
                    redirectPath="/photos" 
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
