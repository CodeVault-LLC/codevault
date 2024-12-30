import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

export default function FeaturedNews() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold">Featured News</h2>
        <Link
          href="/news"
          className="text-lg font-medium hover:underline flex items-center gap-2"
        >
          More NASA News
          <Badge variant="secondary" className="rounded-full">
            2
          </Badge>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Featured Article */}
        <Card className="lg:col-span-6 overflow-hidden">
          <Link href="/news/administrator-tribute" className="group">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src="/placeholder.svg?height=600&width=800"
                alt="NASA Administrator with President Carter"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 p-6">
                <Badge className="mb-2">NEWS RELEASE</Badge>
                <h3 className="text-2xl font-bold text-white mb-2">
                  NASA Administrator Pays Tribute to President Carter
                </h3>
                <p className="text-white/90">2 MIN READ</p>
              </div>
            </div>
          </Link>
        </Card>

        {/* Middle Featured Article */}
        <Card className="lg:col-span-3 overflow-hidden">
          <Link href="/news/webb-asteroids" className="group">
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src="/placeholder.svg?height=800&width=600"
                alt="Asteroid visualization"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 p-4">
                <Badge className="mb-2">ARTICLE</Badge>
                <h3 className="text-xl font-bold text-white mb-2">
                  NASA's Webb Reveals Smallest Asteroids Yet Found in Main
                  Asteroid Belt
                </h3>
                <p className="text-white/90">3 MIN READ</p>
              </div>
            </div>
          </Link>
        </Card>

        {/* Right Column Articles */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="overflow-hidden">
            <Link href="/news/deep-space-network" className="group">
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Deep Space Network Antenna"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 p-4">
                  <Badge className="mb-2">ARTICLE</Badge>
                  <h3 className="text-lg font-bold text-white mb-2">
                    NASA's New Deep Space Network Antenna Has Its Crowning
                    Moment
                  </h3>
                  <p className="text-white/90">4 MIN READ</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="overflow-hidden">
            <Link href="/news/liechtenstein-artemis" className="group">
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt="Artemis Accords signing"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 p-4">
                  <Badge className="mb-2">NEWS RELEASE</Badge>
                  <h3 className="text-lg font-bold text-white mb-2">
                    NASA Welcomes Liechtenstein as Newest Artemis Accords
                    Signatory
                  </h3>
                  <p className="text-white/90">3 MIN READ</p>
                </div>
              </div>
            </Link>
          </Card>
        </div>
      </div>

      {/* Bottom Row Articles */}
      <div className="grid gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-4">
        <SmallArticleCard
          href="/news/mars-new-year"
          image="/placeholder.svg?height=200&width=200"
          badge="ARTICLE"
          title="Avalanches, Ice Explosions, and Dunes: NASA Is Tracking New Year on Mars"
          readTime="5 MIN READ"
        />
        <SmallArticleCard
          href="/news/lunar-dust"
          image="/placeholder.svg?height=200&width=200"
          badge="ARTICLE"
          title="NASA Science Payload to Study Sticky Lunar Dust Challenge"
          readTime="3 MIN READ"
        />
        <SmallArticleCard
          href="/news/vesta-gullies"
          image="/placeholder.svg?height=200&width=200"
          badge="ARTICLE"
          title="Lab Work Digs Into Gullies Seen on Giant Asteroid Vesta by NASA's..."
          readTime="4 MIN READ"
        />
        <SmallArticleCard
          href="/news/december-skywatching"
          image="/placeholder.svg?height=200&width=200"
          badge="ARTICLE"
          title="What's Up: December 2024 Skywatching Tips from NASA"
          readTime="5 MIN READ"
        />
      </div>
    </section>
  );
}

function SmallArticleCard({
  href,
  image,
  badge,
  title,
  readTime,
}: {
  href: string;
  image: string;
  badge: string;
  title: string;
  readTime: string;
}) {
  return (
    <Card className="flex items-start gap-4 p-4">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full">
        <img src={image} alt="" className="object-cover" />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{badge}</Badge>
          <span className="text-sm text-muted-foreground">{readTime}</span>
        </div>
        <Link href={href} className="font-medium hover:underline">
          {title}
        </Link>
      </div>
    </Card>
  );
}
