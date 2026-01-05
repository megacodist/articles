
import { type BranchNode, type LeafNode } from '@/types/m3a-sidebar';

/** The topic node with the injected meaning of article front matter. */
export type TopicNode = BranchNode<ArticleFrontMatter>;

/** The article node with the injected meaning of article front matter. */
export type ArticleNode = LeafNode<ArticleFrontMatter>;

/**
 * The ultimate base type definition for all Table of Contents (ToC) nodes.
 */
export type TocNode = TopicNode | ArticleNode;

/**
 * The strict schema for articles Front Matter.
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
