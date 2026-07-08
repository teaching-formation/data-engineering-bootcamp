import Sidebar from "@/components/Sidebar";

export default function ModulesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">{children}</div>
    </div>
  );
}
