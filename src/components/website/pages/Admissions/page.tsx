import { BadgeGroup } from "@/components/website/sections/BadgeGroup";
import { Callout } from "@/components/website/sections/Callout";
import { ContentContainer } from "@/components/website/sections/ContentContainer";
import { CTASection } from "@/components/website/sections/CTASection";
import { DataTable } from "@/components/website/sections/DataTable";
import { FAQAccordion } from "@/components/website/sections/FAQAccordion";
import { FeatureGrid } from "@/components/website/sections/FeatureGrid";
import { PageHero } from "@/components/website/sections/PageHero";
import { SectionDivider } from "@/components/website/sections/SectionDivider";
import { SectionHeader } from "@/components/website/sections/SectionHeader";
import { Timeline } from "@/components/website/sections/Timeline";

import {
  ADMISSIONS_CTA_CONTENT,
  ADMISSIONS_DOCUMENTS_CONTENT,
  ADMISSIONS_ELIGIBILITY_CONTENT,
  ADMISSIONS_FAQ_CONTENT,
  ADMISSIONS_FEES_CONTENT,
  ADMISSIONS_HERO_CONTENT,
  ADMISSIONS_JOURNEY_CONTENT,
  ADMISSIONS_OVERVIEW_CONTENT,
  ADMISSIONS_TIMINGS_CONTENT,
} from "./content";
import { admissionsJsonLd } from "./metadata";
import {
  ADMISSIONS_DOCUMENTS_ITEMS,
  ADMISSIONS_FEES_ITEMS,
  ADMISSIONS_JOURNEY_ITEMS,
  ADMISSIONS_OVERVIEW_BADGES,
} from "./sections";

export function AdmissionsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(admissionsJsonLd) }}
      />

      <PageHero
        title={ADMISSIONS_HERO_CONTENT.title}
        subtitle={ADMISSIONS_HERO_CONTENT.subtitle}
        breadcrumbs={ADMISSIONS_HERO_CONTENT.breadcrumbs}
        cta={ADMISSIONS_HERO_CONTENT.primaryCta}
        secondaryCta={ADMISSIONS_HERO_CONTENT.secondaryCta}
      />

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={ADMISSIONS_OVERVIEW_CONTENT.eyebrow}
            title={ADMISSIONS_OVERVIEW_CONTENT.title}
            description={ADMISSIONS_OVERVIEW_CONTENT.description}
          />
          <div className="mt-6">
            <BadgeGroup badges={ADMISSIONS_OVERVIEW_BADGES} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={ADMISSIONS_JOURNEY_CONTENT.eyebrow}
            title={ADMISSIONS_JOURNEY_CONTENT.title}
          />
          <div className="mt-10">
            <Timeline items={ADMISSIONS_JOURNEY_ITEMS} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={ADMISSIONS_ELIGIBILITY_CONTENT.eyebrow}
            title={ADMISSIONS_ELIGIBILITY_CONTENT.title}
            description={ADMISSIONS_ELIGIBILITY_CONTENT.description}
          />
          <div className="mt-8">
            <DataTable
              caption={ADMISSIONS_ELIGIBILITY_CONTENT.title}
              rows={ADMISSIONS_ELIGIBILITY_CONTENT.rows}
            />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer>
          <SectionHeader
            eyebrow={ADMISSIONS_DOCUMENTS_CONTENT.eyebrow}
            title={ADMISSIONS_DOCUMENTS_CONTENT.title}
            description={ADMISSIONS_DOCUMENTS_CONTENT.description}
          />
          <div className="mt-10">
            <FeatureGrid items={ADMISSIONS_DOCUMENTS_ITEMS} columns={4} />
          </div>
          <Callout variant="warning" title="Before this goes live" className="mt-8">
            {ADMISSIONS_DOCUMENTS_CONTENT.disclaimer}
          </Callout>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer>
          <SectionHeader
            eyebrow={ADMISSIONS_FEES_CONTENT.eyebrow}
            title={ADMISSIONS_FEES_CONTENT.title}
            description={ADMISSIONS_FEES_CONTENT.description}
            align="center"
          />
          <div className="mt-10">
            <FeatureGrid items={ADMISSIONS_FEES_ITEMS} columns={3} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={ADMISSIONS_FAQ_CONTENT.eyebrow}
            title={ADMISSIONS_FAQ_CONTENT.title}
          />
          <div className="mt-10">
            <FAQAccordion items={ADMISSIONS_FAQ_CONTENT.items} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={ADMISSIONS_TIMINGS_CONTENT.eyebrow}
            title={ADMISSIONS_TIMINGS_CONTENT.title}
          />
          <div className="mt-8">
            <DataTable
              caption={ADMISSIONS_TIMINGS_CONTENT.title}
              rows={ADMISSIONS_TIMINGS_CONTENT.rows}
            />
          </div>
        </ContentContainer>
      </section>

      <section className="py-16 sm:pt-4 sm:pb-24">
        <CTASection
          title={ADMISSIONS_CTA_CONTENT.title}
          description={ADMISSIONS_CTA_CONTENT.description}
          primaryCta={ADMISSIONS_CTA_CONTENT.primaryCta}
          secondaryCta={ADMISSIONS_CTA_CONTENT.secondaryCta}
          layout="centered"
        />
      </section>
    </>
  );
}
