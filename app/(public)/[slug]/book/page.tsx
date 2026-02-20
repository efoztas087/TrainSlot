import { notFound } from "next/navigation";
import { BookingStepper } from "@/components/booking/booking-stepper";
import { getPublicCoachPage } from "@/server/repositories/public-repo";

export default async function BookPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: { service?: string };
}) {
  const data = await getPublicCoachPage(params.slug);

  if (!data) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <h1 className="text-2xl font-semibold">Book with {data.coach.display_name}</h1>
      <BookingStepper slug={params.slug} services={data.services} initialServiceId={searchParams.service} />
    </main>
  );
}
