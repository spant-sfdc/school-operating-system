import { BookOpen, GraduationCap, Users } from "lucide-react";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Caption, Heading } from "@/components/ui/typography";
import {
  AnimatedSection,
  BadgeGroup,
  Callout,
  ContentContainer,
  CTASection,
  FAQAccordion,
  FeatureGrid,
  ImageText,
  PageHero,
  QuoteBlock,
  ResponsiveImage,
  SectionDivider,
  SectionHeader,
  StatisticsGrid,
  Timeline,
} from "@/components/website/sections";

const PLACEHOLDER_IMAGE = { src: "/dev/placeholder.png", alt: "Placeholder" };

function Demo({ name, children }: { name: string; children: ReactNode }) {
  return (
    <AnimatedSection as="section" className="py-16">
      <ContentContainer>
        <Caption className="mb-4 block">{name}</Caption>
      </ContentContainer>
      {children}
      <ContentContainer>
        <SectionDivider className="mt-16" />
      </ContentContainer>
    </AnimatedSection>
  );
}

export default function PlaygroundPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main>
      <ContentContainer className="py-12">
        <Heading level={1}>Marketing Section Library — Playground</Heading>
        <p className="text-muted-foreground mt-2 text-sm">
          Dev-only route (404s in production, see <code>docs/DECISIONS.md § D-015</code>). Every
          component from <code>src/components/website/sections</code> rendered with sample data.
        </p>
      </ContentContainer>

      <Demo name="PageHero (default)">
        <PageHero
          title="Admissions Open for 2026–27"
          subtitle="A calm, considered education for every child who walks through our doors."
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Admissions" }]}
          cta={{ label: "Enquire Now", href: "#" }}
          secondaryCta={{ label: "Download Prospectus", href: "#" }}
        />
      </Demo>

      <Demo name="PageHero (image variant, dark-overlay text)">
        <PageHero
          title="Our Campus"
          subtitle="Vidyadhar Nagar, Jaipur"
          variant="image"
          backgroundImage={PLACEHOLDER_IMAGE}
          cta={{ label: "Book a Visit", href: "#" }}
          secondaryCta={{ label: "View Gallery", href: "#" }}
        />
      </Demo>

      <Demo name="SectionHeader">
        <ContentContainer>
          <SectionHeader
            eyebrow="Why Pant Public School"
            title="Attentive teaching, considered curriculum"
            description="Every decision starts with what's best for the child in front of us."
            align="center"
          />
        </ContentContainer>
      </Demo>

      <Demo name="ImageText">
        <ContentContainer>
          <ImageText
            eyebrow="Our Approach"
            title="A classroom that adapts to the child"
            description="Small class sizes and a curriculum that treats every student as an individual, not a cohort."
            image={{ ...PLACEHOLDER_IMAGE, aspect: "video" }}
            imagePosition="right"
            cta={{ label: "Learn More", href: "#" }}
          />
        </ContentContainer>
      </Demo>

      <Demo name="FeatureGrid">
        <ContentContainer>
          <FeatureGrid
            columns={3}
            items={[
              {
                icon: GraduationCap,
                title: "Academics",
                description: "A curriculum built for depth, not just coverage.",
              },
              {
                icon: Users,
                title: "Small Classes",
                description: "Individual attention, every day, for every student.",
              },
              {
                icon: BookOpen,
                title: "Library",
                description: "A well-stocked, quiet space for independent learning.",
              },
            ]}
          />
        </ContentContainer>
      </Demo>

      <Demo name="StatisticsGrid (sample data only — no real numbers ship on any page)">
        <ContentContainer>
          <StatisticsGrid
            columns={3}
            items={[
              { value: 25, label: "Years (sample)", suffix: "+" },
              { value: 40, label: "Teachers (sample)", suffix: "+" },
              { value: 12, label: "Classrooms (sample)" },
            ]}
          />
        </ContentContainer>
      </Demo>

      <Demo name="Timeline">
        <ContentContainer width="md">
          <Timeline
            items={[
              {
                date: "1998",
                title: "School Founded",
                description: "Opened its doors in Vidyadhar Nagar.",
              },
              {
                date: "2010",
                title: "Senior Secondary Wing",
                description: "Expanded through Class XII.",
              },
              {
                date: "2024",
                title: "New Science Block",
                description: "Dedicated labs for physics, chemistry, biology.",
              },
            ]}
          />
        </ContentContainer>
      </Demo>

      <Demo name="QuoteBlock">
        <ContentContainer width="md">
          <QuoteBlock
            quote="The teachers here notice things about your child you'd only expect a parent to notice."
            author="A Parent"
            role="Class VI Parent"
            variant="card"
          />
        </ContentContainer>
      </Demo>

      <Demo name="FAQAccordion">
        <ContentContainer width="md">
          <FAQAccordion
            items={[
              {
                question: "What is the admission process?",
                answer: "Submit an enquiry, then attend a campus visit and interaction.",
              },
              {
                question: "What age does Class I admission require?",
                answer: "As per state education board guidelines.",
              },
            ]}
          />
        </ContentContainer>
      </Demo>

      <Demo name="BadgeGroup">
        <ContentContainer>
          <BadgeGroup
            badges={[
              { label: "CBSE Affiliated", variant: "primary" },
              { label: "Admissions Open", variant: "success" },
              { label: "Limited Seats", variant: "warning" },
            ]}
          />
        </ContentContainer>
      </Demo>

      <Demo name="Callout">
        <ContentContainer width="md">
          <Callout variant="info" title="Admissions Timeline">
            Enquiry forms for 2026–27 close on a date to be announced by the school office.
          </Callout>
        </ContentContainer>
      </Demo>

      <Demo name="ResponsiveImage">
        <ContentContainer width="sm">
          <ResponsiveImage {...PLACEHOLDER_IMAGE} aspect="wide" rounded />
        </ContentContainer>
      </Demo>

      <Demo name="CTASection">
        <ContentContainer>
          <CTASection
            title="Ready to see the campus for yourself?"
            description="Book a visit and meet the teachers who'll be teaching your child."
            primaryCta={{ label: "Book a Visit", href: "#" }}
            secondaryCta={{ label: "Contact Us", href: "#" }}
            layout="centered"
          />
        </ContentContainer>
      </Demo>

      <Demo name="BadgeGroup icon variant showcase (all 5 semantic tokens)">
        <ContentContainer>
          <BadgeGroup
            badges={[
              { label: "neutral", variant: "neutral" },
              { label: "primary", variant: "primary" },
              { label: "success", variant: "success" },
              { label: "warning", variant: "warning" },
              { label: "info", variant: "info" },
            ]}
          />
        </ContentContainer>
      </Demo>
    </main>
  );
}
