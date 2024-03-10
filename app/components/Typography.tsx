type TypographyProps = {
  variant: "warning" | "info" | "code" | "logo";
  content: React.ReactNode;
  icon?: React.ReactNode;
};

const Typography: React.FC<TypographyProps> = (props: TypographyProps) => {
  switch (props.variant) {
    case "warning":
      return (
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
          role="alert"
        >
          <p className="font-bold">Warning</p>
          <p>{props.content}</p>
        </div>
      );

    case "info":
      return (
        <div
          className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4"
          role="alert"
        >
          <p className="font-bold">Info</p>
          <p>{props.content}</p>
        </div>
      );

    case "code":
      return (
        <pre className="bg-gray-800 text-white p-4 rounded-md">
          <code>{props.content}</code>
        </pre>
      );

    case "logo":
      return (
        <div className="flex flex-row items-center gap-4">
          {props.icon}
          <h1 className="text-4xl font-bold mb-4">{props.content}</h1>
        </div>
      );
  }

  return null;
};

export default Typography;
