import { Text } from "@/components/ui/typography";
import { BadgeGroup } from "@/components/website/sections/BadgeGroup";
import { Callout } from "@/components/website/sections/Callout";
import { ContentContainer } from "@/components/website/sections/ContentContainer";
import { CTASection } from "@/components/website/sections/CTASection";
import { FeatureGrid } from "@/components/website/sections/FeatureGrid";
import { PageHero } from "@/components/website/sections/PageHero";
import { SectionDivider } from "@/components/website/sections/SectionDivider";
import { SectionHeader } from "@/components/website/sections/SectionHeader";

import {
  ACADEMICS_ASSESSMENT_CONTENT,
  ACADEMICS_COCURRICULAR_CONTENT,
  ACADEMICS_CTA_CONTENT,
  ACADEMICS_HERO_CONTENT,
  ACADEMICS_METHODOLOGY_CONTENT,
  ACADEMICS_PHILOSOPHY_CONTENT,
  ACADEMICS_STAGES_CONTENT,
  ACADEMICS_SUBJECTS_CONTENT,
  ACADEMICS_WHY_CONTENT,
} from "./content";
import { academicsJsonLd } from "./metadata";
import {
  ACADEMICS_COCURRICULAR_ITEMS,
  ACADEMICS_METHODOLOGY_ITEMS,
  ACADEMICS_STAGE_ITEMS,
  ACADEMICS_SUBJECT_BADGES,
  ACADEMICS_WHY_ITEMS,
} from "./sections";

export function AcademicsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(academicsJsonLd) }}
      />

      <PageHero
        title={ACADEMICS_HERO_CONTENT.title}
        subtitle={ACADEMICS_HERO_CONTENT.subtitle}
        breadcrumbs={ACADEMICS_HERO_CONTENT.breadcrumbs}
        cta={ACADEMICS_HERO_CONTENT.primaryCta}
      />

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={ACADEMICS_PHILOSOPHY_CONTENT.eyebrow}
            title={ACADEMICS_PHILOSOPHY_CONTENT.title}
          />
          <div className="mt-6 space-y-4">
            {ACADEMICS_PHILOSOPHY_CONTENT.paragraphs.map((paragraph) => (
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
            eyebrow={ACADEMICS_STAGES_CONTENT.eyebrow}
            title={ACADEMICS_STAGES_CONTENT.title}
            description={ACADEMICS_STAGES_CONTENT.description}
            align="center"
          />
          <div className="mt-10">
            <FeatureGrid items={ACADEMICS_STAGE_ITEMS} columns={4} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={ACADEMICS_SUBJECTS_CONTENT.eyebrow}
            title={ACADEMICS_SUBJECTS_CONTENT.title}
            description={ACADEMICS_SUBJECTS_CONTENT.description}
          />
          <div className="mt-6">
            <BadgeGroup badges={ACADEMICS_SUBJECT_BADGES} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer>
          <SectionHeader
            eyebrow={ACADEMICS_METHODOLOGY_CONTENT.eyebrow}
            title={ACADEMICS_METHODOLOGY_CONTENT.title}
            description={ACADEMICS_METHODOLOGY_CONTENT.description}
            align="center"
          />
          <div className="mt-10">
            <FeatureGrid items={ACADEMICS_METHODOLOGY_ITEMS} columns={3} />
          </div>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer>
          <SectionHeader
            eyebrow={ACADEMICS_COCURRICULAR_CONTENT.eyebrow}
            title={ACADEMICS_COCURRICULAR_CONTENT.title}
            description={ACADEMICS_COCURRICULAR_CONTENT.description}
            align="center"
          />
          <div className="mt-10">
            <FeatureGrid items={ACADEMICS_COCURRICULAR_ITEMS} columns={4} />
          </div>
          <Callout variant="info" title="Before this goes live" className="mt-8">
            {ACADEMICS_COCURRICULAR_CONTENT.disclaimer}
          </Callout>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer width="md">
          <SectionHeader
            eyebrow={ACADEMICS_ASSESSMENT_CONTENT.eyebrow}
            title={ACADEMICS_ASSESSMENT_CONTENT.title}
            description={ACADEMICS_ASSESSMENT_CONTENT.description}
          />
          <Callout variant="warning" title="Before this goes live" className="mt-8">
            {ACADEMICS_ASSESSMENT_CONTENT.disclaimer}
          </Callout>
        </ContentContainer>
      </section>

      <ContentContainer>
        <SectionDivider />
      </ContentContainer>

      <section className="py-16 sm:py-20">
        <ContentContainer>
          <SectionHeader
            eyebrow={ACADEMICS_WHY_CONTENT.eyebrow}
            title={ACADEMICS_WHY_CONTENT.title}
            align="center"
          />
          <div className="mt-10">
            <FeatureGrid items={ACADEMICS_WHY_ITEMS} columns={3} />
          </div>
        </ContentContainer>
      </section>

      <section className="py-16 sm:pt-4 sm:pb-24">
        <CTASection
          title={ACADEMICS_CTA_CONTENT.title}
          description={ACADEMICS_CTA_CONTENT.description}
          primaryCta={ACADEMICS_CTA_CONTENT.primaryCta}
          secondaryCta={ACADEMICS_CTA_CONTENT.secondaryCta}
          layout="centered"
        />
      </section>
    </>
  );
}
