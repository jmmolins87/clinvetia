import { fn } from "@storybook/test";

export const useRouter = () => ({
  push: fn(),
  replace: fn(),
  prefetch: fn(),
  back: fn(),
  forward: fn(),
  refresh: fn(),
  pathname: "/",
  query: {},
});

export const usePathname = () => "/";
export const useSearchParams = () => new URLSearchParams();
