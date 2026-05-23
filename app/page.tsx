import { supabase } from '@/lib/supabase';
import EventCard from '@/components/EventCard';
import GreetingBanner from '@/components/GreetingBanner';

export default async function HomePage() {

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('start_time', { ascending: true });

  return (
    <main className="max-w-3xl mx-auto p-6">

      <h1 className="text-5xl font-bold mb-8">
        Kuching Happenings
      </h1>

      <div className="space-y-4">
        {events?.map((event) => (
          <EventCard
            key={event.id}
            event={event}
          />
        ))}
      </div>

    </main>
  );
}