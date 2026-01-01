import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { m3Config } from '../../../m3.config';
import type { ArticleFrontMatter } from '@/types/article-metadata';

// ===========================================================================
// Types & Interfaces
// ===========================================================================

/**
 * Type definition for the Sidebar Node.
 * Used by the UI components to render the tree.
 */
export type SidebarNode = BranchNode | LeafNode;

interface BaseNode {
  /** Unique identifier (Folder name or Article Slug). */
  id: string;
  /** Display label. */
  name: string;
}

/** 
 * A Container Node (Folder). 
 */
export interface BranchNode extends BaseNode {
  type: 'branch';
  children: SidebarNode[];
}

/** 
 * A Content Node (File/Article). 
 */
export interface LeafNode extends BaseNode {
  type: 'leaf';
  content: ArticleFrontMatter;
}

/**
 * Structured warning object for a specific file.
 */
interface ArticleWarning {
  /** List of field names that are missing from Front Matter. */
  missingFields: string[];
  
  /** 
   * If string: The actual slug found in Front Matter (mismatch).
   * If null: No mismatch detected.
   */
  slugMismatch: string | null;

  /**
   * If the article parsed as a Markdown successfully, this will be null.
   * Otherwise, it will contain the error message.
   */
  badMarkdown: string | null;
}

/**
 * Accumulator for all warnings found during the scan.
 * Key: File path relative to articles directory.
 */
const warnings: Record<string, ArticleWarning> = {};

/**
 * Runtime statistics.
 */
const stats = {
  processed: 0,
  systemSkipped: 0,
};

// ===========================================================================
// Core Logic
// ===========================================================================

/**
 * Creates a URL-friendly slug from a string.
 * @param text The string to slugify.
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
}

/**
 * Recursively scans a directory to build the Sidebar tree.
 * 
 * @param dirPath - The absolute path to the current directory.
 * @returns A promise resolving to a sorted list of SidebarNodes.
 */
async function scanDirectory(dirPath: string): Promise<SidebarNode[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const nodes: SidebarNode[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    // 1. IGNORE: System files, underscores, and dots.
    if (entry.name.startsWith('.') || entry.name.startsWith('_') ||
    entry.name === 'node_modules') {
      stats.systemSkipped++;
      continue;
    }

    // 2. PROCESS: Branch (Directory)
    if (entry.isDirectory()) {
      const children = await scanDirectory(fullPath);
      
      // Ignore empty branches if configured
      if (children.length > 0 || !m3Config.articles.ignoreEmptyBranches) {
        nodes.push({
          type: 'branch',
          id: slugify(entry.name),
          name: entry.name, // In future, could read a _meta.json for display name
          children: sortNodes(children),
        } as BranchNode);
      }
      continue;
    }

    // 3. PROCESS: Leaf (only Markdown File)
    const isMarkdown = /\.(md|mdx)$/.test(entry.name);
    if (entry.isFile() && isMarkdown) {
      const node = await processLeaf(fullPath, entry.name);
      if (node) {
        nodes.push(node);
        stats.processed++;
      }
    }
  }

  return nodes;
}

/**
 * Parses a single Markdown file, validates it, and returns a LeafNode.
 * Populates the `warnings` object if issues are found.
 * 
 * @param fullPath - Absolute path to the file.
 * @param filename - Filename including extension.
 */
async function processLeaf(
  fullPath: string,
  filename: string
): Promise<LeafNode | null> {
  /** Holds possible errors associated with this article */
  const currentWarnings: ArticleWarning = {
    missingFields: [],
    slugMismatch: null,
    badMarkdown: null,
  };
  /** Specifies whether any error found. */
  let hasError = false;
  const relativePath = path.relative(path.join(process.cwd(), m3Config.articles.dir), fullPath);

  // Read the front matter
  let frontMatter: Partial<ArticleFrontMatter> = {};
  try {
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    const { data } = matter(fileContent);
  } catch (e: any) {
    currentWarnings.badMarkdown = e.message;
    warnings[relativePath] = currentWarnings;
    return null;
  }
  const filenameNoExt = filename.replace(/\.(md|mdx)$/, '');

  // Check Required Fields
  frontMatter = data as Partial<ArticleFrontMatter>;
  if (m3Config.articles.validation.checkMissingRequiredFields) {
    const required: (keyof ArticleFrontMatter)[] = ['slug', 'title', 'authors', 'created_on', 'status'];
    required.forEach(field => {
      if (!frontMatter[field]) currentWarnings.missingFields.push(field);
    });
  }

  // Check Slug Mismatch
  if (m3Config.articles.validation.checkSlugNameMismatch) {
    if (frontMatter.slug && frontMatter.slug !== filenameNoExt) {
      currentWarnings.slugMismatch = frontMatter.slug;
    }
  }

  // Register Warnings if any exist
  if (currentWarnings.missingFields.length > 0 || currentWarnings.slugMismatch !== null) {
    warnings[relativePath] = currentWarnings;
  }

  // Should we return the node even if it has warnings? 
  // Strategy: Yes, unless critical fields (like slug) are missing preventing ID generation.
  if (!frontMatter.slug || !frontMatter.title) {
    return null; 
  }

  return {
    type: 'leaf',
    id: frontMatter.slug,
    name: frontMatter.title,
    content: frontMatter as ArticleFrontMatter,
  };
}

/**
 * Sorts nodes based on the strategy defined in m3.config.
 * 
 * 1. Branches: Priority Config -> Alphabetical.
 * 2. Leaves: Weight (Ascending) -> Date (Descending).
 */
function sortNodes(nodes: SidebarNode[]): SidebarNode[] {
  const branches = nodes.filter((n): n is BranchNode => n.type === 'branch');
  const leaves = nodes.filter((n): n is LeafNode => n.type === 'leaf');

  // Sort Branches
  branches.sort((a, b) => {
    const priorityA = m3Config.articles.folderPriority[a.name] ?? 999;
    const priorityB = m3Config.articles.folderPriority[b.name] ?? 999;
    
    if (priorityA !== priorityB) return priorityA - priorityB;
    return a.name.localeCompare(b.name);
  });

  // Sort Leaves
  leaves.sort((a, b) => {
    const weightA = a.content.weight ?? Infinity;
    const weightB = b.content.weight ?? Infinity;

    // Weight wins
    if (weightA !== weightB) return weightA - weightB;

    // Tie-breaker: Date (Newest first)
    const dateA = new Date(a.content.created_on).getTime();
    const dateB = new Date(b.content.created_on).getTime();
    return dateB - dateA;
  });

  return [...branches, ...leaves];
}

// ===========================================================================
// Execution
// ===========================================================================

async function main() {
  console.log('🏗️  M3 Content Engine: Scanning...');
  const start = performance.now();

  const sourceDir = path.join(process.cwd(), m3Config.articles.dir);
  const outputFile = path.join(process.cwd(), m3Config.articles.output);

  try {
    const rawNodes = await scanDirectory(sourceDir);
    const sortedNodes = sortNodes(rawNodes);

    // Write Output
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, JSON.stringify(sortedNodes, null, 2));

    const end = performance.now();
    
    // Summary
    console.log(`✅ Generated sidebar in ${(end - start).toFixed(2)}ms`);
    console.log(`📊 Stats: ${stats.processed} articles.`);

    // Warning Report
    const warningKeys = Object.keys(warnings);
    if (warningKeys.length > 0) {
      console.log('\n' + '─'.repeat(50));
      console.log('⚠️  VALIDATION REPORT');
      console.log('─'.repeat(50));
      
      warningKeys.forEach(file => {
        const w = warnings[file];
        console.log(`📄 ${file}`);
        if (w.missingFields.length) console.log(`   └─ Missing: ${w.missingFields.join(', ')}`);
        if (w.badMarkdown) console.log(`   └─ Invalid Markdown: ${w.badMarkdown}`);
        if (w.slugMismatch) console.log(`   └─ Slug Mismatch: '${w.slugMismatch}' (Expected filename match)`);
      });
      console.log('─'.repeat(50) + '\n');
    }

  } catch (error) {
    console.error('💥 Fatal Error:', error);
    process.exit(1);
  }
}

main();