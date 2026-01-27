import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.NYTIMES_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'NYTimes API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      //`https://api.nytimes.com/svc/topstories/v2/world.json?api-key=${apiKey}`,
      `https://api.nytimes.com/svc/mostpopular/v2/viewed/7.json?api-key=${apiKey}`,
      { cache: 'no-store' }
    );
    
    const data = await response.json();
    
    if (data.results) {
      // Return top 9 stories with images converted to base64
      const storiesWithImages = await Promise.all(
        data.results
          .filter(story => story.media && story.media.length > 0)
          .slice(0, 9)
          .map(async (story) => {
            const originalImageUrl = story.media[0]?.['media-metadata']?.[2]?.url;
            let base64Image = null;
            
            if (originalImageUrl) {
              try {
                const imgResponse = await fetch(originalImageUrl, {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; NewsProxy/1.0)',
                  },
                });
                
                if (imgResponse.ok) {
                  const arrayBuffer = await imgResponse.arrayBuffer();
                  const buffer = Buffer.from(arrayBuffer);
                  const contentType = imgResponse.headers.get('content-type') || 'image/jpeg';
                  base64Image = `data:${contentType};base64,${buffer.toString('base64')}`;
                }
              } catch (error) {
                console.error('Failed to fetch image:', error);
              }
            }
            
            return {
              title: story.title,
              abstract: story.abstract,
              url: story.url,
              image: base64Image,
              section: story.section,
              publishedDate: story.published_date
            };
          })
      );
      
      return NextResponse.json(storiesWithImages);
    }
    
    return NextResponse.json([]);
  } catch (error) {
    console.error('Failed to fetch NYTimes stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
