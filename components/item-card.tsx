import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Item } from "@/types"

interface ItemCardProps {
  item: Item
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{item.title}</CardTitle>
          <Badge variant={item.available ? "default" : "secondary"}>
            {item.available ? "Available" : "Unavailable"}
          </Badge>
        </div>
        <CardDescription>Listed by {item.ownerName}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="line-clamp-3">{item.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm capitalize">{item.category}</span>
          <span className="font-medium">${item.price.toFixed(2)}/day</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/items/${item.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
