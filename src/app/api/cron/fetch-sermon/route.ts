import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 이 API는 Vercel Cron에 의해 매주 일요일에 자동 호출됩니다.
export async function GET(request: Request) {
  try {
    // 1. 보안 확인: Vercel Cron에서 보낸 요청인지 확인 (CRON_SECRET)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

    if (!YOUTUBE_API_KEY || !CHANNEL_ID) {
      return NextResponse.json({ error: 'YouTube API Key or Channel ID missing' }, { status: 500 });
    }

    // 2. YouTube API에서 채널의 "Uploads" 재생목록 ID를 먼저 가져옵니다. (Search API보다 할당량이 저렴함)
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelRes.json();
    
    if (!channelData.items || channelData.items.length === 0) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // 3. "Uploads" 재생목록에서 가장 최근 영상 1개를 가져옵니다.
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=1&key=${YOUTUBE_API_KEY}`
    );
    const playlistData = await playlistRes.json();

    if (!playlistData.items || playlistData.items.length === 0) {
      return NextResponse.json({ error: 'No videos found in the channel' }, { status: 404 });
    }

    const latestVideo = playlistData.items[0].snippet;
    const youtubeId = latestVideo.resourceId.videoId;
    const title = latestVideo.title;
    const thumbnailUrl = latestVideo.thumbnails?.high?.url || latestVideo.thumbnails?.default?.url;
    
    // 날짜는 미국 동부시간(EST) 기준 일요일로 맞추거나 현재 시간을 사용합니다.
    const today = new Date();
    const sermonDate = today.toISOString().split('T')[0];

    // 4. Supabase DB에 저장
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // 서버 사이드이므로 서비스 롤 키 사용
    );

    // 중복 방지를 위해 이미 있는지 확인
    const { data: existingSermon } = await supabase
      .from('sermons')
      .select('id')
      .eq('youtube_id', youtubeId)
      .single();

    if (existingSermon) {
      return NextResponse.json({ message: 'Video already exists in database', youtubeId });
    }

    // 새 예배 영상 추가
    const { error: insertError } = await supabase
      .from('sermons')
      .insert({
        youtube_id: youtubeId,
        title: title,
        preacher: '김강일 목사', // 기본값
        scripture: '',         // 본문은 나중에 관리자가 수정 가능
        sermon_date: sermonDate,
        thumbnail_url: thumbnailUrl
      });

    if (insertError) {
      console.error('Supabase Insert Error:', insertError);
      return NextResponse.json({ error: 'Failed to insert to Supabase' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Successfully added new sermon', youtubeId, title });
    
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
