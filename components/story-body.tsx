interface StoryBodyProps {
  body: string;
}

export function StoryBody({ body }: StoryBodyProps) {
  // Parse the body which may contain **Question?**\nAnswer blocks
  const sections = body.split(/\n\n/).filter(Boolean);

  return (
    <div className="space-y-6">
      {sections.map((section, i) => {
        // Check if section starts with a bold question: **...**
        const match = section.match(/^\*\*(.+?)\*\*\n?([\s\S]*)$/);

        if (match) {
          const question = match[1];
          const answer = match[2].trim();
          return (
            <div key={i} className="space-y-2">
              <h3 className="text-sm font-semibold text-amber-800 uppercase tracking-wide">
                {question}
              </h3>
              <div className="text-base leading-relaxed">
                {answer.split("\n").map((line, j) => (
                  <p key={j} className={j > 0 ? "mt-2" : undefined}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          );
        }

        // Plain paragraph
        return (
          <div key={i} className="text-base leading-relaxed">
            {section.split("\n").map((line, j) => (
              <p key={j} className={j > 0 ? "mt-2" : undefined}>
                {line}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}
