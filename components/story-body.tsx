interface StoryBodyProps {
  body: string;
}

export function StoryBody({ body }: StoryBodyProps) {
  // Parse the body which may contain **Question?**\nAnswer blocks
  const sections = body.split(/\n\n/).filter(Boolean);

  return (
    <div className="space-y-8">
      {sections.map((section, i) => {
        // Check if section starts with a bold question: **...**
        const match = section.match(/^\*\*(.+?)\*\*\n?([\s\S]*)$/);

        if (match) {
          const question = match[1];
          const answer = match[2].trim();
          return (
            <div key={i} className="border-l-2 nh-border-light pl-5">
              <p className="text-sm italic nh-text mb-3">
                {question}
              </p>
              <div className="text-lg leading-relaxed">
                {answer.split("\n").map((line, j) => (
                  <p key={j} className={j > 0 ? "mt-3" : undefined}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          );
        }

        // Plain paragraph
        return (
          <div key={i} className="text-lg leading-relaxed">
            {section.split("\n").map((line, j) => (
              <p key={j} className={j > 0 ? "mt-3" : undefined}>
                {line}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}
