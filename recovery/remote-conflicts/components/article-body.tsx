import type { ArticleBlock } from "@/lib/docs/content";

/** Renders the hand-authored documentation blocks in the editorial type roles. */
export function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return (
              <p key={i} className="text-pretty leading-relaxed text-secondary">
                {block.text}
              </p>
            );
          case "list":
            return (
              <ul key={i} className="flex flex-col gap-2">
                {block.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-pretty leading-relaxed text-secondary"
                  >
                    <span aria-hidden="true" className="font-mono text-xs text-mint">
                      ·
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          case "code":
            return (
              <figure key={i} className="border border-border bg-surface/60">
                <pre
                  tabIndex={0}
                  className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed"
                >
                  <code>{block.code}</code>
                </pre>
                <figcaption className="border-t border-border px-4 py-2 font-mono text-[11px] text-secondary">
                  {block.source}
                </figcaption>
              </figure>
            );
          case "callout": {
            const tone = {
              info: "border-info text-info",
              warning: "border-warning text-warning",
              danger: "border-danger text-danger",
            }[block.tone];
            return (
              <aside
                key={i}
                className={`border-s-2 bg-surface/60 px-4 py-3 text-pretty leading-relaxed ${tone}`}
              >
                <span className="me-2 font-mono text-[11px] uppercase">{block.tone}</span>
                <span className="text-secondary">{block.text}</span>
              </aside>
            );
          }
          case "table":
            return (
              <div key={i} tabIndex={0} className="overflow-x-auto border border-border">
                <table className="w-full border-collapse text-start">
                  <thead>
                    <tr className="border-b border-border font-mono text-[11px] text-secondary">
                      <th scope="col" className="px-4 py-3 text-start">
                        {block.head[0]}
                      </th>
                      <th scope="col" className="px-4 py-3 text-start">
                        {block.head[1]}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row) => (
                      <tr key={row[0]} className="border-b border-border last:border-b-0">
                        <td className="px-4 py-3 text-sm text-secondary">{row[0]}</td>
                        <td className="px-4 py-3 font-mono text-xs" dir="ltr">
                          {row[1]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}
