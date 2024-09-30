import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Faq: React.FC = () => {
  return (
    <div>
      <div className="font-bold text-2xl">Common Questions</div>
      <div className="text-lg text-gray-500">
        At CodeVault LLC we strive to deliver and provide the best experience
        for our fellow developers. Here are some common questions that we get
        asked.
      </div>

      <h4 className="font-bold text-xl mt-8">Our Company</h4>
      <Accordion type="single">
        <AccordionItem value="what-is-codevault-llc">
          <AccordionTrigger>
            <div className="text-base">What is CodeVault LLC?</div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-gray-500">
              CodeVault LLC is a software development company that provides high
              quality software solutions for businesses and individuals. We
              specialize in web development, software development and general IT
              services. Although we are a small company, we have a big heart and
              a passion for technology.
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="contact-codevault-llc">
          <AccordionTrigger>
            <div className="text-base">How can I contact CodeVault LLC?</div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-gray-500">
              You can contact us by email at{" "}
              <a
                className="text-blue-500 underline"
                href="mailto:codevaultllc@gmail.com"
              >
                codevaultllc@gmail.com
              </a>
              .
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="why-open-source">
          <AccordionTrigger>
            <div className="text-base">
              Why does CodeVault LLC support open source?
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-gray-500">
              Simple answer, we are not the smartest people in the world, we
              need the help of the community to build great softwares and
              products that will help the world. Open Source allows us to share,
              collaborate, and build great things together.
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <h4 className="font-bold text-xl mt-8">Open Source</h4>
      <Accordion type="single">
        <AccordionItem value="handle-releases">
          <AccordionTrigger>
            <div className="text-base">How we handle releasing</div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-gray-500">
              We release our software under different licenses depending on the
              project, but we always try to release under the most permissive
              license possible. Now how we do release, is via a GitHub Workflow
              that automatically based on meeting the conditions of the project,
              will release the software to the public. Often times we will set
              the release condition to be on the main branch and a new tag.
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <h4 className="font-bold text-xl mt-8">Our Products</h4>
      <Accordion type="single">
        <AccordionItem value="type-of-products-built">
          <AccordionTrigger>
            <div className="text-base">
              What is the type of products we build?
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-gray-500">
              We build a wide range of products, some may involve web and others
              may involve nerdy stuff like scripts. We are always looking for
              new ideas and projects to work on. If you have an idea, feel free
              to reach out to us.
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="malware">
          <AccordionTrigger>
            <div className="text-base">
              I found malware in one of your products, what should I do?
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-gray-500">
              The first thing you should do is report it to us. We take security
              very seriously and will investigate the issue. Most likely thing
              is it&rsquo;s a false positive, since this company will not be
              distributing anything malicious, even if it&rsquo;s just a list of
              samples, we always handle security as a core part of our
              development process.
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export const Route = createFileRoute("/faq")({
  component: Faq,
});
