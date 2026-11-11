import {
  Cpu, FlaskConical, HeartPulse, Leaf, Palette, PawPrint, Scale, Users, UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { CategoryId, Recognition } from "@/types";

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Tailwind classes — literal strings so the JIT compiler keeps them.
   *  The category's hue is an ink stamp only: `dot` fills the 8px stamp, `ink` colours a plain icon.
   *  Areas stay neutral (`chip`); red is reserved for holidays and the current day. */
  chip: string;
  ink: string;
  dot: string;
  /** @deprecated No longer used: categories no longer tint card backgrounds. */
  tile: string;
  ring: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "animals", label: "Animals", icon: PawPrint,
    description: "Wildlife, pets and the creatures we share the planet with.",
    chip: "bg-surface-2 text-fg", ink: "text-[#a16207] dark:text-[#e0a63c]",
    dot: "bg-[#a16207] dark:bg-[#e0a63c]", tile: "", ring: "ring-[#a16207]/40",
  },
  {
    id: "technology", label: "Technology", icon: Cpu,
    description: "Computing, the internet, security and the people who build them.",
    chip: "bg-surface-2 text-fg", ink: "text-[#1d4ed8] dark:text-[#7aa2ff]",
    dot: "bg-[#1d4ed8] dark:bg-[#7aa2ff]", tile: "", ring: "ring-[#1d4ed8]/40",
  },
  {
    id: "science", label: "Science", icon: FlaskConical,
    description: "Discovery, space, mathematics and the natural world explained.",
    chip: "bg-surface-2 text-fg", ink: "text-[#0e7490] dark:text-[#4cc3d9]",
    dot: "bg-[#0e7490] dark:bg-[#4cc3d9]", tile: "", ring: "ring-[#0e7490]/40",
  },
  {
    id: "environment", label: "Environment", icon: Leaf,
    description: "Climate, oceans, forests, water and a liveable planet.",
    chip: "bg-surface-2 text-fg", ink: "text-[#15803d] dark:text-[#5cc98a]",
    dot: "bg-[#15803d] dark:bg-[#5cc98a]", tile: "", ring: "ring-[#15803d]/40",
  },
  {
    id: "food", label: "Food & Drink", icon: UtensilsCrossed,
    description: "Food safety, farming and the dishes people love.",
    chip: "bg-surface-2 text-fg", ink: "text-[#c2410c] dark:text-[#ff8a4c]",
    dot: "bg-[#c2410c] dark:bg-[#ff8a4c]", tile: "", ring: "ring-[#c2410c]/40",
  },
  {
    id: "health", label: "Health", icon: HeartPulse,
    description: "Physical and mental health, medicine and wellbeing.",
    chip: "bg-surface-2 text-fg", ink: "text-[#be185d] dark:text-[#f472b6]",
    dot: "bg-[#be185d] dark:bg-[#f472b6]", tile: "", ring: "ring-[#be185d]/40",
  },
  {
    id: "culture", label: "Culture & Heritage", icon: Palette,
    description: "Festivals, arts, languages, faiths and national celebrations.",
    chip: "bg-surface-2 text-fg", ink: "text-[#a21caf] dark:text-[#e879f9]",
    dot: "bg-[#a21caf] dark:bg-[#e879f9]", tile: "", ring: "ring-[#a21caf]/40",
  },
  {
    id: "relationships", label: "Relationships", icon: Users,
    description: "Family, friendship, kindness and the people who matter.",
    chip: "bg-surface-2 text-fg", ink: "text-[#db2777] dark:text-[#ff8fbf]",
    dot: "bg-[#db2777] dark:bg-[#ff8fbf]", tile: "", ring: "ring-[#db2777]/40",
  },
  {
    id: "society", label: "Society & Rights", icon: Scale,
    description: "Peace, human rights, education and global cooperation.",
    chip: "bg-surface-2 text-fg", ink: "text-[#475569] dark:text-[#a3b1c4]",
    dot: "bg-[#475569] dark:bg-[#a3b1c4]", tile: "", ring: "ring-[#475569]/40",
  },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, CategoryMeta>;

export interface RecognitionMeta {
  id: Recognition;
  label: string;
  short: string;
  description: string;
  badge: string;
}

export const RECOGNITIONS: RecognitionMeta[] = [
  {
    id: "un", label: "UN International Day", short: "UN Official",
    description: "Proclaimed by the UN General Assembly or a UN specialised agency (UNESCO, WHO, FAO…).",
    badge: "border-transparent bg-fg/[.06] text-fg",
  },
  {
    id: "international", label: "International Observance", short: "International",
    description: "Coordinated by an international organisation outside the UN system.",
    badge: "border-transparent bg-fg/[.06] text-fg",
  },
  {
    id: "national", label: "National Holiday", short: "National Holiday",
    description: "A public or national holiday in one or more countries.",
    badge: "border-transparent bg-primary-soft text-primary-ink",
  },
  {
    id: "observance", label: "National Observance", short: "Observance",
    description: "An official or nationally recognised day that is not a public holiday (offices stay open).",
    badge: "border-transparent bg-fg/[.06] text-fg",
  },
  {
    id: "cultural", label: "Cultural / Religious", short: "Cultural",
    description: "A cultural, traditional or religious celebration.",
    badge: "border-transparent bg-fg/[.06] text-fg",
  },
  {
    id: "awareness", label: "Awareness Day", short: "Awareness",
    description: "An awareness campaign led by NGOs, foundations or industry groups.",
    badge: "border-transparent bg-fg/[.06] text-fg",
  },
  {
    id: "unofficial", label: "Unofficial / Fun Day", short: "Unofficial",
    description: "A grassroots or just-for-fun day without formal recognition.",
    badge: "border-transparent bg-fg/[.06] text-fg",
  },
  {
    id: "event", label: "One-time Event", short: "One-time",
    description: "A dated event such as an eclipse — it happens once rather than every year.",
    badge: "border-transparent bg-fg/[.06] text-fg",
  },
];

export const RECOGNITION_MAP = Object.fromEntries(RECOGNITIONS.map((r) => [r.id, r])) as Record<Recognition, RecognitionMeta>;
