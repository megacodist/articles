import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import matter from "gray-matter";


export const metadata = {
  title: "Software License",
};

export default async function LicensePage() {
  const filePath = path.join(process.cwd(), "LICENSE");
  let mkContent: string;

  try {
    const fileRaw = await fs.promises.readFile(filePath, "utf8");
    // Read MD content, ignore front matter
    ({ content: mkContent } = matter(fileRaw));
  } catch (error) {
    return notFound();
  }

  return (
    <div>
      {/* 
          'prose' class automagically styles headings, lists, and paragraphs.
          'prose-stone' gives it a neutral gray look.
          'dark:prose-invert' ensures it looks good in dark mode.
        */}
      <article className="prose prose-stone dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            // Override the 'img' tag
            // 3. Override the Image to make it inline and icon-sized
            img: ({ node, ...props }) => {
              // If it is an SVG, use CSS Mask to make it take the background color
              if (typeof props.src === "string" && props.src.endsWith(".svg")) {
                return (
                  <span
                    className="inline-block h-6 w-6 align-middle mx-1 bg-current"
                    style={{
                      maskImage: `url(${props.src})`,
                      maskRepeat: "no-repeat",
                      maskSize: "contain",
                      maskPosition: "center",
                      WebkitMaskImage: `url(${props.src})`, // Safari support
                      WebkitMaskRepeat: "no-repeat",
                      WebkitMaskSize: "contain",
                      WebkitMaskPosition: "center",
                    }}
                    role="img"
                    aria-label={props.alt}
                  />
                );
              }

              // Normal render for PNG/JPG
              return <img {...props} className="..." />;
            },
          }}
        >
          {mkContent}
        </ReactMarkdown>
      </article>
    </div>
  );
}