export function extractYoutubeId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

export async function fetchYoutubeMetadata(url: string) {
  const videoId = extractYoutubeId(url);
  if (!videoId) throw new Error("Invalid Youtube URL");
  
  // Using Youtube's oEmbed API endpoint as a reliable & keyless way to get meta info.
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  
  try {
    const response = await fetch(oembedUrl);
    const data = await response.json();
    return {
      title: data.title as string,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` || data.thumbnail_url,
      youtubeId: videoId
    };
  } catch (error) {
    console.error("Failed to fetch Youtube Meta via oEmbed:", error);
    // Fallback if the video restricts oembed
    return {
      title: "Unknown Sermon",
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      youtubeId: videoId
    };
  }
}
