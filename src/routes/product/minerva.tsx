import { createFileRoute } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Radar, Shield, Eye, Zap } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function MinervaProductPage() {
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
    <div className="max-w-4xl mx-auto">
      <header className="text-center mb-12">
        <section className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 py-12 md:px-12 lg:py-24">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-2">
              Minerva
            </h1>
            <p className="text-lg md:text-xl font-medium text-blue-300">
              Scan websites with intelligence
            </p>
          </div>

          <div className="relative hidden lg:block">
            
          </div>
        </section>
      </header>

      <div className="flex items-center justify-center mb-12">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white mr-4">
          Launch Minerva Scan
        </Button>
        <Button className="bg-gray-800 text-white">Learn More</Button>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="text-gray-300 mb-4">
          Minerva is an advanced reconnaissance tool designed to scan websites
          for vulnerabilities and exposed secrets. Like its namesake, the Roman
          goddess of wisdom and strategic warfare, Minerva provides intelligent
          insights to fortify your web presence against potential threats.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card className="bg-gray-800 border-blue-500">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">Mission Start</h3>
              <p className="text-3xl font-bold">2023</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-blue-500">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">Websites Scanned</h3>
              <p className="text-3xl font-bold">1M+</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-4xl md:text-5xl md:leading-[3.5rem] font-black tracking-tight max-w-lg">
          Boost Your Strategy with Smart Features
        </h2>
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

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Mission Timeline</h2>
        <div className="space-y-4">
          <TimelineItem
            date="T-0: Initiation"
            description="Begin the scanning process"
          />
          <TimelineItem
            date="T+1: Reconnaissance"
            description="Map out the website structure"
          />
          <TimelineItem
            date="T+2: Deep Scan"
            description="Perform thorough vulnerability analysis"
          />
          <TimelineItem
            date="T+3: Secret Detection"
            description="Identify exposed sensitive information"
          />
          <TimelineItem
            date="T+4: Report Generation"
            description="Compile findings and recommendations"
          />
          <TimelineItem
            date="T+5: Debrief"
            description="Present results and improvement strategies"
          />
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Ready to Secure Your Mission?
        </h2>
        <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white">
          Launch Minerva Scan
        </Button>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card className="bg-gray-800 border-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center mb-2">
          {icon}
          <h3 className="text-lg font-semibold ml-2">{title}</h3>
        </div>
        <p className="text-gray-300">{description}</p>
      </CardContent>
    </Card>
  );
}

function TimelineItem({ date, description }) {
  return (
    <div className="flex items-center">
      <Badge variant="secondary" className="mr-4">
        {date}
      </Badge>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

export const Route = createFileRoute("/product/minerva")({
  component: MinervaProductPage,
});
