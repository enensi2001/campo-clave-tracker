import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { DialogosProvider } from "@/components/crm/dialogs";
import { AppShell } from "@/components/crm/app-shell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Layout,
});

function Layout() {
  return (
    <DialogosProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </DialogosProvider>
  );
}
