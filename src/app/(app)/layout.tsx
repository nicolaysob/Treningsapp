import { ShellProvider } from "@/components/layout/ShellProvider";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return <ShellProvider>{children}</ShellProvider>;
}
