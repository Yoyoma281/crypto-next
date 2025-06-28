// components/NewsCard.tsx
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type NewsCardProps = {
  title: string;
  description: string;
  url: string;
  image: string;
  source: string;
  publishedAt: string;
};

export default function NewsCard({
  title,
  description,
  url,
  image,
  source,
  publishedAt,
}: NewsCardProps) {
  return (
    <Card className="max-w-md overflow-hidden rounded-2xl shadow-lg">
      <CardHeader className="p-0">
        <Image
          src={image}
          alt={title}
          width={400}
          height={200}
          className="w-full h-12 object-cover"
        />
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="flex flex-col gap-1">
          <Badge variant="secondary">{source}</Badge>
          <span className="text-xs text-muted-foreground">{new Date(publishedAt).toLocaleString()}</span>
        </div>
        <Button asChild size="sm" variant="outline">
          <a href={url} target="_blank" rel="noopener noreferrer">
            Read More
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
