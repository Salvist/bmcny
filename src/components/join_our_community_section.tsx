import Image from "next/image";

export default function JoinOurCommunitySection() {
  return (
    <section className="bg-white text-black px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold">Join Our Community</h2>
        <p>
          We can't wait to meet you and rejoice together in the love of Christ!
        </p>
        <div className="mt-4 relative h-[600px] rounded-2xl overflow-hidden">
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
