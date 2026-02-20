import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPublicCoachPage } from "@/server/repositories/public-repo";

export default async function PublicCoachPage({ params }: { params: { slug: string } }) {
  const data = await getPublicCoachPage(params.slug);

  if (!data) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <Card>
        <h1 className="text-2xl font-semibold">{data.coach.display_name}</h1>
        <p className="text-sm text-slate-600">{data.coach.description || "Book your next training session."}</p>
        {data.coach.location && <p className="mt-2 text-sm text-slate-500">{data.coach.location}</p>}
      </Card>

      <div className="space-y-3">
        {data.services.map((service) => (
          <Card key={service.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{service.name}</p>
              <p className="text-sm text-slate-600">{service.duration_minutes} min · {service.credits_cost} credit(s)</p>
            </div>
            <Link href={`/${params.slug}/book?service=${service.id}`}>
              <Button>Book</Button>
            </Link>
          </Card>
        ))}
      </div>
    </main>
  );
}
