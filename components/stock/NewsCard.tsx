import { formatDistanceToNow } from "date-fns";
import { ExternalLink } from "lucide-react";

interface NewsCardProps {
  headline: string;
  summary?: string;
  source: string;
  url: string;
  image?: string;
  datetime: number;
}

export function NewsCard({ headline, summary, source, url, image, datetime }: NewsCardProps) {
  const timeAgo = formatDistanceToNow(new Date(datetime * 1000), { addSuffix: true });

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
    >
      {image && (
        <img
          src={image}
          alt=""
          className="h-16 w-24 shrink-0 rounded-md object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 dark:text-white">
          {headline}
          <ExternalLink className="ml-1 inline h-3 w-3 shrink-0 text-gray-400" />
        </p>
        {summary && <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{summary}</p>}
        <p className="mt-1 text-xs text-gray-400">
          {source} · {timeAgo}
        </p>
      </div>
    </a>
  );
}
