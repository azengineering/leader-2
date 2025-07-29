import { MetadataRoute } from 'next';
import { getLeaders } from '@/data/leaders';
import { getActivePollsForUser } from '@/data/polls';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  console.log('Generating sitemap...');
  const baseUrl = 'https://janmatvoice.in';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/my-activities`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/polls`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/rate-leader`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  const polls = await getActivePollsForUser(null); // Fetch all active polls
  console.log(`Fetched ${polls.length} polls for sitemap.`);
  const pollPages: MetadataRoute.Sitemap = polls.map((poll) => ({
    url: `${baseUrl}/polls/${poll.id}`, // Assuming a route like /polls/[id]
    lastModified: new Date(poll.created_at),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [...staticPages, ...pollPages];
}
