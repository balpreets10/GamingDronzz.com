import supabaseService from './SupabaseService';

export interface HeroStatistics {
    projectsCount: number;
    articlesCount: number;
    totalViews: number;
    clientsCount: number;
}

export class StatisticsService {
    static async getHeroStatistics(): Promise<HeroStatistics> {
        try {
            const client = supabaseService.getClient();
            const [projectsResult, articlesResult, pageViewsResult, clientsResult] = await Promise.all([
                client
                    .from('projects')
                    .select('id', { count: 'exact', head: true })
                    .eq('published', true),
                
                client
                    .from('articles')
                    .select('id', { count: 'exact', head: true })
                    .eq('published', true),
                
                client
                    .from('page_views')
                    .select('id', { count: 'exact', head: true }),
                
                client
                    .from('projects')
                    .select('client_name')
                    .not('client_name', 'is', null)
                    .eq('published', true)
            ]);

            return {
                projectsCount: projectsResult.count || 0,
                articlesCount: articlesResult.count || 0,
                totalViews: pageViewsResult.count || 0,
                clientsCount: clientsResult.data ? new Set(clientsResult.data.map(p => p.client_name)).size : 0
            };
        } catch (error) {
            console.error('Error fetching statistics:', error);
            return {
                projectsCount: 0,
                articlesCount: 0,
                totalViews: 0,
                clientsCount: 0
            };
        }
    }
}