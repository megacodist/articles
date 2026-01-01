import path from 'path';

/**
 * Megacodist Configuration.
 * Centralizes all settings dictated by Megacodist for this project.
 */
export const m3Config = {
  /** Configurations for articles in the sidebar. */
  articles: {
    /** 
     * The file system path where articles are stored. 
     * Relative to project root.
     */
    dir: 'articles',

    /** 
     * The output destination for the generated JSON data.
     * Relative to project root.
     */
    output: 'src/features/docs-sidebar/data.json',

    /**
     * Folder Sorting Strategy.
     * Define the explicit order of branch nodes. 
     * Folders not listed here will be sorted alphabetically after these.
     * 
     * Key: Exact folder name.
     * Value: Priority index (1 is highest/top).
     */
    folderPriority: {
      'JavaScript': 1,
      'React': 2,
      'Git': 3,
      'CSS': 4,
    } as Record<string, number>,

    /** Ignore empty branches in the sidebar. */
    ignoreEmptyBranches: true,

    /**
     * Validation Flags.
     */
    validation: {
      /** Report if the filename does not match the frontmatter slug. */
      checkSlugNameMismatch: true,
      /** Report if required frontmatter fields are missing. */
      checkMissingRequiredFields: true,
    }
  }
};
