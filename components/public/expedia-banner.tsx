// components/public/expedia-banner.tsx
import Script from "next/script";

export interface ExpediaBannerProps {
  /** Optional override; defaults to "medium-rectangle" (300x250). */
  layout?: "medium-rectangle" | "leaderboard" | "skyscraper";
  /** Visual emphasis for the page (mostly footer = "sailing", coupon page = "sailing"). */
  image?: "sailing" | "beach" | "mountain";
  /** Marketing copy; default keeps PRM's adventure-leaning message. */
  message?: string;
  /** Affiliate campaign reference. Currently a literal "undefined" per user-provided snippet — see spec §13 / §22.3. */
  camref?: string;
}

export function ExpediaBanner({
  layout = "medium-rectangle",
  image = "sailing",
  message = "bye-bye-bucket-list-hello-adventure",
  camref = "undefined",
}: ExpediaBannerProps) {
  return (
    <>
      <div
        className="eg-affiliate-banners"
        data-program="us-expedia"
        data-network="pz"
        data-layout={layout}
        data-image={image}
        data-message={message}
        data-camref={camref}
        data-pubref="Puerto-Rico"
        data-link="activities"
      />
      <Script
        className="eg-affiliate-banners-script"
        src="https://creator.expediagroup.com/products/banners/assets/eg-affiliate-banners.js"
        strategy="afterInteractive"
      />
    </>
  );
}
