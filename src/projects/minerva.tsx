import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { IProject, ReleasePhase } from "@/types/project";
import { Link } from "@tanstack/react-router";
import { Eye, Radar, Shield, Zap } from "lucide-react";
import { FC } from "react";

export const Minerva: IProject = {
  id: "minerva",
  name: "Minerva",
  tagline: "Advanced Reconnaissance Tool",
  description:
    "Minerva is an open-source scanning tool designed to help developers identify security vulnerabilities, potential immprovements, and valuable insights within their code and applications. Named after the Roman goddess of wisdom, Minerva is designed to help developers quickly identify and address security vulnerabilities and other issues within their codebase.",
  category: "Analysis",
  tags: [
    "api",
    "server",
    "scanner",
    "detection",
    "malware-analysis",
    "analysis",
    "security",
    "reconnaissance",
    "vulnerabilities",
  ],
  downloadUrl: "https://github.com/CodeVault-LLC/minerva/releases",
  release: {
    phase: ReleasePhase.alpha,
  },
  github: {
    url: "https://github.com/CodeVault-LLC/minerva",
    documentationSource:
      "https://raw.githubusercontent.com/CodeVault-LLC/minerva/refs/heads/master/docs/schema.json",
  },
};

export const MinervaPage: FC = () => {
  const features = [
    {
      icon: <Radar className="w-6 h-6 text-blue-400" />,
      title: "Deep Scan Technology",
      description:
        "Utilizes advanced algorithms to detect vulnerabilities across your entire web infrastructure.",
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-400" />,
      title: "Secret Detection",
      description:
        "Identifies exposed API keys, credentials, and other sensitive information in your codebase.",
    },
    {
      icon: <Eye className="w-6 h-6 text-blue-400" />,
      title: "Real-time Monitoring",
      description:
        "Continuously monitors your websites for new vulnerabilities and immediate alerts.",
    },
    {
      icon: <Zap className="w-6 h-6 text-blue-400" />,
      title: "Actionable Insights",
      description:
        "Provides detailed reports with prioritized recommendations for remediation.",
    },
  ];

  return (
    <div className="">
      <header className="text-center mb-12">
        <div className="space-y-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-2">
            Minerva
          </h1>
          <p className="text-gray-300 mb-4">
            Minerva is an advanced reconnaissance tool designed to scan websites
            for vulnerabilities and exposed secrets. Like its namesake, the
            Roman goddess of wisdom and strategic warfare, Minerva provides
            intelligent insights to fortify your web presence against potential
            threats.
          </p>
        </div>
      </header>

      <div className="flex items-center justify-center mb-12 w-4/12 mx-auto">
        <Link
          to="/project/$projectId/docs"
          params={{ projectId: "minerva" }}
          className="mr-4 w-full"
        >
          <Button className="bg-blue-500 hover:bg-blue-600 text-white mr-4 w-full">
            Get Started
          </Button>
        </Link>

        <Link
          to="/project/$projectId/docs"
          params={{ projectId: "minerva" }}
          className="w-full"
        >
          <Button className="bg-gray-800 text-white w-full">Support</Button>
        </Link>
      </div>

      <section className="mb-12">
        <div className="mt-6 md:mt-8 w-full mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <Accordion defaultValue="item-0" type="single" className="w-full">
              {features.map(({ title, description, icon }, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="data-[state=open]:border-b-2 data-[state=open]:border-primary"
                >
                  <AccordionTrigger className="text-lg [&>svg]:hidden">
                    <div className="flex items-center gap-4">
                      {icon}
                      {title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-[17px] leading-relaxed text-muted-foreground">
                    {description}
                    <div className="mt-6 mb-2 md:hidden aspect-video w-full bg-muted rounded-xl" />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
};
