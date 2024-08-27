import puppeteer from 'puppeteer-core';
import { NextResponse } from 'next/server';

interface RatingData {
  comment_number: number;
  attendance: string | null;
  comments: string | null;
}

interface ProfessorData {
  overallRating: string | null;
  wouldTakeAgain: string | null;
  difficulty: string | null;
  ratingsData: RatingData[];
}

async function scrapeProfessorData(professorLink: string): Promise<ProfessorData> {
  // Connect to the remote browser using puppeteer-core
  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BLESS_TOKEN}`,
  });
  
  const page = await browser.newPage();

  try {
    // Navigate to the professor's page
    await page.goto(professorLink, { waitUntil: 'domcontentloaded' });
    console.log(`Navigated to the professor's page: ${professorLink}`);

    // Extract all ratings and store them in a JSON object
    const ratings = await page.evaluate(() => {
      const ratingContainers = document.querySelectorAll('.Rating__RatingInfo-sc-1rhvpxz-3.kEVEoU');
      const overallRatingElement = document.querySelector('.RatingValue__Numerator-qw8sqy-2.liyUjw');
      const wouldTakeAgainElement = document.querySelectorAll('.FeedbackItem__FeedbackNumber-uof32n-1.kkESWs')[0];
      const difficultyElement = document.querySelectorAll('.FeedbackItem__FeedbackNumber-uof32n-1.kkESWs')[1];

      // Extract overall rating, would take again percentage, and difficulty with null checks
      const overallRating = overallRatingElement?.textContent?.trim() || null;
      const wouldTakeAgain = wouldTakeAgainElement?.textContent?.trim() || null;
      const difficulty = difficultyElement?.textContent?.trim() || null;

      const ratingsData: RatingData[] = [];

      // Loop through each rating container and extract comments and ratings
      ratingContainers.forEach((container, index) => {
        const attendanceElement = container.querySelector('.CourseMeta__StyledCourseMeta-x344ms-0.fPJDHT .MetaItem__StyledMetaItem-y0ixml-0.LXClX span');
        const attendance = attendanceElement?.textContent?.trim() || null;

        const commentsElement = container.querySelector('.Comments__StyledComments-dzzyvm-0.gRjWel');
        const comments = commentsElement?.textContent?.trim() || null;

        ratingsData.push({
          comment_number: index + 1,
          attendance: attendance,
          comments: comments
        });
      });

      return {
        overallRating,
        wouldTakeAgain,
        difficulty,
        ratingsData
      };
    });

    return ratings;
  } catch (error) {
    console.error('Error occurred while scraping the page:', error);
    throw new Error('Failed to scrape professor data.');
  } finally {
    await browser.close();
  }
}

export async function POST(req: Request) {
  try {
    const { professorLink } = await req.json();

    if (!professorLink || typeof professorLink !== 'string') {
      return NextResponse.json({ message: 'Invalid professor link' }, { status: 400 });
    }

    const data = await scrapeProfessorData(professorLink);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in API handler:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
