type PromoProps = {
  sosial: "discord" | "twitter";
  link: string;
};

const Promo: React.FC<PromoProps> = (props: PromoProps) => {
  switch (props.sosial) {
    case "discord":
      return (
        <div className="h-28 py-20 p-12 pt-20 bg-[#7289da] text-white rounded-sm flex flex-row justify-between items-center gap-8">
          <div className="w-6/12">
            <h3 className="text-xl font-bold">CodeVault on Discord!</h3>
            <p>
              The official CodeVault community to ask questions, network and
              make new friends and get lightning fast news about what&apos;s
              coming next for CodeVault!
            </p>
          </div>

          <a
            href={props.link}
            className="bg-white text-black p-2 rounded-sm shadow-md w-4/12 text-center text-lg font-bold"
          >
            Join us
          </a>
        </div>
      );

    case "twitter":
      return (
        <h1 className="text-4xl font-bold mb-4">
          Twitter Component coming soon
        </h1>
      );
  }
};

export default Promo;
