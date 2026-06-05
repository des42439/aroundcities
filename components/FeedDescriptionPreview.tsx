"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";

type Props = {
  href: string;
  text: string;
};

const ELLIPSIS = "...";

export default function FeedDescriptionPreview({ href, text }: Props) {
  const previewRef = useRef<HTMLParagraphElement>(null);
  const [previewText, setPreviewText] = useState(text);
  const [isTruncated, setIsTruncated] = useState(false);

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

      link.textContent = " See more";
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

  return (
    <p
      ref={previewRef}
      className="max-h-[3rem] overflow-hidden text-[15px] leading-6 text-neutral-300 sm:text-base"
    >
      <span>{previewText}</span>
      {isTruncated && (
        <Link href={href} className="text-neutral-500 hover:text-neutral-200">
          {" "}
          See more
        </Link>
      )}
    </p>
  );
}
