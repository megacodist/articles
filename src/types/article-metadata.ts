/**
 * The strict schema for Markdown Front Matter.
 */
export interface ArticleFrontMatter {
  slug: string;
  title: string;
  authors: string[];
  created_on: string; // ISO 8601
  status: 'wip' | 'draft' | 'published';
  tags?: string[];
  weight?: number;
}