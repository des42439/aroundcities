"use client";

type Props = {
  title: string;
};

export default function ShareButton({
  title,
}: Props) {
  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          url: window.location.href,
        });

        return;
      }

      await navigator.clipboard.writeText(
        window.location.href
      );

      alert(
        "Link copied to clipboard."
      );
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="rounded-lg bg-green-600 px-4 py-2 hover:bg-green-500"
    >
      Share
    </button>
  );
}