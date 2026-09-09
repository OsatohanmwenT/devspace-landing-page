const NumberTile = ({ value, labels }: { value: string; labels: string[] }) => (
  <div className="flex h-40 flex-col justify-center gap-1 border border-neutral-300 px-6">
    <span className="text-4xl font-semibold tabular-nums text-neutral-700">{value}</span>
    <div className="flex flex-col">
      {labels.map((label) => (
        <span key={label} className="text-sm text-neutral-400">
          {label}
        </span>
      ))}
    </div>
  </div>
);

const ImageTile = () => (
  <div className="flex h-40 items-center justify-center border border-dashed border-neutral-400 text-sm text-neutral-400">
    Image
  </div>
);

const Metrics = () => {
  return (
    <section className="border-b border-neutral-300">
      <div className="grid grid-cols-4">
        <NumberTile value="350+" labels={["Learners"]} />
        <ImageTile />
        <ImageTile />
        <NumberTile value="900+" labels={["Project solutions"]} />
      </div>
      <div className="grid grid-cols-4 border-t border-neutral-300">
        <ImageTile />
        <NumberTile value="35+" labels={["Paid learners"]} />
        <NumberTile value="#1" labels={["in Nigeria", "Hult Prize 2026"]} />
        <ImageTile />
      </div>
    </section>
  );
};

export default Metrics;
