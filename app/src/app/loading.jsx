export default function Loading() {
  return (
    <main className="bg-bg min-h-screen pt-[100px] pb-24 px-6 lg:px-10">
      <section className="max-w-[1320px] mx-auto">
        <div className="mb-5">
          <div className="h-3 w-40 bg-bg-soft rounded-full mb-4" />
          <div className="h-16 w-3/4 bg-bg-soft rounded-2xl" />
        </div>
        <div className="mb-10 h-14 w-full max-w-2xl bg-bg-soft rounded-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-full h-[360px] bg-paper rounded-[22px] border-[1.5px] border-rule"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
