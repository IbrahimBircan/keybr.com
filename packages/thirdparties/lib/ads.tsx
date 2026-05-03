import { type ReactNode } from "react";

export function SetupAds({
  children,
}: {
  readonly children: ReactNode;
}): ReactNode {
  return <>{children}</>;
}

export const AdBanner = function AdBanner(): ReactNode {
  return null;
};
