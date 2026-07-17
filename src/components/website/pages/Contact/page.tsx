import Link from "next/link";

import { BadgeGroup } from "@/components/website/sections/BadgeGroup";
import { Callout } from "@/components/website/sections/Callout";
import { ContentContainer } from "@/components/website/sections/ContentContainer";
import { CTASection } from "@/components/website/sections/CTASection";
import { DataTable } from "@/components/website/sections/DataTable";
import { FAQAccordion } from "@/components/website/sections/FAQAccordion";
import { PageHero } from "@/components/website/sections/PageHero";
import { Prose } from "@/components/website/sections/Prose";
import { SectionDivider } from "@/components/website/sections/SectionDivider";
import { SectionHeader } from "@/components/website/sections/SectionHeader";

import {
  CONTACT_CTA_CONTENT,
  CONTACT_FAQ_CONTENT,
  CONTACT_HERO_CONTENT,
  CONTACT_MAP_CONTENT,
  CONTACT_OFFICE_CONTENT,
  CONTACT_OVERVIEW_CONTENT,
  CONTACT_SUMMARY_CONTENT,
  CONTACT_TIMINGS_CONTENT,
  CONTACT_VISIT_CONTENT,
} from "./content";
import { contactJsonLd } from "./metadata";
import {
  CONTACT_OFFICE_ROWS,
  CONTACT_OVERVIEW_BADGES,
  CONTACT_SUMMARY_BADGES,
  CONTACT_TIMINGS_ROWS,
} from "./sections";

export function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />

      <PageHero
        title={CONTACT_HERO_CONTENT.title}
        subtitle={CONTACT_HERO_CONTENT.subtitle}
        breadcrumbs={CONTACT_HERO_CONTENT.breadcrumbs}
        cta={CONTACT_HERO_CONTENT.primaryCta}
      />

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={CONTACT_OVERVIEW_CONTENT.eyebrow}
            title={CONTACT_OVERVIEW_CONTENT.title}
            description={CONTACT_OVERVIEW_CONTENT.description}
          />
          <div className="mt-6">
            <BadgeGroup badges={CONTACT_OVERVIEW_BADGES} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={CONTACT_OFFICE_CONTENT.eyebrow}
            title={CONTACT_OFFICE_CONTENT.title}
          />
          <div className="mt-8">
            <DataTable caption={CONTACT_OFFICE_CONTENT.title} rows={CONTACT_OFFICE_ROWS} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={CONTACT_TIMINGS_CONTENT.eyebrow}
            title={CONTACT_TIMINGS_CONTENT.title}
          />
          <div className="mt-8">
            <DataTable caption={CONTACT_TIMINGS_CONTENT.title} rows={CONTACT_TIMINGS_ROWS} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={CONTACT_VISIT_CONTENT.eyebrow}
            title={CONTACT_VISIT_CONTENT.title}
          />
          <Prose paragraphs={CONTACT_VISIT_CONTENT.paragraphs} />
          <div className="mt-6">
            <Link
              href={CONTACT_VISIT_CONTENT.cta.href}
              className="text-primary text-sm font-medium"
            >
              {CONTACT_VISIT_CONTENT.cta.label} →
            </Link>
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader eyebrow={CONTACT_MAP_CONTENT.eyebrow} title={CONTACT_MAP_CONTENT.title} />
          <Callout variant="info" title="Before this goes live" className="mt-6">
            {CONTACT_MAP_CONTENT.disclaimer}
          </Callout>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader eyebrow={CONTACT_FAQ_CONTENT.eyebrow} title={CONTACT_FAQ_CONTENT.title} />
          <div className="mt-10">
            <FAQAccordion items={CONTACT_FAQ_CONTENT.items} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:pt-4 sm:pb-16">
        <CTASection
          title={CONTACT_CTA_CONTENT.title}
          description={CONTACT_CTA_CONTENT.description}
          primaryCta={CONTACT_CTA_CONTENT.primaryCta}
          secondaryCta={CONTACT_CTA_CONTENT.secondaryCta}
          layout="centered"
        />
      </section>

      <section className="pb-16 sm:pb-24">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={CONTACT_SUMMARY_CONTENT.eyebrow}
            title={CONTACT_SUMMARY_CONTENT.title}
            align="center"
          />
          <div className="mt-6 flex justify-center">
            <BadgeGroup badges={CONTACT_SUMMARY_BADGES} />
          </div>
          <Callout variant="info" className="mt-8">
            {CONTACT_SUMMARY_CONTENT.socialNote}
          </Callout>
        </ContentContainer>
      </section>
    </>
  );
}
