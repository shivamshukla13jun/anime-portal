import axios from 'axios';

interface AniListMedia {
  id: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  description?: string;
  coverImage: {
    large: string;
    medium: string;
  };
  genres: string[];
  averageScore?: number;
  popularity: number;
  startDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  type: 'ANIME' | 'MANGA';
}

interface AniListResponse {
  data: {
    Page: {
      media: AniListMedia[];
    };
  };
}

export class AniListService {
  private readonly apiUrl = 'https://graphql.anilist.co';

  private async queryAniList(query: string, variables: any = {}): Promise<any> {
    try {
      const response = await axios.post(this.apiUrl, {
        query,
        variables,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.data.errors) {
        throw new Error(`AniList API Error: ${JSON.stringify(response.data.errors)}`);
      }

      return response.data;
    } catch (error) {
      console.error('AniList API request failed:', error);
      throw error;
    }
  }

  async getTrendingAnime(limit: number = 50): Promise<AniListMedia[]> {
    const query = `
      query ($limit: Int) {
        Page(page: 1, perPage: $limit) {
          media(type: ANIME, sort: TRENDING_DESC) {
            id
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              medium
            }
            genres
            averageScore
            popularity
            startDate {
              year
              month
              day
            }
          }
        }
      }
    `;

    const response: AniListResponse = await this.queryAniList(query, { limit });
    return response.data.Page.media;
  }

  async getTrendingManga(limit: number = 50): Promise<AniListMedia[]> {
    const query = `
      query ($limit: Int) {
        Page(page: 1, perPage: $limit) {
          media(type: MANGA, sort: TRENDING_DESC) {
            id
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              medium
            }
            genres
            averageScore
            popularity
            startDate {
              year
              month
              day
            }
          }
        }
      }
    `;

    const response: AniListResponse = await this.queryAniList(query, { limit });
    return response.data.Page.media;
  }

  async getAnimeByGenre(genre: string, limit: number = 20): Promise<AniListMedia[]> {
    const query = `
      query ($genre: String, $limit: Int) {
        Page(page: 1, perPage: $limit) {
          media(type: ANIME, genre: $genre, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              medium
            }
            genres
            averageScore
            popularity
            startDate {
              year
              month
              day
            }
          }
        }
      }
    `;

    const response: AniListResponse = await this.queryAniList(query, { genre, limit });
    return response.data.Page.media;
  }

  async getMangaByGenre(genre: string, limit: number = 20): Promise<AniListMedia[]> {
    const query = `
      query ($genre: String, $limit: Int) {
        Page(page: 1, perPage: $limit) {
          media(type: MANGA, genre: $genre, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              medium
            }
            genres
            averageScore
            popularity
            startDate {
              year
              month
              day
            }
          }
        }
      }
    `;

    const response: AniListResponse = await this.queryAniList(query, { genre, limit });
    return response.data.Page.media;
  }

  async getMediaById(id: number): Promise<AniListMedia | null> {
    const query = `
      query ($id: Int) {
        Media(id: $id) {
          id
          title {
            romaji
            english
            native
          }
          description
          coverImage {
            large
            medium
          }
          genres
          averageScore
          popularity
          startDate {
            year
            month
            day
          }
          type
        }
      }
    `;

    try {
      const response = await this.queryAniList(query, { id });
      return response.data.Media;
    } catch (error) {
      console.error(`Failed to fetch media with ID ${id}:`, error);
      return null;
    }
  }

  async searchMedia(searchTerm: string, type?: 'ANIME' | 'MANGA', limit: number = 20): Promise<AniListMedia[]> {
    const query = `
      query ($search: String, $type: MediaType, $limit: Int) {
        Page(page: 1, perPage: $limit) {
          media(search: $search, type: $type, sort: SEARCH_MATCH) {
            id
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              medium
            }
            genres
            averageScore
            popularity
            startDate {
              year
              month
              day
            }
            type
          }
        }
      }
    `;

    const response: AniListResponse = await this.queryAniList(query, { 
      search: searchTerm, 
      type, 
      limit 
    });
    return response.data.Page.media;
  }
}
