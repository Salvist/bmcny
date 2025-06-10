import Image from "next/image";

export default function JoinOurCommunitySection() {
  return (
    <section
      id="community"
      className="bg-white text-black px-4 py-8 scroll-mt-16"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-orange-700 font-montserrat">
          JOIN OUR COMMUNITY
        </h2>
        <p className="font-merriweather italic">
          We can't wait to meet you and rejoice together in the love of Christ!
        </p>
        <div className="mt-4 relative aspect-video rounded-2xl overflow-hidden">
          <Image
            src="/bethany_members.webp"
            alt="Bethany Members Worshipping"
            fill
            objectFit="cover"
          />
        </div>
      </div>
    </section>
  );
}
