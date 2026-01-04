import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { m3Config } from '../../../m3.config';
import type { ArticleFrontMatter } from '@/types/article-metadata';
import {
  type BranchNode as SidebarBranchNode,
  type LeafNode as SidebarLeafNode,
} from '@/types/m3a-sidebar';
import { slugify } from '../../utils/slugify';

// ===========================================================================
// Types & Interfaces
// ===========================================================================

/** The brand-new branch node with injected meaning of article front matter. */
type BranchNode = SidebarBranchNode<ArticleFrontMatter>;

/** The brand-new leaf node with injected meaning of article front matter. */
type LeafNode = SidebarLeafNode<ArticleFrontMatter>;

/**
 * Type definition for the Sidebar Node.
 * Used by the UI components to render the tree.
 */
export type SidebarNode = BranchNode | LeafNode;

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
   * If the article parsed as a Markdown successfully, this will be `null`.
   * Otherwise, it will contain the error message.
   */
  badMarkdown: string | null;
}

/**
 * Accumulator for all warnings found during the scan.
 * Key: File path relative to articles directory.
 */
const warnings: Record<string, ArticleWarning> = {};

/** List of ignored items (files/directories). */
const ignoredItems: string[] = [];

/**
 * Scan statistics.
 */
const stats = {
  /** Total number of items processed */
  nTotal: 0,

  /** Number of articles found */
  nArticles: 0,
};

/** The root directory of the project. */
const projectRoot = process.cwd();

/** Messages in this module. */
const messages = {
  /** Message for the start of the scan. */
  SCANNING_ARTICLES: '🏗️  Megacodist articles: Scanning...',
  /** The heading of the report. */
  RPT_HEADING: '📊 Statistics',
  /** Report item for duration and total scanned items. */
  RPT_TOTAL_DUR: (total: number, duration: string) =>
    `Scanned ${total} items in ${duration}ms` as const,
  /** Report item for the number of articles found. */
  RPT_N_ARTICLES: (count: number) => `Found ${count} articles.` as const,
  /** Report item for the number of ignored items. */
  RPT_N_ITEMS_SKIPPED: (count: number) =>
    `Skipped ${count} items.` as const,
  /** Report item for ignorence of system item. */
  RPT_SYS_ITEM_IGNORED: (path: string) =>
    `Ignored file system item: ${path}` as const,
  RPT_UNKNOWN_FS_ITEM: (path: string) =>
    `Unknown file system item: ${path}` as const,
  RPT_BAD_ARTICLE_FRMT: (path: string) => 
    `Unsupported article format: ${path}` as const,
  RPT_ARTICLES_WARNINGS: 'Some articles have warnings:',
  RPT_MISSING_REQUIRED_FIELDS: (fields: string[]) =>
    `   └─ Missing metadata fields: ${fields.join(', ')}` as const,
  RPT_INVALID_MARKDOWN: (error: string) =>
    `   └─ Invalid Markdown: ${error}` as const,
  RPT_SLUG_MISMATCH: (slug: string) =>
    `   └─ Slug Mismatch: '${slug}' (Expected filename match)` as const,
};

// ===========================================================================
// Core Logic
// ===========================================================================

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
    stats.nTotal++;
    const fullPath = path.join(dirPath, entry.name);
    
    // 1. IGNORE: System files, underscores, and dots.
    if (entry.name.startsWith('.') || entry.name.startsWith('_') ||
    entry.name === 'node_modules') {
      ignoredItems.push(messages.RPT_SYS_ITEM_IGNORED(fullPath));
      continue;
    }

    // 2. PROCESS: Branch (Directory)
    if (entry.isDirectory()) {
      const children = await scanDirectory(fullPath);
      
      // Ignore empty branches if configured
      if (children.length > 0 || !m3Config.sidebar.ignoreEmptyBranches) {
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
    if (entry.isFile()) {
      if (/\.(md|mdx)$/.test(entry.name)) {
        // Process Markdown document
        const node = await processLeaf(fullPath, entry.name);
        if (node) {
          nodes.push(node);
          stats.nArticles++;
        }
      } else {
        // Unsupported article found
        ignoredItems.push(messages.RPT_BAD_ARTICLE_FRMT(fullPath));
      }
    } else {
      // Unknown file system item found
      ignoredItems.push(messages.RPT_UNKNOWN_FS_ITEM(fullPath));
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
  const articleWarnings: ArticleWarning = {
    missingFields: [],
    slugMismatch: null,
    badMarkdown: null,
  };
  /** Specifies whether any error found. */
  let errorFound = false;
  /** Relative path of this article from articles directory. */
  const relativePath = path.relative(
    path.join(projectRoot, m3Config.articles.dir),
    fullPath
  );

  // Read the front matter ------------------------
  /** Unformatted (raw) front matter of the article. */
  let rawFM: object;
  try {
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    ({ data: rawFM } = matter(fileContent));
  } catch (e: any) {
    articleWarnings.badMarkdown = e.message;
    warnings[relativePath] = articleWarnings;
    return null;
  }
  const filenameNoExt = filename.replace(/\.(md|mdx)$/, '');

  // Check Required Fields ---------------------
  /** Formatted (structured) front matter of the article. */
  let fm = rawFM as Partial<ArticleFrontMatter>;
  if (m3Config.articles.scan.reportMissingMetadata) {
    m3Config.articles.requiredMetadata.forEach(
      field => {
        const value = fm[field as keyof ArticleFrontMatter];
        if (value == null || value === "") {
          articleWarnings.missingFields.push(field);
          errorFound = true;
        }
      }
    );
  }

  // Check Slug Mismatch
  if (m3Config.articles.scan.reportSlugNameMismatch) {
    if (fm.slug && fm.slug !== filenameNoExt) {
      articleWarnings.slugMismatch = fm.slug;
      errorFound = true;
    }
  }

  // Register Warnings if any exist
  if (errorFound) {
    warnings[relativePath] = articleWarnings;
  }

  // Should we return the node even if it has warnings? 
  // Strategy: Yes, unless critical fields (like slug) are missing
  // preventing ID generation.
  if (!fm.slug || !fm.title) {
    return null; 
  }

  return {
    type: 'leaf',
    id: fm.slug,
    name: fm.title,
    content: fm as ArticleFrontMatter,
  };
}

/**
 * Sorts nodes based on the strategy defined in `m3.config`.
 * 
 * 1. Branches: Priority Config -> Alphabetical.
 * 2. Leaves: Weight (Ascending) -> Date (Descending).
 */
function sortNodes(nodes: SidebarNode[]): SidebarNode[] {
  const branches = nodes.filter((n): n is BranchNode => n.type === 'branch');
  const leaves = nodes.filter((n): n is LeafNode => n.type === 'leaf');

  // Sort Branches
  branches.sort((a, b) => {
    const priorityA = m3Config.sidebar.folderPriority[a.name] ?? Infinity;
    const priorityB = m3Config.sidebar.folderPriority[b.name] ?? Infinity;
    
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
  // Prompt the start of the scan
  console.log(messages.SCANNING_ARTICLES);
  
  /** The starting time of scanning for articles. */
  const tmStart = performance.now();
  /** The absolute path of the articles folder. */
  const articlesDir = path.join(projectRoot, m3Config.articles.dir);
  /** The absolute path of the output JSON. */
  const outputFile = path.join(projectRoot, m3Config.articles.output);

  try {
    const rawNodes = await scanDirectory(articlesDir);
    const sortedNodes = sortNodes(rawNodes);
    // Write Output
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.writeFile(outputFile, JSON.stringify(sortedNodes, null, 2));

    /** The finish time of scanning for articles. */
    const tmEnd = performance.now();
    
    // Summary
    console.log('-'.repeat(20));
    console.log(messages.RPT_HEADING);
    console.log(messages.RPT_TOTAL_DUR(stats.nTotal, (tmEnd - tmStart).toFixed(2)));
    console.log(messages.RPT_N_ARTICLES(stats.nArticles));
    // Report ignored items
    console.log(messages.RPT_N_ITEMS_SKIPPED(ignoredItems.length));
    ignoredItems.forEach(item => console.log(`   └─ ${item}`));
    // Report articles warnings
    const articles = Object.keys(warnings);
    if (articles.length > 0) {
      console.log(messages.RPT_ARTICLES_WARNINGS);      
      articles.forEach((file: string, idx: number) => {
        const w = warnings[file];
        console.log(`📄 ${idx + 1} ${file}`);
        if (w.missingFields.length) {
          console.log(messages.RPT_MISSING_REQUIRED_FIELDS(w.missingFields));
        }
        if (w.badMarkdown) {
          console.log(messages.RPT_INVALID_MARKDOWN(w.badMarkdown));
        }
        if (w.slugMismatch) {
          console.log(messages.RPT_SLUG_MISMATCH(w.slugMismatch));
        }
      });
    }
    // End the report
    console.log('─'.repeat(50) + '\n');

  } catch (error) {
    console.error('💥 Fatal Error:', error);
    process.exit(1);
  }
}

main();
