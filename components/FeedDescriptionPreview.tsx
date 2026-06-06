"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { TrackedFeedLink } from "./TrackedLinks";

type Props = {
  feedId?: string;
  href: string;
  text: string;
};

const ELLIPSIS = "...";

export default function FeedDescriptionPreview({
  feedId,
  href,
  text,
}: Props) {
  const previewRef = useRef<HTMLParagraphElement>(null);
  const [previewText, setPreviewText] = useState(text);
  const [isTruncated, setIsTruncated] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useLayoutEffect(() => {
    const paragraph = previewRef.current;

    if (!paragraph) {
      return;
    }

    const measure = () => {
      const normalizedText = text.trim();
      const width = paragraph.getBoundingClientRect().width;

      if (width <= 0) {
        return;
      }

      const style = window.getComputedStyle(paragraph);
      const lineHeight = Number.parseFloat(style.lineHeight) || 24;
      const maxHeight = lineHeight * 2 + 1;
      const measurer = document.createElement("p");

      measurer.className = paragraph.className;
      measurer.style.position = "fixed";
      measurer.style.left = "-9999px";
      measurer.style.top = "0";
      measurer.style.width = `${width}px`;
      measurer.style.visibility = "hidden";
      measurer.style.pointerEvents = "none";

      const textNode = document.createElement("span");
      const link = document.createElement("a");

      link.textContent = " more";
      measurer.append(textNode);
      document.body.append(measurer);

      textNode.textContent = normalizedText;

      if (measurer.scrollHeight <= maxHeight) {
        document.body.removeChild(measurer);
        setPreviewText(normalizedText);
        setIsTruncated(false);
        return;
      }

      measurer.append(link);

      let low = 0;
      let high = normalizedText.length;
      let best = 0;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        textNode.textContent = `${normalizedText.slice(0, mid).trimEnd()}${ELLIPSIS}`;

        if (measurer.scrollHeight <= maxHeight) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      document.body.removeChild(measurer);
      setPreviewText(`${normalizedText.slice(0, best).trimEnd()}${ELLIPSIS}`);
      setIsTruncated(true);
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(paragraph);

    return () => {
      resizeObserver.disconnect();
    };
  }, [text]);

  if (expanded) {
    return (
      <div className="space-y-1.5">
        <p className="whitespace-pre-wrap text-sm leading-5 text-neutral-300 sm:text-[15px]">
          {text.trim()}
        </p>
        {feedId ? (
          <TrackedFeedLink
            href={href}
            feedId={feedId}
            className="inline-flex text-sm text-neutral-500 hover:text-neutral-200"
          >
            More details
          </TrackedFeedLink>
        ) : (
          <a
            href={href}
            className="inline-flex text-sm text-neutral-500 hover:text-neutral-200"
          >
            More details
          </a>
        )}
      </div>
    );
  }

  return (
    <p
      ref={previewRef}
      className="max-h-10 overflow-hidden text-sm leading-5 text-neutral-300 sm:text-[15px]"
    >
      <span>{previewText}</span>
      {isTruncated && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-neutral-500 hover:text-neutral-200"
        >
          {" "}
          more
        </button>
      )}
    </p>
  );
}
