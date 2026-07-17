import { Fragment } from "react";

import { Callout } from "@/components/website/sections/Callout";
import { ContentContainer } from "@/components/website/sections/ContentContainer";
import { CTASection } from "@/components/website/sections/CTASection";
import { FAQAccordion } from "@/components/website/sections/FAQAccordion";
import { FeatureGrid } from "@/components/website/sections/FeatureGrid";
import { PageHero } from "@/components/website/sections/PageHero";
import { SectionDivider } from "@/components/website/sections/SectionDivider";
import { SectionHeader } from "@/components/website/sections/SectionHeader";

import {
  DOCUMENT_CENTER_CIRCULARS_CONTENT,
  DOCUMENT_CENTER_CTA_CONTENT,
  DOCUMENT_CENTER_FAQ_CONTENT,
  DOCUMENT_CENTER_HERO_CONTENT,
  DOCUMENT_CENTER_OVERVIEW_CONTENT,
} from "./content";
import { documentCenterJsonLd } from "./metadata";
import { DOCUMENT_CENTER_CATEGORY_SECTIONS, DOCUMENT_CENTER_OVERVIEW_ITEMS } from "./sections";

export function DocumentCenterPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(documentCenterJsonLd) }}
      />

      <PageHero
        title={DOCUMENT_CENTER_HERO_CONTENT.title}
        subtitle={DOCUMENT_CENTER_HERO_CONTENT.subtitle}
        breadcrumbs={DOCUMENT_CENTER_HERO_CONTENT.breadcrumbs}
        cta={DOCUMENT_CENTER_HERO_CONTENT.primaryCta}
      />

      <section className="py-16 sm:py-20">
        <ContentContainer>
          <SectionHeader
            eyebrow={DOCUMENT_CENTER_OVERVIEW_CONTENT.eyebrow}
            title={DOCUMENT_CENTER_OVERVIEW_CONTENT.title}
            description={DOCUMENT_CENTER_OVERVIEW_CONTENT.description}
            align="center"
          />
          <div className="mt-10">
            <FeatureGrid items={DOCUMENT_CENTER_OVERVIEW_ITEMS} columns={4} />
          </div>
        </ContentContainer>
      </section>

      {/*
        Every category section below is rendered from DOCUMENT_CENTER_CATEGORY_SECTIONS —
        a future category (e.g. Transport Documents) becomes a new array entry, not a new
        block of JSX. See README.md "Designed for Configuration, Not Yet Configuration-Driven".
      */}
      {DOCUMENT_CENTER_CATEGORY_SECTIONS.map((category) => (
        <Fragment key={category.id}>
          <ContentContainer>
            <SectionDivider />
          </ContentContainer>

          <section className="py-16 sm:py-20">
            <ContentContainer>
              <SectionHeader
                eyebrow={category.eyebrow}
                title={category.title}
                description={category.description}
                align="center"
              />
              <div className="mt-10">
                <FeatureGrid items={category.items} columns={category.items.length === 4 ? 4 : 3} />
              </div>
              {category.disclaimer && (
                <Callout variant="info" title="Before this goes live" className="mt-8">
                  {category.disclaimer}
                </Callout>
              )}
            </ContentContainer>
          </section>
        </Fragment>
      ))}

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={DOCUMENT_CENTER_CIRCULARS_CONTENT.eyebrow}
            title={DOCUMENT_CENTER_CIRCULARS_CONTENT.title}
            description={DOCUMENT_CENTER_CIRCULARS_CONTENT.description}
          />
          <Callout variant="info" title="Before this goes live" className="mt-6">
            {DOCUMENT_CENTER_CIRCULARS_CONTENT.disclaimer}
          </Callout>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={DOCUMENT_CENTER_FAQ_CONTENT.eyebrow}
            title={DOCUMENT_CENTER_FAQ_CONTENT.title}
          />
          <div className="mt-10">
            <FAQAccordion items={DOCUMENT_CENTER_FAQ_CONTENT.items} />
          </div>
        </ContentContainer>
      </section>

      <section className="py-16 sm:pt-4 sm:pb-24">
        <CTASection
          title={DOCUMENT_CENTER_CTA_CONTENT.title}
          description={DOCUMENT_CENTER_CTA_CONTENT.description}
          primaryCta={DOCUMENT_CENTER_CTA_CONTENT.primaryCta}
          secondaryCta={DOCUMENT_CENTER_CTA_CONTENT.secondaryCta}
          layout="centered"
        />
      </section>
    </>
  );
}
