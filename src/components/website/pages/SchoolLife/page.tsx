import Link from "next/link";

import { BadgeGroup } from "@/components/website/sections/BadgeGroup";
import { Callout } from "@/components/website/sections/Callout";
import { ContentContainer } from "@/components/website/sections/ContentContainer";
import { CTASection } from "@/components/website/sections/CTASection";
import { FeatureGrid } from "@/components/website/sections/FeatureGrid";
import { PageHero } from "@/components/website/sections/PageHero";
import { Prose } from "@/components/website/sections/Prose";
import { QuoteBlock } from "@/components/website/sections/QuoteBlock";
import { SectionDivider } from "@/components/website/sections/SectionDivider";
import { SectionHeader } from "@/components/website/sections/SectionHeader";

import {
  SCHOOL_LIFE_ACHIEVEMENTS_CONTENT,
  SCHOOL_LIFE_CELEBRATIONS_CONTENT,
  SCHOOL_LIFE_CTA_CONTENT,
  SCHOOL_LIFE_CULTURAL_CONTENT,
  SCHOOL_LIFE_EVENTS_CONTENT,
  SCHOOL_LIFE_GALLERY_CONTENT,
  SCHOOL_LIFE_HERO_CONTENT,
  SCHOOL_LIFE_NARRATIVE_CONTENT,
  SCHOOL_LIFE_SPORTS_CONTENT,
  SCHOOL_LIFE_TESTIMONIAL_CONTENT,
} from "./content";
import { schoolLifeJsonLd } from "./metadata";
import {
  SCHOOL_LIFE_ACHIEVEMENT_ITEMS,
  SCHOOL_LIFE_CELEBRATION_BADGES,
  SCHOOL_LIFE_CULTURAL_ITEMS,
  SCHOOL_LIFE_EVENT_ITEMS,
  SCHOOL_LIFE_GALLERY_ITEMS,
  SCHOOL_LIFE_SPORTS_BADGES,
} from "./sections";

export function SchoolLifePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schoolLifeJsonLd) }}
      />

      <PageHero
        title={SCHOOL_LIFE_HERO_CONTENT.title}
        subtitle={SCHOOL_LIFE_HERO_CONTENT.subtitle}
        breadcrumbs={SCHOOL_LIFE_HERO_CONTENT.breadcrumbs}
        cta={SCHOOL_LIFE_HERO_CONTENT.primaryCta}
      />

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={SCHOOL_LIFE_NARRATIVE_CONTENT.eyebrow}
            title={SCHOOL_LIFE_NARRATIVE_CONTENT.title}
          />
          <Prose paragraphs={SCHOOL_LIFE_NARRATIVE_CONTENT.paragraphs} />
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer>
          <SectionHeader
            eyebrow={SCHOOL_LIFE_EVENTS_CONTENT.eyebrow}
            title={SCHOOL_LIFE_EVENTS_CONTENT.title}
            description={SCHOOL_LIFE_EVENTS_CONTENT.description}
            align="center"
          />
          <div className="mt-10">
            <FeatureGrid items={SCHOOL_LIFE_EVENT_ITEMS} columns={3} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={SCHOOL_LIFE_SPORTS_CONTENT.eyebrow}
            title={SCHOOL_LIFE_SPORTS_CONTENT.title}
            description={SCHOOL_LIFE_SPORTS_CONTENT.description}
          />
          <div className="mt-6">
            <BadgeGroup badges={SCHOOL_LIFE_SPORTS_BADGES} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer>
          <SectionHeader
            eyebrow={SCHOOL_LIFE_CULTURAL_CONTENT.eyebrow}
            title={SCHOOL_LIFE_CULTURAL_CONTENT.title}
            description={SCHOOL_LIFE_CULTURAL_CONTENT.description}
            align="center"
          />
          <div className="mt-10">
            <FeatureGrid items={SCHOOL_LIFE_CULTURAL_ITEMS} columns={3} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={SCHOOL_LIFE_CELEBRATIONS_CONTENT.eyebrow}
            title={SCHOOL_LIFE_CELEBRATIONS_CONTENT.title}
            description={SCHOOL_LIFE_CELEBRATIONS_CONTENT.description}
          />
          <div className="mt-6">
            <BadgeGroup badges={SCHOOL_LIFE_CELEBRATION_BADGES} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer>
          <SectionHeader
            eyebrow={SCHOOL_LIFE_ACHIEVEMENTS_CONTENT.eyebrow}
            title={SCHOOL_LIFE_ACHIEVEMENTS_CONTENT.title}
            description={SCHOOL_LIFE_ACHIEVEMENTS_CONTENT.description}
            align="center"
          />
          <div className="mt-10">
            <FeatureGrid items={SCHOOL_LIFE_ACHIEVEMENT_ITEMS} columns={3} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer>
          <SectionHeader
            eyebrow={SCHOOL_LIFE_GALLERY_CONTENT.eyebrow}
            title={SCHOOL_LIFE_GALLERY_CONTENT.title}
            description={SCHOOL_LIFE_GALLERY_CONTENT.description}
            align="center"
          />
          <div className="mt-10">
            <FeatureGrid items={SCHOOL_LIFE_GALLERY_ITEMS} columns={4} />
          </div>
          <div className="mt-6 text-center">
            <Link
              href={SCHOOL_LIFE_GALLERY_CONTENT.cta.href}
              className="text-primary text-sm font-medium"
            >
              {SCHOOL_LIFE_GALLERY_CONTENT.cta.label} →
            </Link>
          </div>
          <Callout variant="info" title="Before this goes live" className="mt-8">
            {SCHOOL_LIFE_GALLERY_CONTENT.disclaimer}
          </Callout>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={SCHOOL_LIFE_TESTIMONIAL_CONTENT.eyebrow}
            title={SCHOOL_LIFE_TESTIMONIAL_CONTENT.title}
            align="center"
          />
          <div className="mt-10">
            <QuoteBlock
              quote={SCHOOL_LIFE_TESTIMONIAL_CONTENT.quote}
              author={SCHOOL_LIFE_TESTIMONIAL_CONTENT.author}
              role={SCHOOL_LIFE_TESTIMONIAL_CONTENT.role}
              variant="large"
            />
          </div>
        </ContentContainer>
      </section>

      <section className="py-16 sm:pt-4 sm:pb-24">
        <CTASection
          title={SCHOOL_LIFE_CTA_CONTENT.title}
          description={SCHOOL_LIFE_CTA_CONTENT.description}
          primaryCta={SCHOOL_LIFE_CTA_CONTENT.primaryCta}
          secondaryCta={SCHOOL_LIFE_CTA_CONTENT.secondaryCta}
          layout="centered"
        />
      </section>
    </>
  );
}
