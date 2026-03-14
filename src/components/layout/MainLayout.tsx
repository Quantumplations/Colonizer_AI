import InfoPanel from "../ui/InfoPanel";
import TimelineControls from "../ui/TimelineControls";
import SceneCanvas from "../scene/SceneCanvas";
import ModeBadge from "../ui/ModeBadge";

function MainLayout() {
  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100">
      <div className="grid h-full grid-cols-[1fr_320px] grid-rows-[1fr_auto]">
        <div className="relative border-r border-slate-800">
          <SceneCanvas />
          <ModeBadge />
        </div>
        <aside className="row-span-2 overflow-y-auto bg-slate-900/75 p-4">
          <InfoPanel />
        </aside>
        <footer className="border-t border-slate-800 bg-slate-900/75 p-3">
          <TimelineControls />
        </footer>
      </div>
    </div>
  );
}

export default MainLayout;
