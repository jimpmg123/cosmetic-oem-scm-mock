# Dev / test UI components

Components here are for **experiments and demos**, not production nav by default.

## Section rail (`@/components/ui/section-rail-nav`)

ChatGPT-style **right-edge section navigator**:

- Thin horizontal ticks on the right
- Hover → popover with section titles (truncated)
- Click → smooth scroll to section `id`
- Active section tick is darker (IntersectionObserver)

### Demo page

`/dev/section-rail`

### Usage on a long management page

```tsx
import { SectionRailNav } from "@/components/ui/section-rail-nav";

const SECTIONS = [
  { id: "summary", label: "요약" },
  { id: "basic", label: "기본 정보" },
];

// Each block needs matching id + scroll-mt for fixed header
<section id="summary" className="scroll-mt-[72px]">...</section>

<SectionRailNav sections={SECTIONS} scrollOffsetPx={72} />
```

When the page scrolls inside `<main>` instead of the window, pass `scrollRootRef` pointing at that element.
