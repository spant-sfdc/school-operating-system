export interface FAQAccordionItem {
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  items: FAQAccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}
