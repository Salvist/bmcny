export default function MainSection() {
  return (
    <section className="relative bg-amber-50 px-4 py-32 mt-16 text-black text-center flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[url('/cross_on_top.webp')] bg-cover bg-bottom" />
      <div className="absolute inset-0 bg-amber-50/70" />
      <div className="relative z-10 w-full flex flex-col items-center justify-center font-montserrat">
        <p className="text-3xl font-bold">Welcome to</p>
        <h1 className="text-4xl font-bold">Bethany Miracle Center</h1>
        <p className="text-2xl font-bold">New York</p>
        <p className="mt-8 text-lg">
          An Indonesian community church filled with loving members of Christ.
        </p>
        <button className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold mt-8">
          Join us!
        </button>
      </div>
    </section>
  );
}
