import { FaBook } from "react-icons/fa";
import { motion, useCycle } from "framer-motion";
import FeatureList from "./FeatureList";

type DocTitleProps = {
  title: string;
  description: string;
  docsLink: string;

  colors: string[];

  features: string[];
};

const DocTitle: React.FC<DocTitleProps> = (props: DocTitleProps) => {
  const [animate, cycle] = useCycle(
    props.colors.map((color) => ({ color: color }))
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.h4
          className="text-4xl font-bold mb-4"
          animate={animate}
          transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
          onAnimationComplete={() => cycle()}
        >
          {props.title}
        </motion.h4>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-gray-200"
      >
        {props.description}
      </motion.p>

      <a
        className="mt-8 mb-8 dark:text-white border dark:border-white rounded-sm font-bold py-2 px-4 flex flex-row items-center gap-2"
        href={props.docsLink}
      >
        Read the docs <FaBook />
      </a>

      <FeatureList features={props.features} />
    </>
  );
};

export default DocTitle;
