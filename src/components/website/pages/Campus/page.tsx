import Link from "next/link";

import { Callout } from "@/components/website/sections/Callout";
import { ContentContainer } from "@/components/website/sections/ContentContainer";
import { CTASection } from "@/components/website/sections/CTASection";
import { FeatureGrid } from "@/components/website/sections/FeatureGrid";
import { PageHero } from "@/components/website/sections/PageHero";
import { Prose } from "@/components/website/sections/Prose";
import { SectionDivider } from "@/components/website/sections/SectionDivider";
import { SectionHeader } from "@/components/website/sections/SectionHeader";

import {
  CAMPUS_CLASSROOMS_CONTENT,
  CAMPUS_COMPUTER_CONTENT,
  CAMPUS_CTA_CONTENT,
  CAMPUS_GALLERY_CONTENT,
  CAMPUS_HERO_CONTENT,
  CAMPUS_LIBRARY_CONTENT,
  CAMPUS_SAFETY_CONTENT,
  CAMPUS_SPORTS_CONTENT,
  CAMPUS_WELLBEING_CONTENT,
} from "./content";
import { campusJsonLd } from "./metadata";
import { CAMPUS_CLASSROOM_ITEMS, CAMPUS_GALLERY_ITEMS, CAMPUS_SPORTS_ITEMS } from "./sections";

export function CampusPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(campusJsonLd) }}
      />

      <PageHero
        title={CAMPUS_HERO_CONTENT.title}
        subtitle={CAMPUS_HERO_CONTENT.subtitle}
        breadcrumbs={CAMPUS_HERO_CONTENT.breadcrumbs}
        cta={CAMPUS_HERO_CONTENT.primaryCta}
      />

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={CAMPUS_SAFETY_CONTENT.eyebrow}
            title={CAMPUS_SAFETY_CONTENT.title}
          />
          <Prose paragraphs={CAMPUS_SAFETY_CONTENT.paragraphs} />
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer>
          <SectionHeader
            eyebrow={CAMPUS_CLASSROOMS_CONTENT.eyebrow}
            title={CAMPUS_CLASSROOMS_CONTENT.title}
            description={CAMPUS_CLASSROOMS_CONTENT.description}
            align="center"
          />
          <div className="mt-10">
            <FeatureGrid items={CAMPUS_CLASSROOM_ITEMS} columns={4} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={CAMPUS_LIBRARY_CONTENT.eyebrow}
            title={CAMPUS_LIBRARY_CONTENT.title}
          />
          <Prose paragraphs={CAMPUS_LIBRARY_CONTENT.paragraphs} />
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={CAMPUS_COMPUTER_CONTENT.eyebrow}
            title={CAMPUS_COMPUTER_CONTENT.title}
          />
          <Prose paragraphs={CAMPUS_COMPUTER_CONTENT.paragraphs} />
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer>
          <SectionHeader
            eyebrow={CAMPUS_SPORTS_CONTENT.eyebrow}
            title={CAMPUS_SPORTS_CONTENT.title}
            description={CAMPUS_SPORTS_CONTENT.description}
            align="center"
          />
          <div className="mt-10">
            <FeatureGrid items={CAMPUS_SPORTS_ITEMS} columns={3} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={CAMPUS_WELLBEING_CONTENT.eyebrow}
            title={CAMPUS_WELLBEING_CONTENT.title}
          />
          <Prose paragraphs={CAMPUS_WELLBEING_CONTENT.paragraphs} />
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer>
          <SectionHeader
            eyebrow={CAMPUS_GALLERY_CONTENT.eyebrow}
            title={CAMPUS_GALLERY_CONTENT.title}
            description={CAMPUS_GALLERY_CONTENT.description}
            align="center"
          />
          <div className="mt-10">
            <FeatureGrid items={CAMPUS_GALLERY_ITEMS} columns={4} />
          </div>
          <div className="mt-6 text-center">
            <Link
              href={CAMPUS_GALLERY_CONTENT.cta.href}
              className="text-primary text-sm font-medium"
            >
              {CAMPUS_GALLERY_CONTENT.cta.label} →
            </Link>
          </div>
          <Callout variant="info" title="Before this goes live" className="mt-8">
            {CAMPUS_GALLERY_CONTENT.disclaimer}
          </Callout>
        </ContentContainer>
      </section>

      <section className="py-16 sm:pt-4 sm:pb-24">
        <CTASection
          title={CAMPUS_CTA_CONTENT.title}
          description={CAMPUS_CTA_CONTENT.description}
          primaryCta={CAMPUS_CTA_CONTENT.primaryCta}
          secondaryCta={CAMPUS_CTA_CONTENT.secondaryCta}
          layout="centered"
        />
      </section>
    </>
  );
}
