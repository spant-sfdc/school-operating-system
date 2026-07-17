import { Text } from "@/components/ui/typography";
import { ContentContainer } from "@/components/website/sections/ContentContainer";
import { CTASection } from "@/components/website/sections/CTASection";
import { FeatureGrid } from "@/components/website/sections/FeatureGrid";
import { PageHero } from "@/components/website/sections/PageHero";
import { QuoteBlock } from "@/components/website/sections/QuoteBlock";
import { SectionDivider } from "@/components/website/sections/SectionDivider";
import { SectionHeader } from "@/components/website/sections/SectionHeader";
import { Timeline } from "@/components/website/sections/Timeline";

import {
  ABOUT_CTA_CONTENT,
  ABOUT_HERO_CONTENT,
  ABOUT_MISSION_VISION_CONTENT,
  ABOUT_PRINCIPAL_CONTENT,
  ABOUT_STORY_CONTENT,
  ABOUT_TIMELINE_CONTENT,
  ABOUT_VALUES_CONTENT,
  ABOUT_WHY_CHOOSE_CONTENT,
} from "./content";
import { aboutJsonLd } from "./metadata";
import {
  ABOUT_MISSION_VISION_ITEMS,
  ABOUT_TIMELINE_ITEMS,
  ABOUT_VALUES_ITEMS,
  ABOUT_WHY_CHOOSE_ITEMS,
} from "./sections";

export function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      <PageHero
        title={ABOUT_HERO_CONTENT.title}
        subtitle={ABOUT_HERO_CONTENT.subtitle}
        breadcrumbs={ABOUT_HERO_CONTENT.breadcrumbs}
      />

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader eyebrow={ABOUT_STORY_CONTENT.eyebrow} title={ABOUT_STORY_CONTENT.title} />
          <div className="mt-8 space-y-4">
            {ABOUT_STORY_CONTENT.paragraphs.map((paragraph) => (
              <Text key={paragraph} variant="body" className="text-muted-foreground">
                {paragraph}
              </Text>
            ))}
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer>
          <SectionHeader
            title={ABOUT_MISSION_VISION_CONTENT.title}
            description={ABOUT_MISSION_VISION_CONTENT.description}
            align="center"
          />
          <div className="mt-10">
            <FeatureGrid items={ABOUT_MISSION_VISION_ITEMS} columns={2} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer>
          <SectionHeader
            title={ABOUT_VALUES_CONTENT.title}
            description={ABOUT_VALUES_CONTENT.description}
            align="center"
          />
          <div className="mt-10">
            <FeatureGrid items={ABOUT_VALUES_ITEMS} columns={4} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader title={ABOUT_PRINCIPAL_CONTENT.title} align="center" />
          <div className="mt-10">
            <QuoteBlock
              quote={ABOUT_PRINCIPAL_CONTENT.quote}
              author={ABOUT_PRINCIPAL_CONTENT.author}
              role={ABOUT_PRINCIPAL_CONTENT.role}
              variant="large"
            />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={ABOUT_TIMELINE_CONTENT.eyebrow}
            title={ABOUT_TIMELINE_CONTENT.title}
          />
          <div className="mt-10">
            <Timeline items={ABOUT_TIMELINE_ITEMS} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer>
          <SectionHeader
            title={ABOUT_WHY_CHOOSE_CONTENT.title}
            description={ABOUT_WHY_CHOOSE_CONTENT.description}
            align="center"
          />
          <div className="mt-10">
            <FeatureGrid items={ABOUT_WHY_CHOOSE_ITEMS} columns={3} />
          </div>
        </ContentContainer>
      </section>

      <section className="py-16 sm:pt-4 sm:pb-24">
        <CTASection
          title={ABOUT_CTA_CONTENT.title}
          description={ABOUT_CTA_CONTENT.description}
          primaryCta={ABOUT_CTA_CONTENT.primaryCta}
          secondaryCta={ABOUT_CTA_CONTENT.secondaryCta}
          layout="centered"
        />
      </section>
    </>
  );
}
