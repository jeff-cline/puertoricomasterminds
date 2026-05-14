// tests/components/excursion-card.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExcursionCard } from "@/components/public/excursion-card";

const sample = {
  id: "11111111-1111-1111-1111-111111111111",
  slug: "old-san-juan-walking",
  title: "Old San Juan Walking Tour",
  short_description: "Cobblestone streets and 500 years of history.",
  image_url: "https://example.com/img.jpg",
  price_from_usd: 45,
  duration_min: 120,
  duration_max: 180,
  type: "cruise_day" as const,
  is_hero: true,
  is_active: true,
};

describe("ExcursionCard", () => {
  it("renders title, description, price, and duration", () => {
    render(<ExcursionCard excursion={sample} />);
    expect(screen.getByText(/old san juan walking tour/i)).toBeInTheDocument();
    expect(screen.getByText(/from \$45/i)).toBeInTheDocument();
    expect(screen.getByText(/2–3 hrs/i)).toBeInTheDocument();
  });

  it("links to the gate route with origin slug", () => {
    render(<ExcursionCard excursion={sample} />);
    const link = screen.getByRole("link", { name: /book/i });
    expect(link).toHaveAttribute(
      "href",
      "/gate/excursions:old-san-juan-walking",
    );
  });

  it("shows a Cruise Day badge for cruise_day type", () => {
    render(<ExcursionCard excursion={sample} />);
    expect(screen.getByText(/cruise day/i)).toBeInTheDocument();
  });

  it("shows a Multi-Day badge for multi_day type", () => {
    render(<ExcursionCard excursion={{ ...sample, type: "multi_day" }} />);
    expect(screen.getByText(/multi-day/i)).toBeInTheDocument();
  });
});
